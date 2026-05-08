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
    console.log('[PROJECTMIND] FILE SAVED:', doc.fileName);
    push({ file: doc.fileName, event: 'save', duration: 0 });
  });

  // Track file edits — debounced 2 seconds to avoid spam
  const onEdit = vscode.workspace.onDidChangeTextDocument(e => {
    const file = e.document.fileName;
    if (editTimers[file]) clearTimeout(editTimers[file]);
    editTimers[file] = setTimeout(() => {
      console.log('[PROJECTMIND] FILE EDITED:', file);
      push({ file, event: 'edit', duration: 30 });
      delete editTimers[file];
    }, 2000);
  });

  // Track file opens
  const onOpen = vscode.workspace.onDidOpenTextDocument(doc => {
    if (doc.uri.scheme === 'file') {
      console.log('[PROJECTMIND] FILE OPENED:', doc.fileName);
      push({ file: doc.fileName, event: 'open', duration: 0 });
    }
  });

  disposables.push(onSave, onEdit, onOpen);
  context.subscriptions.push(...disposables);

  // Flush activity to backend every 60 seconds
  interval = setInterval(flush, 60_000);

  console.log('[PROJECTMIND] Tracker started - listening for file activity');
}

function push(event) {
  const cfg       = vscode.workspace.getConfiguration('projectmind');
  const projectId = cfg.get('projectId');
  const token     = cfg.get('token');

  // Skip if not configured
  if (!projectId || !token) {
    console.log('[PROJECTMIND] ⚠️ Not configured - skipping activity. Missing projectId or token');
    return;
  }

  // Skip non-file URIs and node_modules
  if (event.file.includes('node_modules')) {
    console.log('[PROJECTMIND] Skipping node_modules:', event.file);
    return;
  }
  if (event.file.includes('.git')) {
    console.log('[PROJECTMIND] Skipping .git:', event.file);
    return;
  }

  queue.push({ ...event, timestamp: new Date().toISOString() });
  console.log(`[PROJECTMIND] ✓ Queued: ${event.event} — ${event.file.split(/[\\/]/).pop()} (Queue size: ${queue.length})`);
}

async function flush() {
  if (!queue.length) {
    console.log('[PROJECTMIND] Flush: Queue is empty, nothing to send');
    return;
  }

  const cfg       = vscode.workspace.getConfiguration('projectmind');
  const projectId = cfg.get('projectId');
  const token     = cfg.get('token');
  const apiUrl    = cfg.get('apiUrl') || 'http://localhost:4000';

  if (!projectId || !token) {
    console.log('[PROJECTMIND] ⚠️ Flush skipped: Missing projectId or token');
    return;
  }

  const batch = queue.splice(0); // drain queue atomically
  const body  = JSON.stringify({ projectId, token, events: batch });
  const url   = `${apiUrl}/api/activity/`;

  console.log(`[PROJECTMIND] 🚀 SENDING ${batch.length} events to ${url}`);
  console.log(`[PROJECTMIND] Request body:`, JSON.stringify({ projectId, eventCount: batch.length, events: batch.map(e => ({ event: e.event, file: e.file.split(/[\\/]/).pop() })) }, null, 2));

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
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            console.log(`[PROJECTMIND] ✅ Response received - Status: ${res.statusCode}`);
            console.log(`[PROJECTMIND] Response body:`, data || '(empty)');
            
            if (res.statusCode === 200 || res.statusCode === 201) {
              console.log(`[PROJECTMIND] 🎉 Successfully sent ${batch.length} events!`);
            } else {
              console.error(`[PROJECTMIND] ⚠️ Unexpected status code: ${res.statusCode}`);
            }
            resolve(res);
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  } catch (err) {
    // Put events back in queue if network failed
    console.error(`[PROJECTMIND] ❌ Flush failed: ${err.message}`);
    console.error(`[PROJECTMIND] Error details:`, err);
    queue.unshift(...batch);
  }

  console.log(`[PROJECTMIND] Flush complete. Queue size: ${queue.length}`);
}

function stop() {
  clearInterval(interval);
  flush(); // final flush on shutdown
  disposables.forEach(d => d.dispose());
}

module.exports = { start, stop, flush };