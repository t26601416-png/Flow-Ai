import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  BookOpen, Upload, Trash2, Search, FileText, Database,
  CheckCircle, AlertCircle, Loader
} from 'lucide-react';

export default function KnowledgeBase() {
  const { language, knowledgeDocs, addKnowledgeDoc, deleteKnowledgeDoc, ollamaConnected } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsIndexing(true);

    for (const file of Array.from(files)) {
      // Simulate indexing
      await new Promise(r => setTimeout(r, 1500));
      
      const doc = {
        id: `doc-${Date.now()}-${file.name}`,
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        size: file.size,
        chunks: Math.floor(Math.random() * 50) + 10,
        indexedAt: Date.now(),
      };
      addKnowledgeDoc(doc);
    }

    setIsIndexing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            {t('nav.knowledge', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk'
              ? 'Локальна база знань з RAG-архітектурою'
              : 'Local knowledge base with RAG architecture'}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.md,.csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isIndexing}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isIndexing ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {t('kb.import', language)}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass rounded-2xl p-4 mb-6 border-emerald-500/20 border">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white mb-1">
              {language === 'uk' ? 'RAG (Retrieval-Augmented Generation)' : 'RAG (Retrieval-Augmented Generation)'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'uk'
                ? 'Документи індексуються та розбиваються на фрагменти для семантичного пошуку. AI використовує ці дані для точних відповідей на основі ваших документів.'
                : 'Documents are indexed and split into chunks for semantic search. AI uses this data to provide accurate answers based on your documents.'}
            </p>
            {!ollamaConnected && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {language === 'uk' ? 'Підключіть Ollama для повної функціональності' : 'Connect Ollama for full functionality'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('kb.search', language)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-indigo-500/20 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Documents */}
      {knowledgeDocs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            {language === 'uk' ? 'База знань порожня' : 'Knowledge base is empty'}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {language === 'uk'
              ? 'Імпортуйте документи (PDF, TXT, DOCX, MD, CSV, JSON) для створення бази знань'
              : 'Import documents (PDF, TXT, DOCX, MD, CSV, JSON) to create a knowledge base'}
          </p>
          <p className="text-xs text-slate-500">
            {language === 'uk'
              ? 'Підтримувані формати: PDF, TXT, DOCX, MD, CSV, JSON'
              : 'Supported formats: PDF, TXT, DOCX, MD, CSV, JSON'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {knowledgeDocs
            .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((doc) => (
              <div key={doc.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{doc.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{doc.type.toUpperCase()}</span>
                      <span>{formatSize(doc.size)}</span>
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" /> {doc.chunks} {t('kb.chunks', language)}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3" /> {t('kb.indexed', language)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteKnowledgeDoc(doc.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Stats */}
      {knowledgeDocs.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{knowledgeDocs.length}</p>
            <p className="text-xs text-slate-400">{language === 'uk' ? 'Документів' : 'Documents'}</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{knowledgeDocs.reduce((sum, d) => sum + d.chunks, 0)}</p>
            <p className="text-xs text-slate-400">{language === 'uk' ? 'Фрагментів' : 'Total Chunks'}</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{formatSize(knowledgeDocs.reduce((sum, d) => sum + d.size, 0))}</p>
            <p className="text-xs text-slate-400">{language === 'uk' ? 'Загальний розмір' : 'Total Size'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
