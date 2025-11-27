const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// GET /api/tasks
router.get('/', auth, async (req, res) => {
  const { projectId } = req.query;
  try {
    const tasks = await Task.find({ projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks - Create
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    
    // Real-time: Notify project viewers
    req.io.emit(`project_tasks_${req.body.projectId}`, { action: 'create', task });
    
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id - Update (Drag & Drop triggers this)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, assignedTo, title, description } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: { status, assignedTo, title, description } }, 
      { new: true }
    ).populate('assignedTo', 'name');

    // Real-time: Notify project viewers
    req.io.emit(`project_tasks_${task.projectId}`, { action: 'update', task });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Create Endpoint
router.post('/ai-create', auth, async (req, res) => {
  const { command, projectId } = req.body;
  
  try {
    // 1. Get users in the specific team to allow AI to map names correctly
    const teamMembers = await User.find({ teamId: req.user.teamId }).select('name _id');
    const memberList = teamMembers.map(u => `${u.name} (ID: ${u._id})`).join(', ');

    const prompt = `
      Extract task details from: "${command}".
      Available Team Members: [${memberList}].
      Return strict JSON:
      {
        "title": "string",
        "description": "string",
        "status": "todo" | "in-progress" | "done",
        "assignedTo": "ObjectId of the user from the list above, or null if no name matches"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(cleanJson);

    const newTask = new Task({
      title: aiData.title,
      description: aiData.description || "AI Generated",
      status: aiData.status || 'todo',
      projectId: projectId,
      assignedTo: aiData.assignedTo || req.user._id 
    });

    await newTask.save();
    await newTask.populate('assignedTo', 'name');

    // Real-time
    req.io.emit(`project_tasks_${projectId}`, { action: 'create', task: newTask });

    res.status(201).json(newTask);
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ message: "AI processing failed" });
  }
});


// ⬇️ UPDATED AI ROUTE ⬇️
router.post('/ai-create', auth, async (req, res) => {
  const { command, projectId } = req.body;

  try {
    // 1. FETCH TEAM MEMBERS: The AI needs to know who is available.
    const teamMembers = await User.find({ teamId: req.user.teamId }).select('name _id email');
    
    // Create a string list like: "Pankaj Jaat (ID: 123...), John Doe (ID: 456...)"
    const memberContext = teamMembers.map(u => `${u.name} (ID: ${u._id})`).join(', ');

    // 2. CONSTRUCT A SMARTER PROMPT
    const prompt = `
      You are a smart project manager.
      Command: "${command}"
      
      Context:
      - Current Team Members: [${memberContext}]
      - Current User ID (Creator): ${req.user._id}
      
      Instructions:
      1. Extract the 'title' from the command.
      2. If the user mentions "High Priority" or "Urgent", add "[URGENT]" to the start of the title.
      3. Extract 'description' if provided, otherwise generate a professional short description based on the title.
      4. Determine 'status': "todo", "in-progress", or "done" (default "todo").
      5. Extract 'assignedTo': Look at the Team Members list above. If a name matches similar to what was typed, use that exact ID. If no name matches, use the Creator's ID.
      
      Return ONLY raw JSON (no markdown):
      {
        "title": "string",
        "description": "string",
        "status": "string",
        "assignedTo": "string (The Mongo ID)"
      }
    `;

    // 3. CALL GEMINI
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 4. CLEAN THE RESPONSE (Remove ```json ... ```)
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    
    let aiData;
    try {
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      // If AI fails to give JSON, fallback to manual creation
      aiData = {
        title: command,
        description: "Created via AI (Parsing Failed)",
        status: 'todo',
        assignedTo: req.user._id
      };
    }

    // 5. SAVE TO DB
    const newTask = new Task({
      title: aiData.title,
      description: aiData.description,
      status: aiData.status || 'todo',
      projectId: projectId,
      assignedTo: aiData.assignedTo || req.user._id
    });

    await newTask.save();
    
    // Populate details so frontend shows name immediately
    await newTask.populate('assignedTo', 'name email');

    // 6. REAL-TIME SOCKET EMIT
    // Notify the frontend to update the board without refreshing
    if (req.io) {
        req.io.emit(`project_tasks_${projectId}`, { action: 'create', task: newTask });
    }

    res.status(201).json(newTask);

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ message: "Failed to process AI command" });
  }
});

module.exports = router;

