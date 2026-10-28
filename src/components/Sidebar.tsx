import React from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { isModelLoaded, getLoadedModels } from '../services/neuralEngine';
import {
  LayoutDashboard, MessageSquare, GitBranch, Bot, Package,
  BookOpen, FileText, Image, Mic, Zap, Server, Settings,
  ChevronLeft, ChevronRight, Brain, Cpu, Globe, Video
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { id: 'chat', icon: MessageSquare, label: 'nav.chat' },
  { id: 'flowBuilder', icon: GitBranch, label: 'nav.flowBuilder' },
  { id: 'agents', icon: Bot, label: 'nav.agents' },
  { id: 'models', icon: Package, label: 'nav.models' },
  { id: 'browser', icon: Globe, label: 'nav.browser' },
  { id: 'knowledge', icon: BookOpen, label: 'nav.knowledge' },
  { id: 'documents', icon: FileText, label: 'nav.documents' },
  { id: 'imageAI', icon: Image, label: 'nav.imageAI' },
  { id: 'videoAI', icon: Video, label: 'nav.videoAI' },
  { id: 'audioAI', icon: Mic, label: 'nav.audioAI' },
  { id: 'automation', icon: Zap, label: 'nav.automation' },
  { id: 'apiServer', icon: Server, label: 'nav.apiServer' },
  { id: 'settings', icon: Settings, label: 'nav.settings' },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, language, loadedModels, modelLoadStatus } = useStore();
  const [collapsed, setCollapsed] = React.useState(false);

  const hasLoadedModels = loadedModels.length > 0;
  const anyLoading = Object.values(modelLoadStatus).some(s => s.loading);

  return (
    <div className={`h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} glass border-r border-indigo-500/20`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-indigo-500/20">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-white">Local Flow AI</h1>
            <div className="flex items-center gap-1.5">
              {anyLoading ? (
                <>
                  <Cpu className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="text-[10px] text-amber-400">Завантаження...</span>
                </>
              ) : hasLoadedModels ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-green-400">Нейромережа активна</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span className="text-[10px] text-slate-500">Моделі не завантажені</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              title={collapsed ? t(item.label, language) : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-300'}`} />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{t(item.label, language)}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Loaded Models Indicator */}
      {!collapsed && loadedModels.length > 0 && (
        <div className="p-3 border-t border-indigo-500/20">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Активні моделі</div>
          {loadedModels.map(m => (
            <div key={m} className="flex items-center gap-1.5 text-xs text-indigo-300">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              {m === 'flow-1-flash' ? 'Flow-1 Flash' : 'Flow-1 Pro'}
            </div>
          ))}
        </div>
      )}

      {/* Collapse button */}
      <div className="p-2 border-t border-indigo-500/20">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
