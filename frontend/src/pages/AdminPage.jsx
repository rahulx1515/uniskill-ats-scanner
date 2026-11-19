import React, { useState, useEffect } from 'react';
import {
  Settings, Plus, Pencil, Trash2, Search, Loader2, Save, X,
  Briefcase, Tag, Sliders, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Shield, ShieldCheck, UserPlus, Users, Key
} from 'lucide-react';
import { atsService, adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────── Sub-tab Button ────────────────────────────
const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
      active
        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
    <span>{label}</span>
  </button>
);

// ─────────────────────────── Job Roles Tab ──────────────────────────────
const JobRolesTab = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', description: '', required_skills: '', preferred_skills: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await atsService.getJobRoles(search);
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRoles();
  };

  const openCreate = () => {
    setEditingRole(null);
    setForm({ title: '', category: '', description: '', required_skills: '', preferred_skills: '' });
    setShowForm(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setForm({
      title: role.title,
      category: role.category || '',
      description: role.description || '',
      required_skills: '',
      preferred_skills: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const payload = {
        title: form.title,
        category: form.category || null,
        description: form.description || null,
        required_skill_names: form.required_skills ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferred_skill_names: form.preferred_skills ? form.preferred_skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      if (editingRole) {
        await adminService.updateJobRole(editingRole.id, payload);
        setMessage({ type: 'success', text: `Role "${form.title}" updated.` });
      } else {
        await adminService.createJobRole(payload);
        setMessage({ type: 'success', text: `Role "${form.title}" created.` });
      }
      setShowForm(false);
      fetchRoles();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete job role "${title}"? This may affect existing analyses.`)) return;
    try {
      await adminService.deleteJobRole(id);
      setMessage({ type: 'success', text: `Role "${title}" deleted.` });
      fetchRoles();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Delete failed.' });
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`flex items-center space-x-2 p-3 rounded-xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button type="submit" className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 font-semibold transition">Go</button>
        </form>
        <button onClick={openCreate} className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{editingRole ? 'Edit Job Role' : 'Create Job Role'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
          </div>
          {!editingRole && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Required Skills (comma separated)</label>
                <input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} placeholder="Java, Spring Boot, SQL..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Preferred Skills (comma separated)</label>
                <input value={form.preferred_skills} onChange={(e) => setForm({ ...form, preferred_skills: e.target.value })} placeholder="Docker, Kubernetes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
              </div>
            </>
          )}
          <button type="submit" disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white text-xs font-bold transition">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}</span>
          </button>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-xl backdrop-blur-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-white/10">
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider">Role Title & Description</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider hidden lg:table-cell">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-white/5 transition">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-white">{role.title}</p>
                    {role.description && (
                      <p className="text-xs text-slate-300 font-medium mt-1 max-w-lg leading-relaxed">
                        {role.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs font-semibold">
                      {role.category || 'General'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      role.is_active !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {role.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => openEdit(role)}
                        title="Edit Job Role"
                        className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-indigo-600/30 border border-white/10 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id, role.title)}
                        title="Delete Job Role"
                        className="p-2 rounded-xl text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/20 border border-white/10 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {roles.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">No job roles found.</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────── Keywords Tab ────────────────────────────────
const KeywordsTab = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingKw, setEditingKw] = useState(null);
  const [form, setForm] = useState({ keyword: '', category: '', synonyms: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const data = await atsService.getKeywords(search, '', 200);
      setKeywords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeywords(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchKeywords();
  };

  const openCreate = () => {
    setEditingKw(null);
    setForm({ keyword: '', category: '', synonyms: '' });
    setShowForm(true);
  };

  const openEdit = (kw) => {
    setEditingKw(kw);
    setForm({
      keyword: kw.keyword,
      category: kw.category || '',
      synonyms: kw.synonyms ? kw.synonyms.join(', ') : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const payload = {
        keyword: form.keyword,
        category: form.category || null,
        synonyms: form.synonyms ? form.synonyms.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      if (editingKw) {
        await adminService.updateKeyword(editingKw.id, payload);
        setMessage({ type: 'success', text: `Keyword "${form.keyword}" updated.` });
      } else {
        await adminService.createKeyword(payload);
        setMessage({ type: 'success', text: `Keyword "${form.keyword}" created.` });
      }
      setShowForm(false);
      fetchKeywords();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, keyword) => {
    if (!confirm(`Delete keyword "${keyword}"?`)) return;
    try {
      await adminService.deleteKeyword(id);
      setMessage({ type: 'success', text: `Keyword "${keyword}" deleted.` });
      fetchKeywords();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Delete failed.' });
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`flex items-center space-x-2 p-3 rounded-xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search keywords..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <button type="submit" className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 font-semibold transition">Go</button>
        </form>
        <button onClick={openCreate} className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Keyword</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{editingKw ? 'Edit Keyword' : 'Create Keyword'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Keyword *</label>
              <input required value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Programming Language"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Synonyms (comma separated)</label>
            <input value={form.synonyms} onChange={(e) => setForm({ ...form, synonyms: e.target.value })} placeholder="ReactJS, React.js..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white text-xs font-bold transition">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : editingKw ? 'Update Keyword' : 'Create Keyword'}</span>
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {keywords.map((kw) => (
            <div key={kw.id} className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 flex items-start justify-between group hover:border-indigo-500/40 transition shadow-md">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{kw.keyword}</p>
                <p className="text-xs text-blue-300 font-medium mt-0.5">{kw.category || 'Uncategorized'}</p>
                {kw.synonyms && kw.synonyms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {kw.synonyms.slice(0, 3).map((syn, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/5">{syn}</span>
                    ))}
                    {kw.synonyms.length > 3 && (
                      <span className="text-[10px] text-slate-300 font-medium">+{kw.synonyms.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <button onClick={() => openEdit(kw)} className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-white/5 hover:bg-indigo-600/30 border border-white/10 transition">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(kw.id, kw.keyword)} className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/20 border border-white/10 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {keywords.length === 0 && (
            <div className="col-span-full text-center py-10 text-xs text-slate-400">No keywords found.</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────── Scoring Weights Tab ────────────────────────
const ScoringWeightsTab = () => {
  const [weights, setWeights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({});

  const weightLabels = {
    required_skills_weight: 'Required Skills',
    preferred_skills_weight: 'Preferred Skills',
    keyword_relevance_weight: 'Keyword Relevance',
    experience_relevance_weight: 'Experience Relevance',
    education_relevance_weight: 'Education Relevance',
    project_relevance_weight: 'Project Relevance',
    formatting_weight: 'Resume Formatting'
  };

  const fetchWeights = async () => {
    try {
      setLoading(true);
      const data = await adminService.getScoringWeights();
      setWeights(data);
      const formData = {};
      Object.keys(weightLabels).forEach(key => {
        formData[key] = data[key] ?? 0;
      });
      setForm(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeights(); }, []);

  const totalWeight = Object.values(form).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const isValid = Math.abs(totalWeight - 1.0) < 0.01;

  const handleSave = async () => {
    if (!isValid) return;
    try {
      setSaving(true);
      setMessage(null);
      const payload = {};
      Object.keys(form).forEach(key => {
        payload[key] = parseFloat(form[key]);
      });
      await adminService.updateScoringWeights(payload);
      setMessage({ type: 'success', text: 'Scoring weights updated successfully.' });
      fetchWeights();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update weights.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`flex items-center space-x-2 p-3 rounded-xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <span>ATS Scoring Weight Configuration</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">All weights must sum to 1.0 (100%). Each weight controls the percentage impact of that scoring dimension on the final ATS score.</p>
        </div>

        <div className="space-y-3">
          {Object.entries(weightLabels).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-4">
              <label className="text-xs text-slate-300 font-medium w-48 flex-shrink-0">{label}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form[key] ?? 0}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white text-center focus:outline-none focus:border-indigo-500/50"
              />
              <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (parseFloat(form[key]) || 0) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-mono w-12 text-right">
                {((parseFloat(form[key]) || 0) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-300">Total:</span>
            <span className={`text-sm font-extrabold ${isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(totalWeight * 100).toFixed(1)}%
            </span>
            {!isValid && (
              <span className="text-[10px] text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Weights must sum to 100%</span>
              </span>
            )}
          </div>
          <button onClick={handleSave} disabled={!isValid || saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-xs font-bold transition">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Weights'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── Admin & User Management Tab ────────────────
const AdminUsersTab = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(roleFilter);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await adminService.createUser({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      setMessage({ type: 'success', text: `Admin user "${form.email}" created successfully with full privileges.` });
      setForm({ full_name: '', email: '', password: '', role: 'admin' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create admin.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userToDelete) => {
    if (userToDelete.id === currentUser?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!confirm(`Are you sure you want to revoke and delete admin "${userToDelete.email}"?`)) return;
    try {
      await adminService.deleteUser(userToDelete.id);
      setMessage({ type: 'success', text: `User "${userToDelete.email}" removed.` });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete user.' });
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`flex items-center space-x-2 p-3 rounded-xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">All Accounts ({users.length})</option>
            <option value="admin">Admins Only</option>
            <option value="student">Students Only</option>
          </select>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Add Admin Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Grant Full Admin Privileges</span>
            </h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Full Name *</label>
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Operations Admin"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Email Address *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@uniskill.in"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Password *</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Role Assigned</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="admin">Administrator (Full Access)</option>
                <option value="student">Student / Candidate</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white text-xs font-bold transition"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Creating Admin...' : 'Create Admin Account'}</span>
          </button>
        </form>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-xl backdrop-blur-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-white/10">
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider">Account & User Info</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider">Role & Permissions</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider hidden sm:table-cell">Created Date</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((u) => {
                const isMe = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}>
                          {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white flex items-center space-x-2">
                            <span>{u.full_name}</span>
                            {isMe && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Current User
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center space-x-1.5 text-xs px-3 py-1 rounded-full font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                          : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      }`}>
                        {u.role === 'admin' && <Shield className="h-3 w-3" />}
                        <span className="capitalize">{u.role}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-300 font-medium">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isMe ? (
                        <button
                          onClick={() => handleDelete(u)}
                          title="Revoke and Delete User"
                          className="p-2 rounded-xl text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/20 border border-white/10 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic px-2">Primary Session</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">No users found.</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────── Main Admin Page ─────────────────────────────
export const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');

  if (!isAdmin) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Admin Access Required</h3>
        <p className="text-sm text-slate-400">Switch to Admin View using the toggle in the navigation bar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Settings className="h-6 w-6 text-indigo-400" />
          <span>Keyword Database & Admin Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Manage job roles, ATS keywords, scoring weights, and administrative access.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <TabButton active={activeTab === 'roles'} icon={Briefcase} label="Job Roles" onClick={() => setActiveTab('roles')} />
        <TabButton active={activeTab === 'keywords'} icon={Tag} label="Keywords" onClick={() => setActiveTab('keywords')} />
        <TabButton active={activeTab === 'weights'} icon={Sliders} label="Scoring Weights" onClick={() => setActiveTab('weights')} />
        <TabButton active={activeTab === 'admins'} icon={Users} label="Admins & Users" onClick={() => setActiveTab('admins')} />
      </div>

      {/* Content */}
      {activeTab === 'roles' && <JobRolesTab />}
      {activeTab === 'keywords' && <KeywordsTab />}
      {activeTab === 'weights' && <ScoringWeightsTab />}
      {activeTab === 'admins' && <AdminUsersTab />}
    </div>
  );
};

