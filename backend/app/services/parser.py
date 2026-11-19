import os
import re
import uuid
from pathlib import Path
from typing import Tuple, Dict, Any, List

import pymupdf  # PyMuPDF
from docx import Document
from fastapi import UploadFile, HTTPException, status

from app.core.config import settings

class ResumeParserError(Exception):
    def __init__(self, message: str, code: str = "PARSE_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)

class ResumeParserService:
    @staticmethod
    def validate_file(file: UploadFile) -> Tuple[str, str]:
        """Validates extension, MIME type, and size."""
        filename = file.filename or ""
        ext = os.path.splitext(filename)[1].lower()

        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Only PDF (.pdf) and Word (.docx) files are supported."
            )

        # Check content type if available
        if file.content_type and file.content_type not in settings.ALLOWED_MIME_TYPES:
            # Some browsers pass generic octet-stream for docx, so allow if extension is valid
            if not (ext == ".docx" and file.content_type in ["application/octet-stream", "application/zip"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid MIME type '{file.content_type}' for resume upload."
                )

        return filename, ext

    @staticmethod
    async def save_uploaded_file(file: UploadFile, user_id: str) -> Tuple[str, Path, int]:
        """Saves file to secure internal storage path using UUID."""
        filename, ext = ResumeParserService.validate_file(file)

        # Secure unique filename
        stored_filename = f"{user_id}_{uuid.uuid4().hex}{ext}"
        target_path = settings.UPLOAD_DIR / stored_filename

        content = await file.read()
        file_size = len(content)

        if file_size > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB."
            )

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded resume file is empty (0 bytes)."
            )

        with open(target_path, "wb") as f:
            f.write(content)

        return filename, target_path, file_size

    @staticmethod
    def parse_file(file_path: Path, ext: str) -> Dict[str, Any]:
        """
        Extracts raw text, detects if scanned/image-based,
        and parses sections from PDF or DOCX.
        """
        if ext == ".pdf":
            return ResumeParserService._parse_pdf(file_path)
        elif ext == ".docx":
            return ResumeParserService._parse_docx(file_path)
        else:
            raise ResumeParserError(f"Unsupported extension {ext}")

    @staticmethod
    def _parse_pdf(file_path: Path) -> Dict[str, Any]:
        try:
            doc = pymupdf.open(str(file_path))
        except Exception as e:
            raise ResumeParserError(f"Unable to read PDF file. File may be corrupted or malformed. Details: {str(e)}", "CORRUPTED_FILE")

        if doc.is_encrypted:
            doc.close()
            raise ResumeParserError(
                "The PDF resume is password-protected or encrypted. Please remove password protection and re-upload.",
                "PASSWORD_PROTECTED"
            )

        total_pages = len(doc)
        if total_pages == 0:
            doc.close()
            raise ResumeParserError("The uploaded PDF has no pages.", "EMPTY_FILE")

        full_text_parts = []
        total_images = 0

        for page_idx in range(total_pages):
            page = doc[page_idx]
            text = page.get_text()
            full_text_parts.append(text)
            images = page.get_images()
            total_images += len(images)

        doc.close()

        raw_text = "\n".join(full_text_parts).strip()
        text_length = len(raw_text)

        # Scanned PDF Detection:
        # If very little selectable text (< 50 chars) but has images or multi-page with under 100 chars
        is_scanned = False
        if text_length < 50 or (total_images > 0 and (text_length / max(1, total_pages)) < 40):
            is_scanned = True

        sections = ResumeParserService.extract_sections(raw_text)

        return {
            "raw_text": raw_text,
            "text_length": text_length,
            "total_pages": total_pages,
            "is_scanned": is_scanned,
            "sections": sections,
        }

    @staticmethod
    def _parse_docx(file_path: Path) -> Dict[str, Any]:
        try:
            doc = Document(str(file_path))
        except Exception as e:
            raise ResumeParserError(f"Unable to read DOCX file. File may be corrupted. Details: {str(e)}", "CORRUPTED_FILE")

        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        # Also extract table text
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)

        raw_text = "\n".join(paragraphs).strip()
        text_length = len(raw_text)
        is_scanned = text_length < 20

        sections = ResumeParserService.extract_sections(raw_text)

        return {
            "raw_text": raw_text,
            "text_length": text_length,
            "total_pages": max(1, len(paragraphs) // 30),
            "is_scanned": is_scanned,
            "sections": sections,
        }

    @staticmethod
    def extract_sections(text: str) -> Dict[str, str]:
        """
        Segments raw text into recognized resume sections using regex patterns.
        """
        section_headers = {
            "summary": [
                r"\b(professional\s+summary|summary|profile|about\s+me|objective|career\s+objective)\b"
            ],
            "skills": [
                r"\b(technical\s+skills|skills\s*(?:&|and)\s*tools|skills|core\s+competencies|technologies|areas\s+of\s+expertise|programming\s+languages)\b"
            ],
            "experience": [
                r"\b(work\s+experience|professional\s+experience|experience|employment\s+history|internships?|work\s+history)\b"
            ],
            "education": [
                r"\b(education|academic\s+background|qualifications|academic\s+qualifications|degrees?)\b"
            ],
            "projects": [
                r"\b(projects|personal\s+projects|academic\s+projects|key\s+projects|portfolio)\b"
            ],
            "certifications": [
                r"\b(certifications?|licenses?|courses|achievements|honors\s*(?:&|and)\s*awards)\b"
            ]
        }

        # Build combined pattern to find all header positions
        all_patterns = []
        for sec, patterns in section_headers.items():
            for p in patterns:
                all_patterns.append((sec, p))

        # Split text into lines to look for heading lines
        lines = text.split("\n")
        section_matches = []  # (line_idx, section_name)

        for i, line in enumerate(lines):
            clean_line = line.strip()
            # Only test lines that look like headers (short, usually <= 6 words)
            if 0 < len(clean_line.split()) <= 6:
                for sec, pattern in all_patterns:
                    if re.match(f"^{pattern}[:]?$", clean_line, re.IGNORECASE):
                        section_matches.append((i, sec))
                        break

        extracted = {
            "summary": "",
            "skills": "",
            "experience": "",
            "education": "",
            "projects": "",
            "certifications": "",
            "general": ""
        }

        if not section_matches:
            # If no explicit headings found, store all under general
            extracted["general"] = text
            return extracted

        # Slice lines between detected headings
        for idx in range(len(section_matches)):
            start_line, sec_name = section_matches[idx]
            end_line = section_matches[idx + 1][0] if idx + 1 < len(section_matches) else len(lines)
            content = "\n".join(lines[start_line + 1:end_line]).strip()
            if extracted[sec_name]:
                extracted[sec_name] += "\n" + content
            else:
                extracted[sec_name] = content

        # Put headerless top content into summary if not present
        if section_matches[0][0] > 0:
            top_content = "\n".join(lines[:section_matches[0][0]]).strip()
            if not extracted["summary"]:
                extracted["summary"] = top_content
            else:
                extracted["general"] = top_content

        return extracted

