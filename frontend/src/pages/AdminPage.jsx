import React, { useState, useEffect } from 'react';
import {
  Settings, Plus, Pencil, Trash2, Search, Loader2, Save, X,
  Briefcase, Tag, Sliders, AlertTriangle, CheckCircle2,
  Shield, UserPlus, Users
} from 'lucide-react';
import { atsService, adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────── Sub-tab Button ────────────────────────────
const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
      active
        ? 'bg-blue-600 text-white font-semibold shadow-sm'
        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
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
    if (!confirm(`Delete job role "${title}"?`)) return;
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
        <div className={`p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top search & create */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job roles..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-700 dark:text-zinc-300 font-medium transition">Search</button>
        </form>

        <button onClick={openCreate} className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Role</span>
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{editingRole ? 'Edit Role' : 'Create Job Role'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Software Engineering"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 resize-none" />
          </div>
          {!editingRole && (
            <>
              <div>
                <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Required Skills (comma separated)</label>
                <input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} placeholder="Java, SQL, REST APIs..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Preferred Skills (comma separated)</label>
                <input value={form.preferred_skills} onChange={(e) => setForm({ ...form, preferred_skills: e.target.value })} placeholder="Docker, Redis..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
              </div>
            </>
          )}
          <button type="submit" disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}</span>
          </button>
        </form>
      )}

      {/* Roles Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">Role Title & Description</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300 hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300 hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{role.title}</p>
                    {role.description && (
                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5 line-clamp-1 max-w-lg font-normal">
                        {role.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      {role.category || 'General'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        onClick={() => openEdit(role)}
                        title="Edit"
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id, role.title)}
                        title="Delete"
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {roles.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-zinc-400">No job roles found.</div>
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
        <div className={`p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search keywords..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600" />
          </div>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-700 dark:text-zinc-300 font-medium transition">Search</button>
        </form>
        <button onClick={openCreate} className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Keyword</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{editingKw ? 'Edit Keyword' : 'Create Keyword'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Keyword *</label>
              <input required value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Programming Language"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Synonyms (comma separated)</label>
            <input value={form.synonyms} onChange={(e) => setForm({ ...form, synonyms: e.target.value })} placeholder="ReactJS, React.js..."
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : editingKw ? 'Save Changes' : 'Create Keyword'}</span>
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {keywords.map((kw) => (
            <div key={kw.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 flex items-start justify-between shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{kw.keyword}</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{kw.category || 'General'}</p>
                {kw.synonyms && kw.synonyms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {kw.synonyms.slice(0, 3).map((syn, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">{syn}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <button onClick={() => openEdit(kw)} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
                  <Pencil className="h-3 w-3" />
                </button>
                <button onClick={() => handleDelete(kw.id, kw.keyword)} className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
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
    required_skills_weight: 'Required Technical Skills',
    preferred_skills_weight: 'Preferred & Secondary Skills',
    keyword_relevance_weight: 'Keyword Coverage',
    experience_relevance_weight: 'Experience Level',
    education_relevance_weight: 'Education Alignment',
    project_relevance_weight: 'Project Portfolio',
    formatting_weight: 'Document Structure & Sections'
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
    return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 text-blue-600 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            ATS Evaluation Weights
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Weights must sum to 100%. Adjust the percentage impact of each dimension on the final score.
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(weightLabels).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-3 text-xs">
              <label className="text-slate-700 dark:text-zinc-300 font-medium w-52 flex-shrink-0">{label}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form[key] ?? 0}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-20 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white text-center focus:outline-none focus:border-blue-600"
              />
              <div className="flex-1 bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (parseFloat(form[key]) || 0) * 100)}%` }}
                />
              </div>
              <span className="text-slate-500 dark:text-zinc-400 font-mono w-10 text-right">
                {((parseFloat(form[key]) || 0) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-medium text-slate-600 dark:text-zinc-400">Total:</span>
            <span className={`font-bold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {(totalWeight * 100).toFixed(1)}%
            </span>
          </div>
          <button onClick={handleSave} disabled={!isValid || saving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition shadow-sm">
            {saving ? 'Saving...' : 'Save Weights'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── Admin Users Tab ────────────────────────────
const AdminUsersTab = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await adminService.createUser(form);
      setMessage({ type: 'success', text: `User "${form.email}" created.` });
      setForm({ full_name: '', email: '', password: '', role: 'admin' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create user.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userToDelete) => {
    if (userToDelete.id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete user "${userToDelete.email}"?`)) return;
    try {
      await adminService.deleteUser(userToDelete.id);
      setMessage({ type: 'success', text: `User "${userToDelete.email}" removed.` });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Delete failed.' });
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Manage system users and administrative access
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add User / Admin</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Create Account</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Full Name</label>
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Password</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600">
                <option value="admin">Administrator</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition">
            {saving ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300 hidden sm:table-cell">Created</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {users.map((u) => {
                const isMe = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-7 w-7 rounded-md bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-zinc-300">
                          {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center space-x-1">
                            <span>{u.full_name}</span>
                            {isMe && <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold">(You)</span>}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        u.role === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-slate-500 dark:text-zinc-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isMe ? (
                        <button onClick={() => handleDelete(u)} className="p-1.5 rounded text-slate-400 hover:text-rose-600 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Current</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
        <Shield className="h-8 w-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Admin Privileges Required</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">You must be signed in as an administrator to access database management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Database Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Configure job roles, manage keyword dictionaries, adjust scoring weights, and manage user accounts.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2.5 overflow-x-auto">
        <TabButton active={activeTab === 'roles'} icon={Briefcase} label="Job Roles" onClick={() => setActiveTab('roles')} />
        <TabButton active={activeTab === 'keywords'} icon={Tag} label="Keywords" onClick={() => setActiveTab('keywords')} />
        <TabButton active={activeTab === 'weights'} icon={Sliders} label="Scoring Weights" onClick={() => setActiveTab('weights')} />
        <TabButton active={activeTab === 'users'} icon={Users} label="User Accounts" onClick={() => setActiveTab('users')} />
      </div>

      {/* Content */}
      {activeTab === 'roles' && <JobRolesTab />}
      {activeTab === 'keywords' && <KeywordsTab />}
      {activeTab === 'weights' && <ScoringWeightsTab />}
      {activeTab === 'users' && <AdminUsersTab />}
    </div>
  );
};
