import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  Lightbulb,
  Code2,
  PenTool,
  Brain,
  Sparkles,
  Bookmark
} from 'lucide-react';

export const WelcomeTemplates = () => {
  const { sendMessage, selectedDocument, chatMode } = useApp();

  const isGeneral = chatMode === 'general';

  const documentTemplates = [
    {
      id: 'summarize',
      title: 'Summarize Key Highlights',
      description: 'Generate an executive summary of key findings and main takeaways.',
      icon: <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: selectedDocument
        ? `Summarize the key points and executive highlights of ${selectedDocument.fileName}.`
        : 'Summarize the key points and executive highlights of the uploaded documents.',
    },
    {
      id: 'qa-insights',
      title: 'Interview & Q&A Insights',
      description: 'Extract the most critical questions, answers, and concepts.',
      icon: <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: selectedDocument
        ? `What are the most critical questions and answers covered in ${selectedDocument.fileName}?`
        : 'What are the most critical questions and answers covered in the document corpus?',
    },
    {
      id: 'action-items',
      title: 'Action Items & Deadlines',
      description: 'List actionable takeaways, requirements, and responsibilities.',
      icon: <CheckSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: selectedDocument
        ? `List all actionable takeaways, deadlines, and key responsibilities mentioned in ${selectedDocument.fileName}.`
        : 'List all actionable takeaways, deadlines, and responsibilities mentioned in the documents.',
    },
    {
      id: 'technical-concepts',
      title: 'Explain Core Concepts',
      description: 'Explain technical mechanisms, architecture, and terminology.',
      icon: <Lightbulb className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: selectedDocument
        ? `Explain the main technical concepts and architecture described in ${selectedDocument.fileName}.`
        : 'Explain the main technical concepts and architecture described in these documents.',
    },
  ];

  const generalTemplates = [
    {
      id: 'brainstorm',
      title: 'Brainstorm Solutions',
      description: 'Explore creative ideas, angles, and strategies for your project.',
      icon: <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: 'Brainstorm 5 innovative ideas or strategic angles for building a modern web application.',
    },
    {
      id: 'code-debug',
      title: 'Code Architecture',
      description: 'Write clean code patterns, discuss algorithms, or debug logic.',
      icon: <Code2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: 'How do I implement efficient debounce and throttle functions in JavaScript/TypeScript? Explain with clean examples.',
    },
    {
      id: 'draft-write',
      title: 'Draft & Refine',
      description: 'Draft a professional communication, summary, or report.',
      icon: <PenTool className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: 'Draft a professional update email to stakeholders summarizing the successful completion of frontend integration.',
    },
    {
      id: 'explain-concept',
      title: 'Intuitive Analogies',
      description: 'Break down complex concepts into simple, intuitive explanations.',
      icon: <Brain className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      prompt: 'Explain how Vector Databases and cosine similarity work in AI RAG applications using an intuitive analogy.',
    },
  ];

  const templates = isGeneral ? generalTemplates : documentTemplates;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto select-none">
      {/* Calm Logo / Emblem */}
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-4 shadow-sm">
        <Bookmark className="w-5 h-5 fill-current" />
      </div>

      {/* Main Title & Description */}
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        {isGeneral
          ? 'How can I assist you today?'
          : 'What would you like to explore?'}
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
        {isGeneral
          ? 'Conversational AI mode. Ask any question freely without document retrieval.'
          : selectedDocument
          ? `Grounded in ${selectedDocument.fileName}. Ask questions or click a starter below.`
          : 'Grounded in all indexed documents. Ask questions with source citations.'}
      </p>

      {/* 2x2 Feature Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => sendMessage(tpl.prompt)}
            className="p-3.5 rounded-xl bg-white dark:bg-[#121620] hover:bg-slate-50 dark:hover:bg-[#181d2a] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {tpl.icon}
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tpl.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal pl-6">
              {tpl.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
