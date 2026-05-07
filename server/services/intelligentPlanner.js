const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate enhanced AI project plan with document context
 * @param {Object} params - Planning parameters
 * @returns {Promise<Object>} - Enhanced planning result with insights
 */
async function generateEnhancedPlan({ name, combinedContext, deadline, hoursPerDay, documentContext }) {
  const daysLeft = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `You are an expert AI project planning assistant with deep technical knowledge.

PROJECT NAME: ${name}
DEADLINE: ${deadline} (${daysLeft} days from today)
HOURS AVAILABLE PER DAY: ${hoursPerDay}
TOTAL AVAILABLE HOURS: ${daysLeft * hoursPerDay}

CONTEXT:
${combinedContext}

Your task is to create an intelligent, comprehensive project plan.

Return ONLY valid JSON with this exact structure:
{
  "tasks": [
    {
      "id": "t1",
      "day": 1,
      "title": "Task title",
      "estimatedH": 2,
      "priority": "high",
      "dependencies": [],
      "category": "setup|frontend|backend|database|api|testing|deployment|documentation"
    }
  ],
  "mapping": {
    "t1": ["src/auth", "routes/auth.js"],
    "t2": ["src/components", "frontend/pages"]
  },
  "insights": {
    "detectedTechStack": ["React", "Node.js", "MongoDB"],
    "estimatedComplexity": "medium",
    "riskAreas": ["Authentication implementation", "API integration"],
    "milestones": [
      {"day": 5, "title": "Core setup complete"},
      {"day": 10, "title": "MVP features ready"}
    ],
    "recommendations": ["Consider using JWT for auth", "Add error handling early"]
  }
}

PLANNING RULES:
1. Create realistic tasks based on detected technologies and features
2. Distribute tasks intelligently across all ${daysLeft} days
3. Total estimated hours must not exceed ${daysLeft * hoursPerDay} hours
4. Priority must be: high, medium, or low
5. Category must match the task type
6. Include setup, development, testing, and deployment phases
7. Add dependencies where tasks depend on others
8. Provide file path mappings for each task
9. Identify risk areas and provide actionable recommendations
10. Create meaningful milestones

Return ONLY the JSON object. No markdown. No explanation. No extra text.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 6000,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: 'You are an expert project planning AI. You return only valid JSON. No markdown. No explanation.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const raw = response.choices[0].message.content.trim();
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    const result = JSON.parse(clean);
    
    // Enhance insights with document context
    if (documentContext && documentContext.hasContent) {
      result.insights = result.insights || {};
      result.insights.documentAnalysis = {
        technologiesFound: documentContext.detectedTechnologies.length,
        featuresIdentified: documentContext.detectedFeatures.length,
        hasArchitectureNotes: !!documentContext.architectureNotes,
        hasApiRequirements: !!documentContext.apiRequirements
      };
    }

    return result;
  } catch (err) {
    console.error('JSON parse failed. Raw response:', raw);
    throw new Error('AI returned invalid JSON. Try again.');
  }
}

module.exports = {
  generateEnhancedPlan
};
