import { useState } from "react";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋 I am Halchal AI Assistant. How can I help you?" }
  ]);
  const [input, setInput] = useState("");

  const getBotResponse = (question) => {
  question = question.toLowerCase();

  if (question.includes("banana")) {
    return "For banana crops, 16mm Inline drip irrigation system is recommended. It provides uniform water distribution for spaced plantation.";
  }

  if (question.includes("cotton")) {
    return "For cotton crops, Premium 16mm Inline drip pipe is recommended.";
  }

  if (question.includes("sugarcane")) {
    return "For sugarcane, 20mm Inline drip irrigation system works best due to higher water requirement.";
  }

  if (question.includes("1 acre") || question.includes("1 aker")) {
    return "For 1 acre land, approximately 4000–4500 meters of 16mm inline drip pipe may be required depending on crop spacing.";
  }

  if (question.includes("best pipe")) {
    return "The best pipe depends on crop type. For vegetables and banana use 16mm. For sugarcane and high water crops use 20mm.";
  }

  if (question.includes("price")) {
    return "Prices are AI-optimized and vary based on demand and region. Please check product section for latest approved price.";
  }

  return "Please tell me your crop type and land size so I can suggest the correct drip irrigation pipe.";
};


  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const botReply = { sender: "bot", text: getBotResponse(input) };

    setMessages([...messages, userMessage, botReply]);
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        AI
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-2xl rounded-xl flex flex-col">
          
          <div className="bg-blue-600 text-white p-3 rounded-t-xl font-semibold">
            Halchal AI Assistant
          </div>

          <div className="flex-1 p-3 overflow-y-auto max-h-80">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg text-sm ${
                  msg.sender === "bot"
                    ? "bg-gray-200 text-black"
                    : "bg-blue-600 text-white ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex border-t">
            <input
              type="text"
              className="flex-1 p-2 text-sm outline-none"
              placeholder="Ask about products..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
