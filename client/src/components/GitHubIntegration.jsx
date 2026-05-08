import { useState, useEffect } from 'react';
import api from '../api/client';

export default function GitHubIntegration({ projectId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // OAuth flow state
  const [oauthStep, setOauthStep] = useState(null); // 'auth' | 'select-repo'
  const [accessToken, setAccessToken] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, [projectId]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/github/status/${projectId}`);
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch GitHub status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGitHub = () => {
    // Redirect to GitHub OAuth
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/github/callback`;
    const scope = 'repo,read:user';
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${projectId}`;
    
    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (code) => {
    setLinking(true);
    try {
      const res = await api.post('/api/github/oauth/callback', {
        code,
        projectId
      });

      setAccessToken(res.data.accessToken);
      setOauthStep('select-repo');
      
      // Fetch repositories
      const reposRes = await api.get('/api/github/repos', {
        params: { accessToken: res.data.accessToken }
      });
      setRepos(reposRes.data.repos);

    } catch (err) {
      alert('GitHub authentication failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLinking(false);
    }
  };

  const handleLinkRepository = async () => {
    if (!selectedRepo) return;

    setLinking(true);
    try {
      await api.post('/api/github/link', {
        projectId,
        accessToken,
        repoOwner: selectedRepo.owner,
        repoName: selectedRepo.name,
        trackedBranches: [selectedRepo.defaultBranch]
      });

      setOauthStep(null);
      setAccessToken(null);
      setSelectedRepo(null);
      await fetchStatus();
      
      alert('Repository linked successfully!');

    } catch (err) {
      alert('Failed to link repository: ' + (err.response?.data?.error || err.message));
    } finally {
      setLinking(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post(`/api/github/sync/${projectId}`);
      alert(`Synced ${res.data.newCommits} new commits`);
      await fetchStatus();
    } catch (err) {
      alert('Sync failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Unlink GitHub repository? Commit data will be preserved.')) return;

    try {
      await api.delete(`/api/github/unlink/${projectId}`);
      await fetchStatus();
      alert('Repository unlinked successfully');
    } catch (err) {
      alert('Unlink failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // OAuth Step: Select Repository
  if (oauthStep === 'select-repo') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📦</span>
          Select Repository
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {repos.map(repo => (
            <button
              key={repo.id}
              onClick={() => setSelectedRepo(repo)}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selectedRepo?.id === repo.id
                  ? 'bg-violet-500/20 border-violet-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <p className="text-sm font-bold text-white">{repo.fullName}</p>
              {repo.description && (
                <p className="text-xs text-slate-400 mt-1">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {repo.language && (
                  <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-1 rounded-full">
                    {repo.language}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  Branch: {repo.defaultBranch}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setOauthStep(null);
              setAccessToken(null);
              setSelectedRepo(null);
            }}
            className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 px-4 rounded-xl font-bold hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleLinkRepository}
            disabled={!selectedRepo || linking}
            className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {linking ? 'Linking...' : 'Link Repository'}
          </button>
        </div>
      </div>
    );
  }

  // Not linked
  if (!status?.linked) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-white/10 rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>

          <h3 className="text-2xl font-black text-white mb-2">
            Connect GitHub Repository
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Link your GitHub repository to automatically track commits, analyze code changes, 
            and correlate development activity with tasks.
          </p>

          <button
            onClick={handleConnectGitHub}
            disabled={linking}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 px-8 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-900/30 transition disabled:opacity-50"
          >
            {linking ? 'Connecting...' : '🔗 Connect GitHub'}
          </button>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500">
              ✓ Secure OAuth authentication • ✓ Read-only access • ✓ Unlink anytime
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Linked
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-400/30 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Connected to GitHub</p>
              <a 
                href={status.integration.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-black text-white hover:text-cyan-300 transition"
              >
                {status.integration.repoFullName}
              </a>
            </div>
          </div>

          <button
            onClick={handleUnlink}
            className="text-xs text-red-300 hover:text-red-200 font-bold transition"
          >
            Unlink
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-white">{status.integration.totalCommits}</p>
            <p className="text-xs text-slate-400 mt-1">Total Commits</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-cyan-300">{status.integration.defaultBranch}</p>
            <p className="text-xs text-slate-400 mt-1">Default Branch</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-slate-300">
              {status.integration.lastSyncAt 
                ? new Date(status.integration.lastSyncAt).toLocaleDateString()
                : 'Never'
              }
            </p>
            <p className="text-xs text-slate-400 mt-1">Last Sync</p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full mt-4 bg-white/10 border border-white/10 text-white py-3 px-4 rounded-xl font-bold hover:bg-white/20 transition disabled:opacity-50"
        >
          {syncing ? '🔄 Syncing...' : '🔄 Sync Commits'}
        </button>
      </div>
    </div>
  );
}
