import React from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { isModelLoaded, getLoadedModels } from '../services/neuralEngine';
import {
  LayoutDashboard, MessageSquare, GitBranch, Bot, Package,
  BookOpen, FileText, Image, Mic, Zap, Server, Settings,
  ChevronLeft, ChevronRight, Brain, Cpu, Globe, Video, Box, Code2
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'nav.dashboard', color: 'from-blue-500 to-cyan-500' },
  { id: 'chat', icon: MessageSquare, label: 'nav.chat', color: 'from-indigo-500 to-purple-500' },
  { id: 'flowBuilder', icon: GitBranch, label: 'nav.flowBuilder', color: 'from-purple-500 to-pink-500' },
  { id: 'flowCodex', icon: Code2, label: 'nav.flowCodex', color: 'from-emerald-500 to-teal-500' },
  { id: 'agents', icon: Bot, label: 'nav.agents', color: 'from-cyan-500 to-blue-500' },
  { id: 'models', icon: Package, label: 'nav.models', color: 'from-violet-500 to-purple-500' },
  { id: 'browser', icon: Globe, label: 'nav.browser', color: 'from-blue-500 to-indigo-500' },
  { id: 'knowledge', icon: BookOpen, label: 'nav.knowledge', color: 'from-green-500 to-emerald-500' },
  { id: 'documents', icon: FileText, label: 'nav.documents', color: 'from-teal-500 to-cyan-500' },
  { id: 'imageAI', icon: Image, label: 'nav.imageAI', color: 'from-pink-500 to-rose-500' },
  { id: 'videoAI', icon: Video, label: 'nav.videoAI', color: 'from-purple-500 to-violet-500' },
  { id: 'model3DAI', icon: Box, label: 'nav.model3DAI', color: 'from-orange-500 to-red-500' },
  { id: 'audioAI', icon: Mic, label: 'nav.audioAI', color: 'from-fuchsia-500 to-pink-500' },
  { id: 'automation', icon: Zap, label: 'nav.automation', color: 'from-yellow-500 to-orange-500' },
  { id: 'apiServer', icon: Server, label: 'nav.apiServer', color: 'from-slate-500 to-gray-500' },
  { id: 'settings', icon: Settings, label: 'nav.settings', color: 'from-gray-500 to-slate-500' },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, language, loadedModels, modelLoadStatus } = useStore();
  const [collapsed, setCollapsed] = React.useState(false);

  const hasLoadedModels = loadedModels.length > 0;
  const anyLoading = Object.values(modelLoadStatus).some(s => s.loading);

  return (
    <div className={`h-full flex flex-col transition-all duration-500 ease-out ${collapsed ? 'w-20' : 'w-72'} glass border-r border-indigo-500/30 relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 animate-gradient" />
      </div>
      
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-indigo-500/30 relative z-10">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 animate-pulse-glow shadow-lg shadow-indigo-500/50 transition-all duration-300 ${!collapsed ? 'hover:scale-110' : ''}`}>
          <Brain className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex-1">
            <h1 className="text-lg font-bold gradient-text">Local Flow AI</h1>
            <div className="flex items-center gap-2 mt-1">
              {anyLoading ? (
                <>
                  <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-xs text-amber-400">Завантаження...</span>
                </>
              ) : hasLoadedModels ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                  <span className="text-xs text-green-400">Нейромережа активна</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-xs text-slate-500">Моделі не завантажені</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto relative z-10">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden hover-lift ${
                  isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                title={collapsed ? t(item.label, language) : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 rounded-r-full" />
                )}
                
                {/* Icon container */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 shadow-md' 
                    : `bg-gradient-to-br ${item.color} bg-opacity-20 group-hover:scale-110`
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/80'}`} />
                </div>
                
                {!collapsed && (
                  <div className="flex-1 text-left animate-fade-in">
                    <span className="text-sm font-medium">{t(item.label, language)}</span>
                  </div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Loaded Models Indicator */}
      {!collapsed && loadedModels.length > 0 && (
        <div className="p-4 border-t border-indigo-500/30 relative z-10 animate-fade-in">
          <div className="text-xs text-slate-500 uppercase mb-2 font-semibold">Активні моделі</div>
          <div className="space-y-1.5">
            {loadedModels.map(m => (
              <div key={m} className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 rounded-lg px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-lg shadow-indigo-400/50" />
                <span className="font-medium">{m === 'flow-1-flash' ? 'Flow-1 Flash' : m === 'flow-1-pro' ? 'Flow-1 Pro' : m === 'flow-argon-2' ? 'Flow-argon 2' : m === 'flow-1-6-carbon' ? 'Flow 1.6 Carbon' : m}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotkeys Info */}
      {!collapsed && (
        <div className="p-4 border-t border-indigo-500/30 relative z-10 animate-fade-in">
          <div className="text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] font-mono text-slate-400 border border-slate-600/50">Ctrl+1-9</kbd>
              <span className="text-slate-500">Навігація</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] font-mono text-slate-400 border border-slate-600/50">Ctrl+K</kbd>
              <span className="text-slate-500">Чат</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] font-mono text-slate-400 border border-slate-600/50">Ctrl+,</kbd>
              <span className="text-slate-500">Налаштування</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <div className="p-3 border-t border-indigo-500/30 relative z-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-700/30 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </div>
        </button>
      </div>
    </div>
  );
}
