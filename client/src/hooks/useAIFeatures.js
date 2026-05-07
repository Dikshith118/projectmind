import { useState } from 'react';
import api from '../api/client';

export function useAIFeatures() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateDemo = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/ai/demo', { projectId });
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate demo';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getNextAction = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/ai/next-action', { projectId });
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get next action';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const generateRecoveryPlan = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/ai/recovery-plan', { projectId });
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate recovery plan';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateDemo,
    getNextAction,
    generateRecoveryPlan,
  };
}
