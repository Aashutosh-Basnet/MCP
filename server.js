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

const toolMap = {
  write_file: writeFile,
  git_push: gitPush,
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/run", validateRequest, async (req, res) => {
  const userPrompt = req.body.prompt;

  const baseInstructions = `
You are an AI code assistant that can return actions in this format:

{
  "cta": {
    "type": "write_file" or "git_push",
    "parameters": { ... }
  }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: baseInstructions },
        { role: "user", content: userPrompt },
      ],
    });

    const modelOutput = JSON.parse(response.choices[0].message.content);
    const { type, parameters } = modelOutput.cta;

    if (!toolMap[type]) {
      throw new Error(`Unsupported tool type: ${type}`);
    }

    const result = await toolMap[type](parameters);
    res.json({ success: true, result });
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