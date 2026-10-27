import React, { useEffect } from 'react';
import { useStore } from './store';
import { checkOllamaConnection } from './services/ollama';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import FlowBuilder from './pages/FlowBuilder';
import Models from './pages/Models';
import Agents from './pages/Agents';
import KnowledgeBase from './pages/KnowledgeBase';
import Settings from './pages/Settings';
import ImageAI from './pages/ImageAI';
import AudioAI from './pages/AudioAI';
import Automation from './pages/Automation';
import APIServer from './pages/APIServer';
import Documents from './pages/Documents';
import { Toaster } from 'react-hot-toast';

function App() {
  const { currentPage, theme, ollamaUrl } = useStore();

  useEffect(() => {
    // Check Ollama connection on mount
    checkOllamaConnection();
    
    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      checkOllamaConnection();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [ollamaUrl]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'chat': return <Chat />;
      case 'flowBuilder': return <FlowBuilder />;
      case 'models': return <Models />;
      case 'agents': return <Agents />;
      case 'knowledge': return <KnowledgeBase />;
      case 'documents': return <Documents />;
      case 'imageAI': return <ImageAI />;
      case 'audioAI': return <AudioAI />;
      case 'automation': return <Automation />;
      case 'apiServer': return <APIServer />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`h-screen w-screen flex overflow-hidden ${theme === 'dark' ? 'bg-[#0f0a2e]' : 'bg-slate-100'}`}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(30, 27, 75, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
          },
        }}
      />
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
