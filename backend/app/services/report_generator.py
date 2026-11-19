import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from reportlab.pdfgen import canvas

from app.core.config import settings

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Footer
        footer_text = f"UniSkill ATS Resume Intelligence Engine | Page {self._pageNumber} of {page_count}"
        self.drawString(54, 30, footer_text)
        self.drawRightString(612 - 54, 30, datetime.now().strftime("%B %d, %Y"))

        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 42, 612 - 54, 42)

        self.restoreState()


class ReportGeneratorService:
    @staticmethod
    def generate_pdf_report(
        analysis_id: str,
        candidate_name: str,
        candidate_email: str,
        target_role: str,
        analysis_data: Dict[str, Any]
    ) -> Path:
        """
        Builds a comprehensive, multi-page professional PDF report using ReportLab.
        """
        output_filename = f"uniskill_report_{analysis_id}.pdf"
        output_path = settings.REPORTS_DIR / output_filename

        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            leftMargin=40,
            rightMargin=40,
            topMargin=40,
            bottomMargin=50
        )

        styles = getSampleStyleSheet()

        # Custom Palette
        PRIMARY = colors.HexColor("#3b82f6")      # Vibrant Blue
        DARK = colors.HexColor("#0f172a")         # Slate 900
        MUTED = colors.HexColor("#475569")        # Slate 600
        SUCCESS = colors.HexColor("#10b981")      # Emerald 500
        DANGER = colors.HexColor("#ef4444")       # Rose 500
        AMBER = colors.HexColor("#f59e0b")        # Amber 500
        BG_LIGHT = colors.HexColor("#f8fafc")     # Slate 50
        BORDER = colors.HexColor("#e2e8f0")       # Slate 200

        # Custom Typography
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=DARK
        )

        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=13,
            textColor=PRIMARY
        )

        h2_style = ParagraphStyle(
            "Heading2Custom",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=DARK,
            spaceBefore=10,
            spaceAfter=4
        )

        body_style = ParagraphStyle(
            "BodyCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=DARK
        )

        bullet_style = ParagraphStyle(
            "BulletCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11.5,
            textColor=MUTED,
            leftIndent=12
        )

        meta_label_style = ParagraphStyle(
            "MetaLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=MUTED
        )

        meta_val_style = ParagraphStyle(
            "MetaVal",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=11,
            textColor=DARK
        )

        story = []

        # 1. Header Banner
        header_table_data = [
            [
                Paragraph("<b>UNISKILL</b> <font color='#6366f1'>|</font> ATS RESUME SCANNER", title_style),
                Paragraph(f"<b>ANALYSIS ID:</b> {analysis_id[:8].upper()}<br/><font color='#64748b'>Date: {datetime.now().strftime('%b %d, %Y')}</font>", ParagraphStyle('HRight', parent=body_style, alignment=2))
            ]
        ]
        header_table = Table(header_table_data, colWidths=[330, 202])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(header_table)
        story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=4, spaceAfter=10))

        # 2. Metadata Box
        meta_data = [
            [
                Paragraph("CANDIDATE NAME", meta_label_style),
                Paragraph("CONTACT EMAIL", meta_label_style),
                Paragraph("TARGET JOB ROLE", meta_label_style),
                Paragraph("ALGORITHM VERSION", meta_label_style)
            ],
            [
                Paragraph(f"<b>{candidate_name}</b>", meta_val_style),
                Paragraph(candidate_email, meta_val_style),
                Paragraph(f"<b>{target_role}</b>", meta_val_style),
                Paragraph(f"v1.0.0 (Deterministic NLP)", meta_val_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[133, 133, 140, 126])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 12))

        # 3. Overall Score Card & Executive Summary
        overall_score = analysis_data.get("overall_score", 0.0)
        score_color = SUCCESS if overall_score >= 80 else (AMBER if overall_score >= 60 else DANGER)
        score_tier = "EXCELLENT MATCH" if overall_score >= 80 else ("GOOD COMPATIBILITY" if overall_score >= 60 else "NEEDS OPTIMIZATION")

        score_box_data = [
            [
                Paragraph(f"<font size='32' color='{score_color.hexval()}'><b>{overall_score:.1f}</b></font><font size='14' color='#64748b'> / 100</font><br/><font size='9' color='{score_color.hexval()}'><b>{score_tier}</b></font>", ParagraphStyle('ScoreC', alignment=1)),
                Paragraph(
                    f"<b>Executive Summary:</b><br/>"
                    f"This candidate's resume has been evaluated against the <b>{target_role}</b> baseline using exact keyword matching, "
                    f"synonym expansion, and contextual scoring. "
                    f"Keyword coverage stands at <b>{analysis_data.get('keyword_metrics', {}).get('coverage_percentage', 0)}%</b> with "
                    f"<b>{len(analysis_data.get('skill_matches', {}).get('required_matched', []))}</b> required skills confirmed. "
                    f"Follow the recommendations below to maximize pass-through rates.",
                    body_style
                )
            ]
        ]
        score_box = Table(score_box_data, colWidths=[150, 382])
        score_box.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('BOX', (0, 0), (-1, -1), 1, BORDER),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(score_box)
        story.append(Spacer(1, 14))

        # 4. Detailed 7-Category Breakdown Table
        story.append(Paragraph("<b>Category Score Breakdown</b>", h2_style))
        cat_scores = analysis_data.get("category_scores", {})
        weights = analysis_data.get("weights", {})

        categories_info = [
            ("Required Technical Skills", weights.get("required_skills", 0.30), cat_scores.get("required_skills", 0.0)),
            ("Preferred Technical Skills", weights.get("preferred_skills", 0.10), cat_scores.get("preferred_skills", 0.0)),
            ("Keyword Density & Coverage", weights.get("keyword_relevance", 0.20), cat_scores.get("keyword_relevance", 0.0)),
            ("Work Experience Relevance", weights.get("experience_relevance", 0.15), cat_scores.get("experience_relevance", 0.0)),
            ("Academic & Education Relevance", weights.get("education_relevance", 0.10), cat_scores.get("education_relevance", 0.0)),
            ("Project Experience Relevance", weights.get("project_relevance", 0.10), cat_scores.get("project_relevance", 0.0)),
            ("Resume Structure & Formatting", weights.get("formatting", 0.05), cat_scores.get("formatting", 0.0)),
        ]

        breakdown_table_data = [
            [
                Paragraph("<b>Evaluation Category</b>", meta_label_style),
                Paragraph("<b>Weight</b>", meta_label_style),
                Paragraph("<b>Normalized Score</b>", meta_label_style),
                Paragraph("<b>Earned Points</b>", meta_label_style),
                Paragraph("<b>Status</b>", meta_label_style)
            ]
        ]

        for cat_name, w, s in categories_info:
            earned = w * s * 100.0
            status_text = "Strong" if s >= 0.75 else ("Fair" if s >= 0.50 else "Low")
            status_color = SUCCESS if s >= 0.75 else (AMBER if s >= 0.50 else DANGER)

            breakdown_table_data.append([
                Paragraph(cat_name, body_style),
                Paragraph(f"{int(w * 100)}%", body_style),
                Paragraph(f"{s:.2f} / 1.00", body_style),
                Paragraph(f"<b>{earned:.1f}</b> / {int(w * 100)}", body_style),
                Paragraph(f"<font color='{status_color.hexval()}'><b>{status_text}</b></font>", body_style)
            ])

        breakdown_table = Table(breakdown_table_data, colWidths=[200, 65, 95, 95, 77])
        breakdown_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(breakdown_table)
        story.append(Spacer(1, 14))

        # 5. Skills Match Matrix
        story.append(Paragraph("<b>Detailed Skills Matrix</b>", h2_style))
        skill_matches = analysis_data.get("skill_matches", {})
        req_matched = [m["skill_name"] for m in skill_matches.get("required_matched", [])]
        req_missing = [m["skill_name"] for m in skill_matches.get("required_missing", [])]
        pref_matched = [m["skill_name"] for m in skill_matches.get("preferred_matched", [])]
        pref_missing = [m["skill_name"] for m in skill_matches.get("preferred_missing", [])]
        partial_m = [m["skill_name"] for m in skill_matches.get("partial_matched", [])]

        skills_table_data = [
            [
                Paragraph("<b>Required Skills Matched:</b><br/>" + (", ".join(req_matched) if req_matched else "<i>None detected</i>"), ParagraphStyle('SM', parent=body_style, textColor=colors.HexColor("#065f46"))),
                Paragraph("<b>Required Skills Missing:</b><br/>" + (", ".join(req_missing) if req_missing else "<i>None! 100% covered</i>"), ParagraphStyle('SM2', parent=body_style, textColor=colors.HexColor("#991b1b")))
            ],
            [
                Paragraph("<b>Preferred Skills Matched:</b><br/>" + (", ".join(pref_matched) if pref_matched else "<i>None detected</i>"), ParagraphStyle('SM3', parent=body_style, textColor=colors.HexColor("#065f46"))),
                Paragraph("<b>Preferred Skills Missing:</b><br/>" + (", ".join(pref_missing) if pref_missing else "<i>None</i>"), ParagraphStyle('SM4', parent=body_style, textColor=colors.HexColor("#991b1b")))
            ]
        ]
        if partial_m:
            skills_table_data.append([
                Paragraph(f"<b>Partially Matched / Synonyms:</b><br/>{', '.join(partial_m)}", ParagraphStyle('SM5', parent=body_style, textColor=colors.HexColor("#92400e"))),
                Paragraph("<i>Note: Ensure industry-standard phrasing for partial matches.</i>", body_style)
            ])

        skills_table = Table(skills_table_data, colWidths=[266, 266])
        skills_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f0fdf4")),
            ('BACKGROUND', (1, 0), (1, -1), colors.HexColor("#fef2f2")),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(skills_table)
        story.append(Spacer(1, 14))

        # 6. Formatting & Structure Audit
        formatting = analysis_data.get("formatting_feedback", {})
        story.append(Paragraph("<b>Resume Structure & Formatting Audit</b>", h2_style))
        passes = formatting.get("passes", [])
        issues = formatting.get("issues", [])

        format_items = []
        for p in passes:
            format_items.append(Paragraph(f"<font color='#10b981'>[PASS]</font> {p}", bullet_style))
        for i in issues:
            format_items.append(Paragraph(f"<font color='#ef4444'>[ADVICE]</font> {i}", bullet_style))

        for f_item in format_items:
            story.append(f_item)
            story.append(Spacer(1, 3))

        story.append(Spacer(1, 10))

        # 7. Actionable Improvement Recommendations
        story.append(Paragraph("<b>Targeted Recommendations for Resume Enhancement</b>", h2_style))
        recommendations = analysis_data.get("recommendations", [])
        for idx, rec in enumerate(recommendations, 1):
            story.append(Paragraph(f"<b>{idx}.</b> {rec}", bullet_style))
            story.append(Spacer(1, 4))

        story.append(Spacer(1, 12))

        # 8. Disclaimer
        disclaimer_text = settings.ATS_DISCLAIMER
        story.append(Paragraph(f"<i><b>Disclaimer:</b> {disclaimer_text}</i>", ParagraphStyle('Discl', parent=body_style, fontSize=7, leading=9, textColor=MUTED)))

        # Build document with custom canvas
        doc.build(story, canvasmaker=NumberedCanvas)
        return output_path

