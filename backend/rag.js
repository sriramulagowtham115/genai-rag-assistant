import { getEmbedding } from "./embeddings.js";
import { getVectors } from "./vectorStore.js";

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export async function retrieveRelevantChunks(query) {
  const queryEmbedding = await getEmbedding(query);
  const vectors = getVectors();

  const scored = vectors.map(v => ({
    ...v,
    score: cosineSimilarity(queryEmbedding, v.embedding)
  }));

  return scored
    .filter(v => v.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}