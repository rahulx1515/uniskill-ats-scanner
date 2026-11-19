import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach authorization header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uniskill_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('uniskill_token', res.data.access_token);
      localStorage.setItem('uniskill_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('uniskill_token');
    localStorage.removeItem('uniskill_user');
  }
};

export const atsService = {
  getJobRoles: async (search = '', category = '') => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const res = await api.get('/ats/job-roles', { params });
    return res.data;
  },
  getJobRoleSkills: async (jobRoleId) => {
    const res = await api.get(`/ats/job-roles/${jobRoleId}/skills`);
    return res.data;
  },
  getKeywords: async (search = '', category = '', limit = 100) => {
    const params = { limit };
    if (search) params.search = search;
    if (category) params.category = category;
    const res = await api.get('/ats/keywords', { params });
    return res.data;
  },
  uploadResume: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/ats/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return res.data;
  },
  analyzeResume: async (resumeId, jobRoleId, customJd = null) => {
    const res = await api.post('/ats/analyze', {
      resume_id: resumeId,
      job_role_id: jobRoleId,
      custom_jd: customJd || null
    });
    return res.data;
  },
  getAnalysis: async (analysisId) => {
    const res = await api.get(`/ats/analysis/${analysisId}`);
    return res.data;
  },
  getReportDownloadUrl: (analysisId) => {
    const token = localStorage.getItem('uniskill_token');
    return `/api/ats/analysis/${analysisId}/report${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  downloadReport: async (analysisId, filename = null) => {
    const token = localStorage.getItem('uniskill_token');
    const res = await api.get(`/ats/analysis/${analysisId}/report`, {
      responseType: 'blob',
      params: token ? { token } : {}
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `UniSkill_ATS_Report_${analysisId.slice(0, 8).toUpperCase()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  getHistory: async () => {
    const res = await api.get('/ats/history');
    return res.data;
  },
  compareAnalyses: async (id1, id2) => {
    const res = await api.get('/ats/compare', { params: { id1, id2 } });
    return res.data;
  },
  deleteResume: async (resumeId) => {
    const res = await api.delete(`/ats/resume/${resumeId}`);
    return res.data;
  }
};

export const adminService = {
  createJobRole: async (data) => {
    const res = await api.post('/ats/admin/job-roles', data);
    return res.data;
  },
  updateJobRole: async (id, data) => {
    const res = await api.put(`/ats/admin/job-roles/${id}`, data);
    return res.data;
  },
  deleteJobRole: async (id) => {
    const res = await api.delete(`/ats/admin/job-roles/${id}`);
    return res.data;
  },
  createKeyword: async (data) => {
    const res = await api.post('/ats/admin/keywords', data);
    return res.data;
  },
  updateKeyword: async (id, data) => {
    const res = await api.put(`/ats/admin/keywords/${id}`, data);
    return res.data;
  },
  deleteKeyword: async (id) => {
    const res = await api.delete(`/ats/admin/keywords/${id}`);
    return res.data;
  },
  getScoringWeights: async () => {
    const res = await api.get('/ats/admin/scoring-weights');
    return res.data;
  },
  updateScoringWeights: async (data) => {
    const res = await api.put('/ats/admin/scoring-weights', data);
    return res.data;
  },
  getUsers: async (role = '') => {
    const params = role ? { role } : {};
    const res = await api.get('/ats/admin/users', { params });
    return res.data;
  },
  createUser: async (data) => {
    const res = await api.post('/ats/admin/users', data);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/ats/admin/users/${id}`);
    return res.data;
  },
  getLoadBalancerStatus: async () => {
    const res = await api.get('/system/load-balancer');
    return res.data;
  }
};

export default api;

