const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL  = 'llama-3.3-70b-versatile'; // free, fast, very capable

exports.breakdownProject = async ({ name, goal, deadline, hoursPerDay }) => {
  const daysLeft = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `You are an expert project planning AI.

Project: ${name}
Goal: ${goal}
Deadline: ${deadline} (${daysLeft} days from today)
Hours available per day: ${hoursPerDay}

Break this into a daily task schedule AND generate file path mappings.

Return ONLY valid JSON with this exact shape — no markdown, no explanation, no extra text:
{
  "tasks": [
    {
      "id": "t1",
      "day": 1,
      "title": "Task title here",
      "estimatedH": 2,
      "priority": "high",
      "dependencies": []
    }
  ],
  "mapping": {
    "t1": ["src/auth", "routes/auth.js"],
    "t2": ["src/components", "frontend/pages"]
  }
}

Rules:
- Total estimatedH must not exceed ${daysLeft * hoursPerDay} hours
- priority must be exactly: high, medium, or low
- mapping values are file path patterns for this task
- Spread tasks across all ${daysLeft} days
- Return JSON only. No markdown. No explanation. No extra text before or after.`;

  const response = await client.chat.completions.create({
    model:       MODEL,
    max_tokens:  4096,
    temperature: 0.3,
    messages: [
      {
        role:    'system',
        content: 'You are a project planning AI. You return only valid JSON. No markdown. No explanation. No text before or after the JSON.',
      },
      {
        role:    'user',
        content: prompt,
      },
    ],
  });

  const raw   = response.choices[0].message.content.trim();
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error('JSON parse failed. Raw response:', raw);
    throw new Error('AI returned invalid JSON. Try again.');
  }
};

exports.generateInsight = async ({ name, completionPct, daysBehind, streak }) => {
  const response = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: 100,
    messages: [
      {
        role:    'system',
        content: 'You give short project productivity insights. One sentence only. No quotes.',
      },
      {
        role:    'user',
        content: `Project "${name}": ${completionPct}% complete, ${daysBehind} days behind, ${streak}-day streak. Give one specific motivational insight in under 20 words.`,
      },
    ],
  });

  return response.choices[0].message.content.trim();
};

exports.rescheduleProject = async ({ name, remainingTasks, daysLeft, hoursPerDay }) => {
  const prompt = `You are a project rescheduling AI.

Project: ${name}
Days remaining: ${daysLeft}
Hours per day: ${hoursPerDay}

Remaining tasks:
${JSON.stringify(remainingTasks, null, 2)}

Redistribute these tasks across ${daysLeft} days.
Return ONLY a valid JSON array of the same tasks with updated "day" values starting from 1.
No markdown. No explanation. JSON array only.`;

  const response = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: 4096,
    messages: [
      {
        role:    'system',
        content: 'You return only valid JSON arrays. No markdown. No explanation.',
      },
      {
        role:    'user',
        content: prompt,
      },
    ],
  });

  const raw   = response.choices[0].message.content.trim();
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};