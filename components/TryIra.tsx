"use client"

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ArrowUpRight, Expand } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

export default function TryIra() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm Ira 💙 How are you feeling today?",
      id: "welcome"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Count user messages
    const userMessageCount = messages.filter(m => m.role === "user").length;
    
    // Check if limit reached
    if (userMessageCount >= 6) {
      return; // Prevent sending more messages
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      id: Date.now().toString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-ira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.reply) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply,
          id: (Date.now() + 1).toString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error("No reply in response:", data);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again! 🙏",
        id: (Date.now() + 1).toString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              <Image 
                src="/ira-dp.jpeg" 
                alt="Ira" 
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ira</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm text-green-600">Online</p>
              </div>
            </div>
          </div>
          <a
            href="https://ira.rumik.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition-colors p-2 hover:bg-gray-200 rounded-full"
            title="Open in full screen"
          >
            <Expand size={20} />
          </a>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "bg-[#f4f0de] text-black"
                    : "bg-black text-[#E5E0CD]"
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-black text-[#E5E0CD] rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {messages.filter(m => m.role === "user").length >= 6 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3">You've reached the message limit</p>
            <a
              href="https://ira.rumik.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-[#E5E0CD] px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Login to Continue
              <ArrowUpRight size={18} />
            </a>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-black transition-colors text-base"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-black text-[#E5E0CD] w-12 h-12 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
