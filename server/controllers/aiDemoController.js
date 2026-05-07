const Groq = require('groq-sdk');
const Project = require('../models/Project');
const Task = require('../models/Task');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// AI Demo / PPT Generator
exports.generateDemo = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Verify ownership
    if (project.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const tasks = await Task.find({ project: projectId }).sort('day');
    const ActivityLog = require('../models/ActivityLog');
    const activityLogs = await ActivityLog.find({ project: projectId })
      .sort('-timestamp')
      .limit(50);

    // Calculate project metrics
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done');
    const partialTasks = tasks.filter(t => t.status === 'partial');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completionPct = totalTasks ? Math.round((doneTasks.length / totalTasks) * 100) : 0;
    
    const daysElapsed = Math.ceil((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    // Extract unique file types from activity
    const fileTypes = [...new Set(
      activityLogs.map(log => {
        const ext = log.file.split('.').pop();
        return ext;
      })
    )].slice(0, 10);

    // Group tasks by priority
    const highPriorityTasks = tasks.filter(t => t.priority === 'high');
    const completedFeatures = doneTasks.map(t => t.title);

    const systemPrompt = `You are a professional demo/presentation generator for software projects.

PROJECT DETAILS:
- Name: ${project.name}
- Goal: ${project.goal}
- Deadline: ${new Date(project.deadline).toDateString()}
- Status: ${project.status}
- Days Behind: ${project.daysBehind}
- Hours Per Day: ${project.hoursPerDay}

PROJECT METRICS:
- Total Tasks: ${totalTasks}
- Completed: ${doneTasks.length} (${completionPct}%)
- In Progress: ${partialTasks.length}
- Pending: ${pendingTasks.length}
- Days Elapsed: ${daysElapsed}
- Days Remaining: ${daysLeft}

COMPLETED FEATURES:
${completedFeatures.length > 0 ? completedFeatures.map(f => `- ${f}`).join('\n') : '- Project setup and planning'}

HIGH PRIORITY TASKS:
${highPriorityTasks.slice(0, 5).map(t => `- ${t.title} [${t.status}]`).join('\n')}

RECENT ACTIVITY:
- File types worked on: ${fileTypes.join(', ')}
- Total activity events: ${activityLogs.length}

ALL TASKS:
${tasks.map(t => `- ${t.title} [${t.status}] (Day ${t.day}, ${t.priority} priority)`).join('\n')}

Generate a comprehensive, SPECIFIC demo summary based on THIS PROJECT'S actual data.

IMPORTANT RULES:
1. Use the actual project name "${project.name}" in the overview
2. Reference the actual goal: "${project.goal}"
3. List ONLY features that are marked as "done" or "partial"
4. Infer tech stack from file types and task descriptions
5. Make problem statement relevant to the project goal
6. Future scope should be based on pending tasks
7. Demo script should follow logical flow of completed features

Return ONLY valid JSON with this exact structure:
{
  "overview": "2-3 sentences about ${project.name} and what it does",
  "problem": "What problem does ${project.name} solve? (1-2 sentences)",
  "features": ["feature 1", "feature 2", "feature 3"],
  "techStack": ["tech1", "tech2", "tech3"],
  "futureScope": ["planned feature 1", "planned feature 2"],
  "demoScript": ["step 1", "step 2", "step 3"]
}

NO markdown formatting. NO code blocks. ONLY the JSON object.`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional demo generator. You return ONLY valid JSON. No markdown. No explanation. No text before or after the JSON.' 
        },
        { role: 'user', content: systemPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.6,
    });

    const content = response.choices[0].message.content.trim();
    const clean = content.replace(/```json|```/g, '').trim();
    
    try {
      const result = JSON.parse(clean);
      
      // Validate response structure
      if (!result.overview || !result.problem || !Array.isArray(result.features)) {
        throw new Error('Invalid response structure from AI');
      }
      
      res.json(result);
    } catch (parseErr) {
      console.error('JSON parse failed. Raw response:', content);
      throw new Error('AI returned invalid JSON. Please try again.');
    }
  } catch (err) {
    console.error('DEMO GENERATION ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Deep Focus Mode - Next Best Action
exports.getNextAction = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await Task.find({ project: projectId }).sort('day');
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'partial');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const completionPct = Math.round((doneTasks.length / tasks.length) * 100);
    const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    const systemPrompt = `You are an AI productivity coach analyzing project status.

PROJECT: ${project.name}
COMPLETION: ${completionPct}%
DAYS LEFT: ${daysLeft}
DAYS BEHIND: ${project.daysBehind}
STATUS: ${project.status}

PENDING TASKS:
${pendingTasks.slice(0, 10).map(t => `- ${t.title} (Day ${t.day}, ${t.priority} priority, ${t.estimatedH}h)`).join('\n')}

Analyze and return JSON with:
{
  "nextAction": "specific task title to start now",
  "reasoning": "why this task is most important (1 sentence)",
  "remainingTasks": number,
  "highRiskTasks": number,
  "estimatedWorkLeft": "hours remaining",
  "riskLevel": "Low/Medium/High",
  "riskAnalysis": "brief risk explanation"
}`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Analyze and recommend next action.' },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content.trim();
    const clean = content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    res.json(result);
  } catch (err) {
    console.error('NEXT ACTION ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Recovery Plan Generator
exports.generateRecoveryPlan = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.daysBehind === 0) {
      return res.json({
        needed: false,
        message: 'Project is on track. No recovery plan needed.',
      });
    }

    const tasks = await Task.find({ project: projectId }).sort('day');
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    const systemPrompt = `You are a project recovery specialist.

PROJECT: ${project.name}
DAYS BEHIND: ${project.daysBehind}
DAYS LEFT: ${daysLeft}
HOURS/DAY: ${project.hoursPerDay}

REMAINING TASKS:
${pendingTasks.map(t => `- ${t.title} (${t.estimatedH}h, ${t.priority})`).join('\n')}

Create a recovery plan. Return JSON:
{
  "needed": true,
  "severity": "Mild/Moderate/Critical",
  "actions": [
    { "action": "specific action", "impact": "expected result" }
  ],
  "tasksToSkip": ["task titles that can be deprioritized"],
  "focusAreas": ["critical tasks to prioritize"],
  "estimatedRecoveryDays": number
}`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate recovery plan.' },
      ],
      max_tokens: 800,
      temperature: 0.4,
    });

    const content = response.choices[0].message.content.trim();
    const clean = content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    res.json(result);
  } catch (err) {
    console.error('RECOVERY PLAN ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};
