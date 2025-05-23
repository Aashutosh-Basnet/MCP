require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');
const OpenAI = require("openai");

const writeFile = require("./tools/writefile");
const gitPush = require("./tools/gitpush");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(bodyParser.json());

// Input validation middleware
const validateRequest = (req, res, next) => {
  if (!req.body.prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  next();
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Direct git push endpoint
app.post("/git-push", async (req, res) => {
  try {
    const { commitMessage } = req.body;
    if (!commitMessage) {
      return res.status(400).json({ error: "Commit message is required" });
    }
    const result = await gitPush({ commitMessage: String(commitMessage) });
    res.json({ success: true, result });
  } catch (err) {
    console.error(`Git operation failed: ${err.message}`);
    res.status(500).json({
      error: "Git operation failed",
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

const toolMap = {
  write_file: writeFile,
  git_push: async (params) => {
    if (!params.commitMessage) {
      throw new Error('Commit message is required for git operations');
    }
    return gitPush({ commitMessage: String(params.commitMessage) });
  }
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/run", validateRequest, async (req, res) => {
  const userPrompt = req.body.prompt;

  const baseInstructions = `You are an AI assistant that MUST return ONLY valid JSON in the following format:

{
  "operations": [
    {
      "type": "write_file",
      "parameters": {
        "filePath": "path/to/file",
        "content": "file content"
      }
    },
    {
      "type": "git_push",
      "parameters": {
        "commitMessage": "descriptive commit message"
      }
    }
  ]
}

Always include both write_file and git_push operations in that order.
DO NOT include any explanations or text outside of the JSON. Return ONLY the JSON object.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: baseInstructions 
        },
        { 
          role: "user", 
          content: `Return a JSON object for this request: ${userPrompt}. Remember to return ONLY the JSON object, no other text.` 
        },
      ],
    });

    let modelOutput;
    try {
      modelOutput = JSON.parse(response.choices[0].message.content.trim());
    } catch (parseError) {
      console.error('Invalid JSON from OpenAI:', response.choices[0].message.content);
      throw new Error('Failed to parse AI response as JSON. Please try again.');
    }

    const results = [];
    
    // Execute operations in sequence
    for (const operation of modelOutput.operations) {
      const { type, parameters } = operation;
      
      if (!toolMap[type]) {
        throw new Error(`Unsupported tool type: ${type}`);
      }

      const result = await toolMap[type](parameters);
      results.push(result);
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error(`Error processing request: ${err.message}`);
    res.status(500).json({ 
      error: "Failed to process request", 
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(3000, () => {
  console.log("MCP server running at http://localhost:3000");
});