import React, { useState } from 'react';
import { FileCode, ChevronDown, ChevronUp } from 'lucide-react';

const SAMPLE_JDS = [
  {
    title: "Python Backend Engineer",
    text: `Job Title: Python Backend Engineer
Location: Remote / Hybrid
Experience: 2+ years of relevant experience
Education: Bachelor's in Computer Science or related STEM field

Key Responsibilities:
- Design, build, and maintain high-performance RESTful APIs using Python, FastAPI, and SQLAlchemy.
- Implement robust caching layers using Redis and manage relational database schemas in PostgreSQL.
- Collaborate with frontend engineers to integrate web applications.
- Build automated unit testing with PyTest and maintain CI/CD pipelines in Docker and GitHub Actions.

Required Qualifications:
- Strong proficiency in Python, FastAPI, RESTful APIs, SQL, and PostgreSQL.
- Solid understanding of Data Structures, Algorithms, and Object-Oriented Programming (OOP).
- Experience with Git, Docker, and Microservices.

Preferred Skills:
- Experience with Celery, Redis, AWS Cloud, and Linux.`
  },
  {
    title: "Full Stack Developer",
    text: `Job Title: Full Stack Developer
Experience: 3+ years of experience
Education: Bachelor's Degree in Computer Science

Responsibilities:
- Develop modern, responsive web user interfaces using React, TypeScript, and Tailwind CSS.
- Architect scalable backend microservices using Node.js, Express, and PostgreSQL.
- Optimize web application performance, accessibility, and SEO.

Requirements:
- React, TypeScript, JavaScript, HTML5, CSS3, Node.js, RESTful APIs, Git.
- Experience with SQL and relational databases.

Nice to Have:
- Next.js, Docker, Redis, AWS Cloud.`
  }
];

export const JobDescriptionInput = ({ customJd, setCustomJd }) => {
  const [isOpen, setIsOpen] = useState(false);

  const loadSample = (sample) => {
    setCustomJd(sample.text);
    setIsOpen(true);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm transition">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
            <FileCode className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center space-x-2">
              <span>Paste Specific Job Description</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                Optional
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Paste a custom job posting to extract and match exact role-specific keywords
            </p>
          </div>
        </div>
        <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium">Sample JDs:</span>
            {SAMPLE_JDS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(s)}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium transition"
              >
                {s.title}
              </button>
            ))}
          </div>

          <textarea
            rows={5}
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            placeholder="Paste complete job description text here (including requirements, qualifications, and responsibilities)..."
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
          />

          {customJd && (
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-zinc-400">
              <span>{customJd.length} characters entered</span>
              <button
                type="button"
                onClick={() => setCustomJd('')}
                className="text-rose-600 dark:text-rose-400 hover:underline"
              >
                Clear JD
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
