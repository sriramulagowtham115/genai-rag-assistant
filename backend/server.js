import express from "express";
import cors from "cors";
import fs from "fs";

import { chunkText } from "./chunker.js";
import { storeVector } from "./vectorStore.js";
import { loadEmbeddingModel, getEmbedding } from "./embeddings.js";
import { retrieveRelevantChunks } from "./rag.js";
import { saveMessage, getHistory } from "./sessionStore.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- Initialize Embeddings ---------- */

async function initializeEmbeddings() {
  await loadEmbeddingModel();

  const docs = JSON.parse(fs.readFileSync("./docs.json"));

  for (let doc of docs) {
    const chunks = chunkText(doc.content);

    for (let chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      storeVector(doc.title, embedding, chunk);
    }
  }

  console.log("Documents embedded locally.");
}

await initializeEmbeddings();

/* ---------- Simple Local Generator ---------- */

function generateAnswerFromContext(context, question) {
  return `
Based on the available information:

${context}

(Answer generated from retrieved context only.)
`;
}

/* ---------- Chat API ---------- */

app.post("/api/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Invalid input" });
    }

    saveMessage(sessionId, "user", message);

    const retrievedChunks = await retrieveRelevantChunks(message);

    if (retrievedChunks.length === 0) {
      return res.json({
        reply: "I do not have enough information.",
        retrievedChunks: 0
      });
    }

    const contextText = retrievedChunks
      .map(chunk => chunk.text)
      .join("\n");

    const reply = generateAnswerFromContext(contextText, message);

    saveMessage(sessionId, "assistant", reply);

    res.json({
      reply,
      retrievedChunks: retrievedChunks.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);