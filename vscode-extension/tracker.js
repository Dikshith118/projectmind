const vscode = require('vscode');
const https  = require('https');
const http   = require('http');

let queue       = [];
let interval    = null;
let disposables = [];
let editTimers  = {};

function start(context) {
  // Track file saves
  const onSave = vscode.workspace.onDidSaveTextDocument(doc => {
    push({ file: doc.fileName, event: 'save', duration: 0 });
  });

  // Track file edits — debounced 2 seconds to avoid spam
  const onEdit = vscode.workspace.onDidChangeTextDocument(e => {
    const file = e.document.fileName;
    if (editTimers[file]) clearTimeout(editTimers[file]);
    editTimers[file] = setTimeout(() => {
      push({ file, event: 'edit', duration: 30 });
      delete editTimers[file];
    }, 2000);
  });

  // Track file opens
  const onOpen = vscode.workspace.onDidOpenTextDocument(doc => {
    if (doc.uri.scheme === 'file') {
      push({ file: doc.fileName, event: 'open', duration: 0 });
    }
  });

  disposables.push(onSave, onEdit, onOpen);
  context.subscriptions.push(...disposables);

  // Flush activity to backend every 60 seconds
  interval = setInterval(flush, 60_000);

  console.log('ProjectMind tracker started');
}

function push(event) {
  const cfg       = vscode.workspace.getConfiguration('projectmind');
  const projectId = cfg.get('projectId');
  const token     = cfg.get('token');

  // Skip if not configured
  if (!projectId || !token) return;

  // Skip non-file URIs and node_modules
  if (event.file.includes('node_modules')) return;
  if (event.file.includes('.git'))         return;

  queue.push({ ...event, timestamp: new Date().toISOString() });
  console.log(`[PM] Queued: ${event.event} — ${event.file.split(/[\\/]/).pop()}`);
}

async function flush() {
  if (!queue.length) return;

  const cfg       = vscode.workspace.getConfiguration('projectmind');
  const projectId = cfg.get('projectId');
  const token     = cfg.get('token');
  const apiUrl    = cfg.get('apiUrl') || 'http://localhost:4000';

  if (!projectId || !token) return;

  const batch = queue.splice(0); // drain queue atomically
  const body  = JSON.stringify({ projectId, token, events: batch });
  const url   = `${apiUrl}/api/activity`;

  try {
    const lib = url.startsWith('https') ? https : http;
    const u   = new URL(url);

    await new Promise((resolve, reject) => {
      const req = lib.request(
        {
          hostname: u.hostname,
          port:     u.port || (lib === https ? 443 : 80),
          path:     u.pathname,
          method:   'POST',
          headers:  {
            'Content-Type':   'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          console.log(`[PM] Flushed ${batch.length} events — status ${res.statusCode}`);
          resolve(res);
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  } catch (err) {
    // Put events back in queue if network failed
    console.error('[PM] Flush failed, re-queuing:', err.message);
    queue.unshift(...batch);
  }
}

function stop() {
  clearInterval(interval);
  flush(); // final flush on shutdown
  disposables.forEach(d => d.dispose());
}

module.exports = { start, stop, flush };