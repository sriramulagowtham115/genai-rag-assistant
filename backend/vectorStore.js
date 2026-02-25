let vectors = [];

export function storeVector(id, embedding, text) {
  vectors.push({ id, embedding, text });
}

export function getVectors() {
  return vectors;
}