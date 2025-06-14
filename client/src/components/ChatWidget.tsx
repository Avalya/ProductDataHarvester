import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Bot, Send, X } from "lucide-react";
import { useChat } from "@/hooks/useAI";
import { ChatMessage } from "@/types";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your AI career assistant. I can help you find the perfect opportunities, answer questions about applications, and provide personalized recommendations. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chat = useChat();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await chat.mutateAsync({ 
        message: inputMessage,
        context: { 
          currentPage: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 ai-gradient rounded-full shadow-lg hover:scale-105 transition-all duration-300 ai-glow"
      >
        <Bot className="w-6 h-6 text-white" />
      </Button>
      
      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 h-96 glass-card shadow-2xl animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 ai-gradient rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">AI Assistant</h4>
                <p className="text-xs text-gray-400">Online now</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-sm ${
                      message.isUser
                        ? "bg-green-400/20 text-white"
                        : "chat-bubble"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {chat.isPending && (
                <div className="flex justify-start">
                  <div className="chat-bubble p-3 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-400">AI is typing</span>
                      <div className="flex space-x-1">
                        <div className="ai-typing"></div>
                        <div className="ai-typing"></div>
                        <div className="ai-typing"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 glass-card border-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
                  disabled={chat.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || chat.isPending}
                  className="ai-gradient hover:scale-105 transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
