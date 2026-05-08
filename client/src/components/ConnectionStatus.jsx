export default function ConnectionStatus({ connected, connectedClients }) {
  return (
    <div className="flex items-center gap-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
        <span className={`text-xs font-bold ${connected ? 'text-emerald-300' : 'text-red-300'}`}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      {/* Connected Clients */}
      {connected && connectedClients > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>👥</span>
          <span>{connectedClients} {connectedClients === 1 ? 'viewer' : 'viewers'}</span>
        </div>
      )}
    </div>
  );
}
