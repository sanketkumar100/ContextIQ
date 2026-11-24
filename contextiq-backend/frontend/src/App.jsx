import React from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { UploadModal } from './components/UploadModal';
import { SearchModal } from './components/SearchModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { ChatSessionSelector } from './components/ChatSessionSelector';

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0c1017] dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout: Left Sidebar + Center Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatArea />
      </div>

      {/* Interactive Modals & Drawers */}
      <UploadModal />
      <SearchModal />
      <DocumentDetailModal />
      <ChatSessionSelector />
    </div>
  );
};

export default App;
