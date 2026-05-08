/**
 * PLATFORM RECOMMENDATION CARD
 * 
 * Displays a recommended platform/tool with quick launch action
 */
export default function PlatformRecommendationCard({ platform }) {
  const handleOpenPlatform = () => {
    // Handle different platform types with smart opening
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
        alert('💡 Terminal/Command Prompt\n\nPlease open your Terminal or Command Prompt manually:\n\n• Windows: Press Win+R, type "cmd", press Enter\n• Mac: Press Cmd+Space, type "terminal", press Enter\n• Linux: Press Ctrl+Alt+T');
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
      
      case 'chrome_devtools':
        alert('💡 Chrome DevTools\n\nTo open Chrome DevTools:\n\n1. Open Chrome browser\n2. Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)\n3. Or right-click on page → Inspect');
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
      
      case 'arduino_ide':
        // Try Arduino IDE protocol
        window.location.href = 'arduino://';
        setTimeout(() => {
          if (document.hasFocus()) {
            window.open('https://www.arduino.cc/en/software', '_blank');
          }
        }, 1000);
        break;
      
      case 'jupyter':
        // Try to open Jupyter
        window.open('http://localhost:8888', '_blank');
        setTimeout(() => {
          if (document.hasFocus()) {
            window.open('https://jupyter.org', '_blank');
          }
        }, 1000);
        break;
      
      default:
        // For other platforms, open their URL
        if (platform.url) {
          window.open(platform.url, '_blank');
        } else {
          alert(`💡 ${platform.name}\n\nPlease open ${platform.name} manually on your computer.`);
        }
        break;
    }
  };

  const getRelevanceColor = (relevance) => {
    switch (relevance) {
      case 'high':
        return 'border-green-500/30 bg-green-500/5';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low':
        return 'border-gray-500/30 bg-gray-500/5';
      default:
        return 'border-gray-700 bg-gray-800/50';
    }
  };

  const getRelevanceBadge = (relevance) => {
    switch (relevance) {
      case 'high':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className={`border rounded-xl p-4 transition-all hover:scale-105 ${getRelevanceColor(platform.relevance)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{platform.icon}</span>
          <div>
            <h4 className="font-semibold text-white">{platform.name}</h4>
            <p className="text-xs text-gray-400">{platform.category}</p>
          </div>
        </div>
        
        {platform.relevance && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getRelevanceBadge(platform.relevance)}`}>
            {platform.relevance}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-4">{platform.description}</p>

      {/* Action Button */}
      {platform.id === 'terminal' || platform.id === 'chrome_devtools' ? (
        <button
          onClick={handleOpenPlatform}
          className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group"
        >
          <span>View Instructions</span>
          <svg 
            className="w-4 h-4 group-hover:scale-110 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      ) : platform.url || ['vscode', 'postman', 'mongodb_compass', 'arduino_ide', 'jupyter'].includes(platform.id) ? (
        <button
          onClick={handleOpenPlatform}
          className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group"
        >
          <span>Launch {platform.name}</span>
          <svg 
            className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      ) : (
        <div className="w-full px-4 py-2 bg-gray-700/50 text-gray-400 rounded-lg text-sm font-medium text-center">
          Open Manually
        </div>
      )}
    </div>
  );
}
