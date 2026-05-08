import { useState, useEffect } from 'react';
import api from '../api/client';
import PlatformRecommendationCard from './PlatformRecommendationCard';

/**
 * INTELLIGENT TASK WORKSPACE
 * 
 * AI-powered task execution orchestration panel
 */
export default function IntelligentTaskWorkspace({ task, onClose, onTaskUpdate }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [updating, setUpdating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  useEffect(() => {
    if (task) {
      fetchRecommendations();
    }
  }, [task]);

  useEffect(() => {
    // Auto-select top 3 platforms when recommendations load
    if (recommendations?.platforms && recommendations.platforms.length > 0) {
      const topThree = recommendations.platforms.slice(0, 3).map(p => p.id);
      setSelectedPlatforms(topThree);
    }
  }, [recommendations]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/tasks/${task._id}/execution`);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Show error in UI
      setRecommendations({
        task: {
          id: task._id,
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'pending'
        },
        explanation: {
          what: 'This task contributes to project completion.',
          why: 'Complete this task to make progress.',
          how: 'Follow best practices and test your work.',
          estimatedComplexity: 'medium'
        },
        platforms: [],
        workflow: [],
        blockers: [],
        warnings: [],
        aiInsights: {
          strategy: 'Break down the task and complete it step by step.',
          challenges: ['Ensure requirements are clear'],
          successCriteria: ['Task completed successfully']
        },
        nextSteps: [],
        resources: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    setUpdating(true);
    try {
      await api.post(`/api/tasks/${task._id}/start`);
      if (onTaskUpdate) onTaskUpdate();
      
      // Automatically open selected platforms
      if (selectedPlatforms.length > 0 && recommendations?.platforms) {
        const platformsToOpen = recommendations.platforms.filter(p => 
          selectedPlatforms.includes(p.id)
        );
        
        if (platformsToOpen.length > 0) {
          const platformNames = platformsToOpen.map(p => p.name).join(', ');
          
          // Create a temporary notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="text-2xl">🚀</span>
              <div>
                <div class="font-semibold">Opening Platforms...</div>
                <div class="text-xs text-cyan-300">${platformNames}</div>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          
          // Remove notification after 3 seconds
          setTimeout(() => {
            notification.remove();
          }, 3000);
          
          // Open selected platforms
          platformsToOpen.forEach((platform, index) => {
            setTimeout(() => {
              openPlatform(platform);
            }, index * 500); // Stagger opening to avoid popup blocker
          });
        }
      }
      
      fetchRecommendations();
    } catch (error) {
      console.error('Failed to start task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const openPlatform = (platform) => {
    // Handle different platform types
    switch (platform.id) {
      case 'vscode':
        // Try to open VS Code with vscode:// protocol
        window.location.href = 'vscode://';
        // Fallback to download page after a delay
        setTimeout(() => {
          if (document.hasFocus()) {
            window.open('https://code.visualstudio.com', '_blank');
          }
        }, 1000);
        break;
      
      case 'terminal':
        // Terminal can't be opened from browser, show instruction
        alert('💡 Please open your Terminal/Command Prompt manually');
        break;
      
      case 'github':
        // Open user's GitHub repositories
        window.open('https://github.com', '_blank');
        break;
      
      case 'postman':
        // Try Postman app protocol
        window.location.href = 'postman://';
        setTimeout(() => {
          if (document.hasFocus()) {
            window.open('https://www.postman.com/downloads/', '_blank');
          }
        }, 1000);
        break;
      
      case 'figma':
        // Open Figma app or web
        window.open('https://www.figma.com', '_blank');
        break;
      
      case 'mongodb_atlas':
        window.open('https://cloud.mongodb.com', '_blank');
        break;
      
      case 'mongodb_compass':
        // Try MongoDB Compass protocol
        window.location.href = 'mongodb-compass://';
        setTimeout(() => {
          if (document.hasFocus()) {
            window.open('https://www.mongodb.com/products/compass', '_blank');
          }
        }, 1000);
        break;
      
      default:
        // For other platforms, open their URL
        if (platform.url) {
          window.open(platform.url, '_blank');
        }
        break;
    }
  };

  const handleCompleteTask = async () => {
    setUpdating(true);
    try {
      await api.post(`/api/tasks/${task._id}/complete`);
      if (onTaskUpdate) onTaskUpdate();
      fetchRecommendations();
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProgress = async (status) => {
    setUpdating(true);
    try {
      // Map status to valid Task model values
      const validStatus = status === 'in-progress' ? 'partial' : status;
      await api.post(`/api/tasks/${task._id}/progress`, { status: validStatus });
      if (onTaskUpdate) onTaskUpdate();
      fetchRecommendations();
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setUpdating(false);
    }
  };

  const togglePlatformSelection = (platformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const selectAllPlatforms = () => {
    if (recommendations?.platforms) {
      setSelectedPlatforms(recommendations.platforms.map(p => p.id));
    }
  };

  const deselectAllPlatforms = () => {
    setSelectedPlatforms([]);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const { 
    explanation = {}, 
    platforms = [], 
    workflow = [], 
    blockers = [], 
    warnings = [], 
    aiInsights = {}, 
    nextSteps = [], 
    resources = [] 
  } = recommendations || {};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎯</span>
                <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              </div>
              <p className="text-gray-400 text-sm">{task.description || 'No description provided'}</p>
              
              {/* Task Meta */}
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {task.priority} priority
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                  task.status === 'partial' ? 'bg-blue-500/20 text-blue-400' :
                  task.status === 'skipped' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {task.status === 'partial' ? 'in progress' : task.status}
                </span>
                {task.estimatedH ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
                    {task.estimatedH}h estimated
                  </span>
                ) : null}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 bg-gray-900/50">
          <div className="flex gap-1 p-2">
            {['overview', 'platforms', 'workflow', 'insights'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Blockers */}
              {blockers && blockers.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🚫</span>
                    <h3 className="text-lg font-semibold text-red-400">Blockers Detected</h3>
                  </div>
                  {blockers.map((blocker, idx) => (
                    <div key={idx} className="text-sm text-gray-300 mb-2">
                      • {blocker.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {warnings && warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-lg font-semibold text-yellow-400">Warnings</h3>
                  </div>
                  {warnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-gray-300 mb-2">
                      • {warning.message}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Explanation */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-lg font-semibold text-white">AI Task Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-cyan-400 mb-1">What is this task?</div>
                    <div className="text-sm text-gray-300">{explanation.what}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-cyan-400 mb-1">Why does it matter?</div>
                    <div className="text-sm text-gray-300">{explanation.why}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-cyan-400 mb-1">How to complete it?</div>
                    <div className="text-sm text-gray-300">{explanation.how}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-gray-400">Complexity:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      explanation.estimatedComplexity === 'high' ? 'bg-red-500/20 text-red-400' :
                      explanation.estimatedComplexity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {explanation.estimatedComplexity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              {nextSteps && nextSteps.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📋</span>
                    <h3 className="text-lg font-semibold text-white">Next Steps</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {nextSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <span className="text-2xl">{step.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">{step.action}</div>
                          <div className="text-xs text-gray-400 mt-1">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Platforms Tab */}
          {activeTab === 'platforms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛠️</span>
                  <h3 className="text-lg font-semibold text-white">Recommended Platforms & Tools</h3>
                </div>
                
                {platforms && platforms.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllPlatforms}
                      className="px-3 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllPlatforms}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>
              
              {platforms && platforms.length > 0 ? (
                <>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-cyan-400">
                      <span>✓</span>
                      <span>Select platforms to open when you start the task ({selectedPlatforms.length} selected)</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {platforms.map(platform => (
                      <div
                        key={platform.id}
                        onClick={() => togglePlatformSelection(platform.id)}
                        className={`border rounded-xl p-4 transition-all cursor-pointer hover:scale-105 ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-cyan-500/50 bg-cyan-500/10 ring-2 ring-cyan-500/30'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                            selectedPlatforms.includes(platform.id)
                              ? 'bg-cyan-500 border-cyan-500'
                              : 'border-gray-600 bg-gray-900'
                          }`}>
                            {selectedPlatforms.includes(platform.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-3xl">{platform.icon}</span>
                            <div>
                              <h4 className="font-semibold text-white">{platform.name}</h4>
                              <p className="text-xs text-gray-400">{platform.category}</p>
                            </div>
                          </div>
                          
                          {platform.relevance && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              platform.relevance === 'high' ? 'bg-green-500/20 text-green-400' :
                              platform.relevance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {platform.relevance}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-300 ml-8">{platform.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No specific platform recommendations for this task.
                </div>
              )}
            </div>
          )}

          {/* Workflow Tab */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔄</span>
                <h3 className="text-lg font-semibold text-white">Execution Workflow</h3>
              </div>
              
              {workflow && workflow.length > 0 ? (
                <div className="space-y-4">
                  {workflow.map((phase, idx) => (
                    <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                          {phase.order}
                        </div>
                        <h4 className="text-lg font-semibold text-white">{phase.phase}</h4>
                      </div>
                      
                      <div className="space-y-2 ml-11">
                        {phase.actions.map((action, actionIdx) => (
                          <div key={actionIdx} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No workflow steps available.
                </div>
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && aiInsights && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-semibold text-white">Execution Strategy</h3>
                </div>
                <p className="text-gray-300">{aiInsights.strategy}</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-semibold text-white">Potential Challenges</h3>
                </div>
                <div className="space-y-2">
                  {aiInsights.challenges.map((challenge, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{challenge}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold text-white">Success Criteria</h3>
                </div>
                <div className="space-y-2">
                  {aiInsights.successCriteria.map((criteria, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>

              {resources && resources.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📚</span>
                    <h3 className="text-lg font-semibold text-white">Learning Resources</h3>
                  </div>
                  <div className="space-y-2">
                    {resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span className="text-xl">{resource.icon}</span>
                        <span className="text-sm text-cyan-400 hover:text-cyan-300">{resource.title}</span>
                        <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 bg-gray-900/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {task.status === 'pending' ? (
                <>
                  <button
                    onClick={handleStartTask}
                    disabled={updating || (blockers && blockers.length > 0) || selectedPlatforms.length === 0}
                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updating ? 'Starting...' : (
                      <>
                        <span>▶️ Start Task</span>
                        {selectedPlatforms.length > 0 && (
                          <span className="text-xs bg-cyan-600 px-2 py-0.5 rounded">
                            {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  {selectedPlatforms.length === 0 && (
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Select at least one platform to start</span>
                    </span>
                  )}
                </>
              ) : task.status === 'partial' ? (
                <>
                  <button
                    onClick={handleCompleteTask}
                    disabled={updating}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Completing...' : '✅ Mark Complete'}
                  </button>
                  <button
                    onClick={() => handleUpdateProgress('pending')}
                    disabled={updating}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    ⏸️ Pause
                  </button>
                </>
              ) : (
                <div className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
                  ✅ Task Completed
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
