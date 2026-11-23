import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Sparkles 
} from 'lucide-react';

export const ChatMessages = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const MessageItem = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showCitations, setShowCitations] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 select-text">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 text-white px-4 py-2.5 text-sm shadow-md shadow-blue-600/20 leading-relaxed break-words">
          {message.text}
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#131b2e] border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Message
  const hasCitations = message.citations && message.citations.length > 0;

  return (
    <div className="flex items-start gap-3 select-text">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
        <Bot className="w-4 h-4" />
      </div>

      {/* Bot Message Box */}
      <div className="flex-1 max-w-[85%] rounded-2xl rounded-tl-sm bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800/90 p-4 shadow-md dark:shadow-xl shadow-slate-200/50 dark:shadow-black/30 relative group">
        {/* Message Content */}
        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200 leading-relaxed break-words font-sans">
          {message.text ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Thinking and generating answer...</span>
            </div>
          ) : (
            <span className="text-slate-500 italic">No content generated.</span>
          )}
        </div>

        {/* Citations Box */}
        {hasCitations && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-1 transition"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>
                  Source Citations ({message.citations.length} chunks referenced)
                </span>
              </div>
              {showCitations ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showCitations && (
              <div className="mt-2 space-y-2">
                {message.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-300">
                        {cite.fileName || 'Document'}
                      </span>
                      <div className="flex items-center gap-2">
                        {cite.pageNumber !== null && cite.pageNumber !== undefined && (
                          <span>Page {cite.pageNumber}</span>
                        )}
                        {cite.similarityScore !== null && cite.similarityScore !== undefined && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-mono text-[10px]">
                            {(cite.similarityScore * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px] leading-relaxed line-clamp-3 bg-white dark:bg-[#090d16] p-2 rounded border border-slate-200 dark:border-slate-800">
                      {cite.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer info: Response time and Copy button */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none">
          <div className="flex items-center gap-3">
            {message.responseTimeMs && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{message.responseTimeMs} ms</span>
              </div>
            )}
            {message.isStreaming && (
              <span className="text-blue-500 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" />
                Streaming...
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
