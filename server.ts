import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const createTaskSchema: FunctionDeclaration = {
  name: "create_task",
  description: "Create a new task in the application",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the task" },
      description: { type: Type.STRING, description: "Detailed description of the task" },
      category: { type: Type.STRING, description: "Category/Folder for the task (e.g., Work, Personal, Shopping)" },
      priority: { type: Type.STRING, description: "Priority of the task (low, medium, high)", enum: ["low", "medium", "high"] },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tags for the task" },
      dueDate: { type: Type.STRING, description: "Due date in ISO string format" },
      subtasks: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING }
          }
        },
        description: "List of sub-tasks"
      }
    },
    required: ["title"]
  }
};

const createEventSchema: FunctionDeclaration = {
  name: "create_event",
  description: "Create a new calendar event",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the event" },
      date: { type: Type.STRING, description: "Date in ISO string format" },
      startTime: { type: Type.STRING, description: "Start time in HH:mm format" },
      endTime: { type: Type.STRING, description: "End time in HH:mm format" },
      location: { type: Type.STRING, description: "Location of the event" },
      description: { type: Type.STRING, description: "Description of the event" },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tags for the event" },
      category: { type: Type.STRING, description: "Category/Folder for the event" }
    },
    required: ["title", "date", "startTime", "endTime"]
  }
};

const createNoteSchema: FunctionDeclaration = {
  name: "create_note",
  description: "Create a new note in the vault",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the note" },
      content: { type: Type.STRING, description: "Content/Body of the note" },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tags for the note" },
      pinned: { type: Type.BOOLEAN, description: "Whether to pin the note to the top" },
      color: { type: Type.STRING, description: "Hex color or name for the note's atmosphere" }
    },
    required: ["title", "content"]
  }
};

const createFolderSchema: FunctionDeclaration = {
  name: "create_folder",
  description: "Create a new category or folder to organize tasks",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name of the folder" },
      color: { type: Type.STRING, description: "Hex color code for the folder icon/tag" }
    },
    required: ["name"]
  }
};

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: `Today is ${new Date().toISOString()}. Current context: ${JSON.stringify(req.body.context || {})}` }] },
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are an intelligent assistant for a productivity app called Flow. You can help users manage their tasks, events, and notes. When a user asks to add something, use the appropriate tool. If they are just chatting, respond helpfully and briefly. All data should be returned via tool calls when possible.",
        tools: [{ functionDeclarations: [createTaskSchema, createEventSchema, createNoteSchema, createFolderSchema] }]
      }
    });

    res.json({
      text: response.text,
      functionCalls: response.functionCalls
    });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
