import React from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  LayoutDashboard, MessageSquare, GitBranch, Bot, Package,
  BookOpen, FileText, Image, Mic, Zap, Server, Settings,
  ChevronLeft, ChevronRight, Brain, Globe, Video, Box, Code2
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { id: 'chat', icon: MessageSquare, label: 'nav.chat' },
  { id: 'flowBuilder', icon: GitBranch, label: 'nav.flowBuilder' },
  { id: 'flowCodex', icon: Code2, label: 'nav.flowCodex' },
  { id: 'agents', icon: Bot, label: 'nav.agents' },
  { id: 'models', icon: Package, label: 'nav.models' },
  { id: 'browser', icon: Globe, label: 'nav.browser' },
  { id: 'knowledge', icon: BookOpen, label: 'nav.knowledge' },
  { id: 'documents', icon: FileText, label: 'nav.documents' },
  { id: 'imageAI', icon: Image, label: 'nav.imageAI' },
  { id: 'videoAI', icon: Video, label: 'nav.videoAI' },
  { id: 'model3DAI', icon: Box, label: 'nav.model3DAI' },
  { id: 'audioAI', icon: Mic, label: 'nav.audioAI' },
  { id: 'automation', icon: Zap, label: 'nav.automation' },
  { id: 'apiServer', icon: Server, label: 'nav.apiServer' },
  { id: 'settings', icon: Settings, label: 'nav.settings' },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, language, loadedModels } = useStore();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={`h-full flex flex-col transition-all duration-500 ease-out ${collapsed ? 'w-20' : 'w-72'} glass-strong border-r border-white/5 relative overflow-hidden`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-4 border-b border-white/5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30 animate-glow">
          <Brain className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex-1">
            <h1 className="text-xl font-bold gradient-text tracking-tight">Local Flow AI</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-subtle shadow-lg shadow-green-400/50" />
              <span className="text-xs text-zinc-400 font-medium">
                {loadedModels.length > 0 ? 'Нейромережа активна' : 'Готова до роботи'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto relative z-10">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title={collapsed ? t(item.label, language) : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-r-full" />
                )}
                
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 shadow-md' 
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-indigo-300' : 'text-zinc-400 group-hover:text-white'
                  }`} />
                </div>
                
                {!collapsed && (
                  <span className="text-sm font-medium flex-1 text-left">{t(item.label, language)}</span>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Loaded Models */}
      {!collapsed && loadedModels.length > 0 && (
        <div className="p-4 border-t border-white/5 relative z-10 animate-fade-in">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-semibold">Активні моделі</div>
          <div className="space-y-2">
            {loadedModels.slice(0, 3).map(m => (
              <div key={m} className="flex items-center gap-2 text-xs bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-subtle shadow-lg shadow-indigo-400/50" />
                <span className="text-zinc-300 font-medium">
                  {m === 'flow-1-flash' ? 'Flow-1 Flash' : 
                   m === 'flow-1-pro' ? 'Flow-1 Pro' : 
                   m === 'flow-argon-2' ? 'Flow-argon 2' : 
                   m === 'flow-1-6-carbon' ? 'Flow 1.6 Carbon' : m}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotkeys */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5 relative z-10">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
              <kbd className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-mono text-zinc-400 border border-white/10">Ctrl+1-9</kbd>
              <span>Навігація</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <kbd className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-mono text-zinc-400 border border-white/10">Ctrl+K</kbd>
              <span>Чат</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <div className="p-3 border-t border-white/5 relative z-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
        >
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </div>
        </button>
      </div>
    </div>
  );
}
