import express from "express";
import cors from "cors";
import fs from "fs";

import { chunkText } from "./chunker.js";
import { storeVector } from "./vectorStore.js";
import { loadEmbeddingModel, getEmbedding } from "./embeddings.js";
import { retrieveRelevantChunks } from "./rag.js";
import { saveMessage } from "./sessionStore.js";

const app = express();

/* ---------------- CORS CONFIG ---------------- */

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* ---------------- INITIALIZE EMBEDDINGS ---------------- */

async function initializeEmbeddings() {
  try {
    console.log("Loading embedding model...");
    await loadEmbeddingModel();

    const docs = JSON.parse(fs.readFileSync("./docs.json"));

    for (let doc of docs) {
      const chunks = chunkText(doc.content);

      for (let chunk of chunks) {
        const embedding = await getEmbedding(chunk);
        storeVector(doc.title, embedding, chunk);
      }
    }

    console.log("Documents embedded successfully.");
  } catch (error) {
    console.error("Error initializing embeddings:", error);
  }
}

await initializeEmbeddings();

/* ---------------- SIMPLE LOCAL GENERATOR ---------------- */

function generateAnswerFromContext(context) {
  return `
Based on the available information:

${context}

(Answer generated strictly from retrieved context.)
`;
}

/* ---------------- CHAT ENDPOINT ---------------- */

app.post("/api/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: "Invalid input"
      });
    }

    saveMessage(sessionId, "user", message);

    const retrievedChunks = await retrieveRelevantChunks(message);

    if (!retrievedChunks || retrievedChunks.length === 0) {
      return res.json({
        reply: "I do not have enough information.",
        retrievedChunks: 0
      });
    }

    const contextText = retrievedChunks
      .map(chunk => chunk.text)
      .join("\n");

    const reply = generateAnswerFromContext(contextText);

    saveMessage(sessionId, "assistant", reply);

    res.json({
      reply,
      retrievedChunks: retrievedChunks.length
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});