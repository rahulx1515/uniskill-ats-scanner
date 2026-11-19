import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Check, ChevronRight, Layers, Star } from 'lucide-react';
import { atsService } from '../services/api';

export const RoleSelector = ({ selectedRoleId, onSelectRole }) => {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [roleSkillsPreview, setRoleSkillsPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await atsService.getJobRoles();
        setRoles(data);
        setFilteredRoles(data);
        if (data.length > 0 && !selectedRoleId) {
          onSelectRole(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load job roles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    let result = roles;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'All') {
      result = result.filter(r => r.category === selectedCategory);
    }
    setFilteredRoles(result);
  }, [searchTerm, selectedCategory, roles]);

  useEffect(() => {
    const fetchRoleSkills = async () => {
      if (!selectedRoleId) return;
      try {
        const data = await atsService.getJobRoleSkills(selectedRoleId);
        setRoleSkillsPreview(data);
      } catch (err) {
        console.error("Failed to load skills for role:", err);
      }
    };
    fetchRoleSkills();
  }, [selectedRoleId]);

  const categories = ['All', ...new Set(roles.map(r => r.category))];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search target role (e.g. Python Developer, Data Scientist)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
        {filteredRoles.map((role) => {
          const isSelected = selectedRoleId === role.id;
          return (
            <div
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition text-left flex flex-col justify-between shadow-md ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-600/20 shadow-indigo-500/15'
                  : 'border-white/10 bg-slate-900/80 hover:border-indigo-500/40 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    {role.category}
                  </span>
                  {isSelected && (
                    <span className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{role.title}</h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview of Centralized Backend Keywords for Selected Role */}
      {roleSkillsPreview && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Backend Centralized Skills for: {roleSkillsPreview.title}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {roleSkillsPreview.skills.length} target skills indexed
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-rose-400 mb-1.5 flex items-center space-x-1">
                <span>Required Skills (30% Weight):</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {roleSkillsPreview.skills
                  .filter(s => s.importance === 'Required')
                  .map(s => (
                    <span
                      key={s.skill_id}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium"
                    >
                      {s.skill_name}
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-indigo-400 mb-1.5 mt-2 flex items-center space-x-1">
                <span>Preferred Skills (10% Weight):</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {roleSkillsPreview.skills
                  .filter(s => s.importance === 'Preferred')
                  .map(s => (
                    <span
                      key={s.skill_id}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                    >
                      {s.skill_name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

