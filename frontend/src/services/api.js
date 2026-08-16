// API service for NovaTech KnowledgeHub backend

const rawUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const API_BASE_URL = rawUrl.replace(/\/+$/, '');

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      status: (data.status === 'healthy' || data.components?.api === 'up') ? 'healthy' : 'degraded',
      data
    };
  } catch (error) {
    // Try proxy endpoint if direct fails
    try {
      const proxyRes = await fetch('/api/health');
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return {
          status: (data.status === 'healthy' || data.components?.api === 'up') ? 'healthy' : 'degraded',
          data
        };
      }
    } catch {
      // ignore
    }
    return { status: 'offline', error: error.message };
  }
}

export async function sendQuery(question, threadId) {
  const payload = {
    q: question,
    thread_id: threadId || 'default_user',
  };

  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.detail?.answer || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    // Fallback to proxy
    try {
      const proxyRes = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (proxyRes.ok) return await proxyRes.json();
    } catch {
      // ignore
    }
    throw err;
  }
}

export function getGraphImageUrl() {
  return `${API_BASE_URL}/graph`;
}
