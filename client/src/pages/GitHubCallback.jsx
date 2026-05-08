import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // projectId
    const error = searchParams.get('error');

    if (error) {
      alert('GitHub authentication failed: ' + error);
      navigate('/');
      return;
    }

    if (code && state) {
      // Store code and projectId in sessionStorage
      sessionStorage.setItem('github_oauth_code', code);
      sessionStorage.setItem('github_oauth_project', state);
      
      // Redirect to project dashboard
      navigate(`/dashboard/${state}`);
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300">Completing GitHub authentication...</p>
      </div>
    </div>
  );
}
