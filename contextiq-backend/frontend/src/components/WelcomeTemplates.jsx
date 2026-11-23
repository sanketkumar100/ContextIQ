import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  Lightbulb,
  Cpu,
  Code2,
  PenTool,
  Brain,
  Sparkles
} from 'lucide-react';

export const WelcomeTemplates = () => {
  const { sendMessage, selectedDocument, chatMode } = useApp();

  const isGeneral = chatMode === 'general';

  const documentTemplates = [
    {
      id: 'summarize',
      title: 'Summarize Key Points',
      description: 'Summarize the key points and executive highlights of this document.',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/20 hover:border-blue-500/50',
      prompt: selectedDocument
        ? `Summarize the key points and executive highlights of ${selectedDocument.fileName}.`
        : 'Summarize the key points and executive highlights of the uploaded documents.',
    },
    {
      id: 'qa-insights',
      title: 'Interview / Q&A Insights',
      description: 'What are the most critical questions and answers covered in this text?',
      icon: <HelpCircle className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/20 hover:border-rose-500/50',
      prompt: selectedDocument
        ? `What are the most critical questions and answers covered in ${selectedDocument.fileName}?`
        : 'What are the most critical questions and answers covered in the document corpus?',
    },
    {
      id: 'action-items',
      title: 'Action Items & Deadlines',
      description: 'List all actionable takeaways, deadlines, and responsibilities mentioned.',
      icon: <CheckSquare className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/20 hover:border-cyan-500/50',
      prompt: selectedDocument
        ? `List all actionable takeaways, deadlines, and key responsibilities mentioned in ${selectedDocument.fileName}.`
        : 'List all actionable takeaways, deadlines, and responsibilities mentioned in the documents.',
    },
    {
      id: 'technical-concepts',
      title: 'Technical Concepts',
      description: 'Explain the main technical concepts and architecture described in this document.',
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/20 hover:border-amber-500/50',
      prompt: selectedDocument
        ? `Explain the main technical concepts and architecture described in ${selectedDocument.fileName}.`
        : 'Explain the main technical concepts and architecture described in these documents.',
    },
  ];

  const generalTemplates = [
    {
      id: 'brainstorm',
      title: 'Brainstorm Ideas',
      description: 'Brainstorm 5 creative ideas, angles, or solutions for my project.',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/20 hover:border-purple-500/50',
      prompt: 'Brainstorm 5 innovative ideas or strategic angles for building a modern web application.',
    },
    {
      id: 'code-debug',
      title: 'Code & Debug',
      description: 'Write a clean function, review best practices, or explain algorithms.',
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/20 hover:border-cyan-500/50',
      prompt: 'How do I implement efficient debounce and throttle functions in JavaScript/TypeScript? Explain with examples.',
    },
    {
      id: 'draft-write',
      title: 'Draft & Write',
      description: 'Draft a clear, professional email, executive summary, or message.',
      icon: <PenTool className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/20 hover:border-emerald-500/50',
      prompt: 'Draft a professional update email to stakeholders summarizing the successful completion of frontend integration.',
    },
    {
      id: 'explain-concept',
      title: 'Explain Concepts',
      description: 'Explain a complex technical or scientific topic using intuitive analogies.',
      icon: <Brain className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/20 hover:border-amber-500/50',
      prompt: 'Explain how Vector Databases and cosine similarity work in AI RAG applications using an intuitive analogy.',
    },
  ];

  const templates = isGeneral ? generalTemplates : documentTemplates;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto select-none">
      {/* Glowing AI Network Logo */}
      <div className="relative mb-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl text-white transform hover:scale-105 transition duration-300 ${
          isGeneral
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/40'
            : 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/40'
        }`}>
          {isGeneral ? <Sparkles className="w-9 h-9" /> : <Cpu className="w-9 h-9" />}
        </div>
        <div className={`absolute inset-0 rounded-2xl blur-xl opacity-40 -z-10 animate-pulse ${
          isGeneral ? 'bg-purple-500' : 'bg-blue-500'
        }`} />
      </div>

      {/* Main Title & Description */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        {isGeneral
          ? 'ContextIQ: Conversational AI Assistant'
          : 'ContextIQ: AI-Powered Document Intelligence System (RAG)'}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
        {isGeneral
          ? 'Chat freely with broad AI general knowledge. No documents are required or referenced in this mode.'
          : 'Upload PDF reports, Word files, or notes and chat naturally with grounded facts, source citations, and page numbers.'}
      </p>

      {/* 2x2 Feature Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl text-left">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => sendMessage(tpl.prompt)}
            className={`p-4 rounded-xl bg-white dark:bg-[#131b2e]/90 hover:bg-slate-50 dark:hover:bg-[#18233c] border border-slate-200 dark:border-transparent ${tpl.color} transition-all duration-200 cursor-pointer shadow-sm dark:shadow-md group`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800/80 group-hover:bg-slate-200 dark:group-hover:bg-slate-700/80 transition-colors">
                {tpl.icon}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                {tpl.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal pl-7">
              {tpl.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
