const sessions = {};

export function saveMessage(sessionId, role, content) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }

  sessions[sessionId].push({ role, content });

  sessions[sessionId] = sessions[sessionId].slice(-6);
}

export function getHistory(sessionId) {
  return sessions[sessionId] || [];
}