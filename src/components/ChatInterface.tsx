'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatInterface({ onActionTriggered }: { onActionTriggered: () => void }) {
  const { messages, sendMessage, status } = useChat({
    onFinish: (event) => {
      const message = event.message;
      const hasToolParts = message?.parts?.some(
        (p: any) => p.type === 'tool-invocation'
      );
      if (hasToolParts) {
        onActionTriggered();
      }
    }
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const hasToolParts = lastMessage.parts?.some(
        (p: any) => p.type === 'tool-invocation'
      );
      if (hasToolParts) {
        onActionTriggered();
      }
    }
  }, [messages, onActionTriggered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    await sendMessage({ text: trimmed });
  };

  const getMessageText = (m: any): string => {
    if (!m.parts) return m.content || '';
    return m.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('');
  };

  const getToolInvocations = (m: any): any[] => {
    if (!m.parts) return [];
    return m.parts.filter((p: any) => p.type === 'tool-invocation');
  };

  return (
    <div className="flex flex-col h-full glass rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20">
      <div className="bg-slate-800/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Inventory AI</h3>
            <p className="text-xs text-blue-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Bot className="w-16 h-16 mb-4 text-slate-400" />
            <p className="text-lg font-medium text-slate-300">How can I help you manage your inventory?</p>
            <p className="text-sm mt-2 max-w-xs mx-auto">Try asking me to add "10 kg of sugar" or check "how many coffee beans are left?"</p>
          </div>
        )}
        
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap">{getMessageText(m)}</p>
                {getToolInvocations(m).map((tool: any) => (
                  <div key={tool.toolInvocation.toolCallId} className="mt-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700 text-xs font-mono text-emerald-400">
                    <span className="text-slate-400 opacity-70 flex items-center gap-2 mb-1">
                      <Loader2 className={`w-3 h-3 ${tool.toolInvocation.state !== 'result' ? 'animate-spin' : 'hidden'}`} />
                      Executing Action: {tool.toolInvocation.toolName}
                    </span>
                    <pre className="overflow-x-auto">
                      {JSON.stringify(tool.toolInvocation.args, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
           <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex max-w-[80%] gap-3 flex-row">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-700">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 bg-slate-800/50 border border-slate-700 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-400"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center text-white transition-colors"
          >
            <Send className="w-5 h-5 ml-[-2px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
