export default function RealtimeNotifications({ notifications, onClear }) {
  if (notifications.length === 0) return null;

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'info':
      default:
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyle(notification.type)} border rounded-xl p-4 shadow-lg backdrop-blur-xl animate-slideInRight`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{notification.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-1">{notification.title}</p>
              <p className="text-xs opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => onClear && onClear(notification.id)}
              className="text-white/50 hover:text-white transition shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
