import React, { useState } from 'react';
import { FileCode, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const SAMPLE_JDS = [
  {
    title: "FastAPI / Python Backend Engineer",
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
    title: "Full Stack React & Node.js Developer",
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
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 transition">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <FileCode className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-white">Target Job Description (Optional)</h4>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Paste specific job description to extract bespoke technical requirements and compare.
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Job Description Text:</label>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Insert Sample JD:</span>
              {SAMPLE_JDS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(s)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
                >
                  {s.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={5}
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            placeholder="Paste job posting here (e.g. responsibilities, required qualifications, experience requirements)..."
            className="w-full p-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition"
          />

          <p className="text-[11px] text-slate-500">
            Tip: The engine extracts specific required years of experience, degrees, and technical libraries directly from this text and merges them with predefined role keywords.
          </p>
        </div>
      )}
    </div>
  );
};

