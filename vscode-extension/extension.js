const vscode  = require('vscode');
const tracker = require('./tracker.js');

function activate(context) {
  console.log('[PROJECTMIND] ===== EXTENSION ACTIVATED =====');
  
  // Start tracking file activity
  tracker.start(context);

  // Command: set project ID
  context.subscriptions.push(
    vscode.commands.registerCommand('projectmind.setProject', async () => {
      const id = await vscode.window.showInputBox({
        prompt:      'Paste your ProjectMind Project ID',
        placeHolder: 'e.g. 6829a1f3b2c4e5d8f0a1b2c3',
      });
      if (id) {
        await vscode.workspace.getConfiguration('projectmind').update('projectId', id.trim(), true);
        vscode.window.showInformationMessage(`ProjectMind: Project set — ${id.trim()}`);
      }
    })
  );

  // Command: set token
  context.subscriptions.push(
    vscode.commands.registerCommand('projectmind.setToken', async () => {
      const token = await vscode.window.showInputBox({
        prompt:      'Paste your ProjectMind JWT token',
        placeHolder: 'eyJhbGci...',
        password:    true,
      });
      if (token) {
        await vscode.workspace.getConfiguration('projectmind').update('token', token.trim(), true);
        vscode.window.showInformationMessage('ProjectMind: Token saved');
      }
    })
  );

  // Command: show status
  context.subscriptions.push(
    vscode.commands.registerCommand('projectmind.status', () => {
      const cfg       = vscode.workspace.getConfiguration('projectmind');
      const projectId = cfg.get('projectId');
      const token     = cfg.get('token');
      const apiUrl    = cfg.get('apiUrl');

      if (!projectId || !token) {
        vscode.window.showWarningMessage(
          'ProjectMind: Not configured. Run "ProjectMind: Set Active Project" and "ProjectMind: Set Auth Token" first.'
        );
      } else {
        vscode.window.showInformationMessage(
          `ProjectMind: Tracking active — Project ${projectId} → ${apiUrl}`
        );
      }
    })
  );

  vscode.window.showInformationMessage('ProjectMind Tracker is active');
}

function deactivate() {
  tracker.stop();
}

module.exports = { activate, deactivate };