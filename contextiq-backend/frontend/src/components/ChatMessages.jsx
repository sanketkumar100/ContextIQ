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
} from 'lucide-react';

export const ChatMessages = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 max-w-3xl w-full mx-auto">
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
      <div className="flex items-start justify-end gap-2.5 select-text">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 px-4 py-2.5 text-sm leading-relaxed break-words shadow-sm">
          {message.text}
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5 text-xs">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  // Assistant Message
  const hasCitations = message.citations && message.citations.length > 0;

  return (
    <div className="flex items-start gap-3 select-text">
      {/* Bot Avatar */}
      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-4 h-4" />
      </div>

      {/* Bot Message Box */}
      <div className="flex-1 max-w-[88%] rounded-2xl rounded-tl-sm bg-white dark:bg-[#121620] border border-slate-200/90 dark:border-slate-800/80 p-4 shadow-sm relative group">
        {/* Message Content */}
        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200 leading-relaxed break-words font-sans">
          {message.text ? (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-slate-800 dark:bg-slate-200 animate-pulse align-middle rounded-sm" />
              )}
            </>
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2 text-slate-400 py-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
              <span>Generating response...</span>
            </div>
          ) : (
            <span className="text-slate-400 italic text-xs">No response generated.</span>
          )}
        </div>

        {/* Citations Box */}
        {hasCitations && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>
                  Sources ({message.citations.length} chunks)
                </span>
              </div>
              {showCitations ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showCitations && (
              <div className="mt-2 space-y-1.5">
                {message.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {cite.fileName || 'Document'}
                      </span>
                      <div className="flex items-center gap-2">
                        {cite.pageNumber !== null && cite.pageNumber !== undefined && (
                          <span>p. {cite.pageNumber}</span>
                        )}
                        {cite.similarityScore !== null && cite.similarityScore !== undefined && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                            {(cite.similarityScore * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px] leading-relaxed line-clamp-3 bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                      {cite.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer info: Response time and Copy button */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 select-none">
          <div className="flex items-center gap-3">
            {message.responseTimeMs && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{(message.responseTimeMs / 1000).toFixed(1)}s</span>
              </div>
            )}
            {message.isStreaming && (
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Streaming...
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
