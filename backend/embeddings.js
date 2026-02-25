import { pipeline } from '@xenova/transformers';

let embedder;

// Load model once
export async function loadEmbeddingModel() {
  console.log("Loading embedding model...");
  embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );
  console.log("Embedding model loaded.");
}

export async function getEmbedding(text) {
  const output = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
}