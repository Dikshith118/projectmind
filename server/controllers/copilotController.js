const Groq   = require('groq-sdk');
const Project = require('../models/Project');
const Task    = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.chat = async (req, res) => {
  try {
    const { projectId, message } = req.body;

    const project  = await Project.findById(projectId);
    const tasks    = await Task.find({ project: projectId }).sort('day');
    const recentActivity = await ActivityLog.find({ project: projectId })
      .sort('-timestamp').limit(20);

    const doneTasks    = tasks.filter(t => t.status === 'done').length;
    const partialTasks = tasks.filter(t => t.status === 'partial').length;
    const totalTasks   = tasks.length;
    const completionPct = Math.round((doneTasks / totalTasks) * 100);

    const recentFiles = [...new Set(
      recentActivity.map(a => a.file.split(/[\\/]/).pop())
    )].slice(0, 5).join(', ');

    const systemPrompt = `You are ProjectMind, an AI project copilot.

PROJECT CONTEXT:
- Name: ${project.name}
- Goal: ${project.goal}
- Deadline: ${new Date(project.deadline).toDateString()}
- Status: ${project.status}
- Days behind: ${project.daysBehind}
- Completion: ${completionPct}%
- Tasks: ${doneTasks} done, ${partialTasks} partial, ${totalTasks - doneTasks - partialTasks} pending

RECENT FILES WORKED ON: ${recentFiles || 'none'}

CURRENT TASKS:
${tasks.slice(0, 10).map(t =>
  `- Day ${t.day}: ${t.title} [${t.status}] (${t.priority} priority)`
).join('\n')}

Answer the user's question specifically using this data.
Be concise — 2-3 sentences max.
Reference actual task names and real numbers.
Never give generic advice.`;

    const response = await client.chat.completions.create({
      model:    'llama-3.3-70b-versatile',
      messages: [
        { role: 'system',  content: systemPrompt },
        { role: 'user',    content: message },
      ],
      max_tokens: 200,
    });

    res.json({ reply: response.choices[0].message.content.trim() });

  } catch (err) {
    console.error('COPILOT ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};