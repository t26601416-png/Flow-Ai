import React from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  FileText, Upload, Search, FolderOpen
} from 'lucide-react';

export default function Documents() {
  const { language } = useStore();

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-teal-400" />
            {t('nav.documents', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Керування документами та файлами' : 'Document and file management'}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-12 text-center">
        <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">
          {language === 'uk' ? 'Менеджер документів' : 'Document Manager'}
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          {language === 'uk'
            ? 'Тут ви можете переглядати та керувати всіма завантаженими документами. Документи використовуються в базі знань для RAG-пошуку.'
            : 'Here you can view and manage all uploaded documents. Documents are used in the knowledge base for RAG search.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm">
            PDF, TXT, DOCX, MD, CSV, JSON
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          {language === 'uk'
            ? '💡 Використовуйте "База знань" для імпорту та індексації документів'
            : '💡 Use "Knowledge Base" to import and index documents'}
        </p>
      </div>
    </div>
  );
}
