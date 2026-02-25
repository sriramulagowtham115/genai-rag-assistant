import { useState, useEffect, useRef } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem(
        "sessionId",
        Math.random().toString(36).substring(7)
      );
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;

    setLoading(true);

    const userMessage = input;
    setMessages(prev => [
      ...prev,
      { role: "user", content: userMessage }
    ]);

    setInput("");

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: localStorage.getItem("sessionId"),
          message: userMessage
        })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Server error." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>🧠 GenAI RAG Assistant</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          minHeight: "400px",
          overflowY: "auto",
          marginBottom: "10px"
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: "10px"
            }}
          >
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {loading && <p>Thinking...</p>}

      <input
        style={{ width: "80%", padding: "8px" }}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask something..."
      />
      <button
        style={{ padding: "8px 15px", marginLeft: "5px" }}
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
}

export default Chat;