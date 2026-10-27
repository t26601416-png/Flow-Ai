import React, { useState } from 'react';
import { useStore, AutomationTask } from '../store';
import { t } from '../i18n';
import {
  Zap, Plus, Trash2, Play, Pause, Clock, CheckCircle,
  AlertCircle, X, Calendar
} from 'lucide-react';

export default function Automation() {
  const { language, automationTasks, addAutomationTask, updateAutomationTask, deleteAutomationTask, flowProjects } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formFlowId, setFormFlowId] = useState('');
  const [formSchedule, setFormSchedule] = useState('manual');

  const handleCreate = () => {
    if (!formName.trim()) return;
    const task: AutomationTask = {
      id: `task-${Date.now()}`,
      name: formName,
      flowId: formFlowId,
      schedule: formSchedule,
      enabled: true,
      status: 'idle',
    };
    addAutomationTask(task);
    setShowCreate(false);
    setFormName('');
    setFormFlowId('');
    setFormSchedule('manual');
  };

  const handleRun = async (taskId: string) => {
    updateAutomationTask(taskId, { status: 'running', lastRun: Date.now() });
    await new Promise(r => setTimeout(r, 2000));
    updateAutomationTask(taskId, { status: 'success' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-400" />
            {t('nav.automation', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Автоматизація AI-процесів' : 'AI process automation'}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {language === 'uk' ? 'Нове завдання' : 'New Task'}
        </button>
      </div>

      {/* Tasks */}
      {automationTasks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            {language === 'uk' ? 'Немає завдань' : 'No tasks'}
          </h3>
          <p className="text-sm text-slate-500">
            {language === 'uk'
              ? 'Створіть автоматичне завдання для запуску Flow-процесів'
              : 'Create an automated task to run Flow processes'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {automationTasks.map((task) => (
            <div key={task.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(task.status)}
                <div>
                  <h3 className="text-sm font-medium text-white">{task.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.schedule === 'manual' ? (language === 'uk' ? 'Вручну' : 'Manual') : task.schedule}
                    </span>
                    {task.lastRun && (
                      <span>{new Date(task.lastRun).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRun(task.id)}
                  disabled={task.status === 'running'}
                  className="p-2 rounded-lg hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-colors disabled:opacity-30"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateAutomationTask(task.id, { enabled: !task.enabled })}
                  className={`p-2 rounded-lg transition-colors ${task.enabled ? 'text-green-400 hover:bg-green-500/20' : 'text-slate-500 hover:bg-white/5'}`}
                >
                  {task.enabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteAutomationTask(task.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {language === 'uk' ? 'Нове завдання' : 'New Task'}
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{language === 'uk' ? 'Назва' : 'Name'}</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Flow</label>
                <select
                  value={formFlowId}
                  onChange={(e) => setFormFlowId(e.target.value)}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">{language === 'uk' ? 'Оберіть Flow' : 'Select Flow'}</option>
                  {flowProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">{language === 'uk' ? 'Розклад' : 'Schedule'}</label>
                <select
                  value={formSchedule}
                  onChange={(e) => setFormSchedule(e.target.value)}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="manual">{language === 'uk' ? 'Вручну' : 'Manual'}</option>
                  <option value="hourly">{language === 'uk' ? 'Щогодини' : 'Hourly'}</option>
                  <option value="daily">{language === 'uk' ? 'Щодня' : 'Daily'}</option>
                  <option value="webhook">Webhook</option>
                  <option value="file_watch">{language === 'uk' ? 'При імпорті файлу' : 'On file import'}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-white/5 text-sm transition-colors"
              >
                {t('common.cancel', language)}
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-sm font-medium transition-colors disabled:opacity-30"
              >
                {language === 'uk' ? 'Створити' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
