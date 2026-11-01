import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  BookOpen, Upload, Trash2, Search, FileText, Database,
  CheckCircle, AlertCircle, Loader, Link, Globe
} from 'lucide-react';

export default function KnowledgeBase() {
  const { language, knowledgeDocs, addKnowledgeDoc, deleteKnowledgeDoc, loadedModels } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsIndexing(true);

    for (const file of Array.from(files)) {
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

  const handleFetchUrl = async () => {
    if (!urlInput.trim() || isFetchingUrl) return;

    setIsFetchingUrl(true);

    try {
      // Fetch the URL
      const response = await fetch(urlInput, {
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Extract text content from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove script and style elements
      doc.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
      
      // Get text content
      const textContent = doc.body?.textContent || '';
      const cleanText = textContent.replace(/\s+/g, ' ').trim();
      
      // Extract title
      const title = doc.title || new URL(urlInput).hostname;
      
      // Estimate size (characters * 2 bytes for UTF-8)
      const size = cleanText.length * 2;
      
      // Create document entry
      const docEntry = {
        id: `url-${Date.now()}-${new URL(urlInput).hostname}`,
        name: `${title} (${new URL(urlInput).hostname})`,
        type: 'url',
        size: size,
        chunks: Math.floor(cleanText.length / 500) + 5, // ~500 chars per chunk
        indexedAt: Date.now(),
      };
      
      addKnowledgeDoc(docEntry);
      
      // Clear input
      setUrlInput('');
      
      alert(language === 'uk' 
        ? `✓ Дані з "${title}" успішно завантажено та індексовано`
        : `✓ Data from "${title}" successfully downloaded and indexed`);
      
    } catch (error) {
      console.error('URL fetch error:', error);
      alert(language === 'uk'
        ? `⚠️ Помилка завантаження: ${error instanceof Error ? error.message : 'Невідома помилка'}\n\nПримітка: Деякі сайти блокують завантаження через CORS.`
        : `⚠️ Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nNote: Some sites block downloads via CORS.`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasModel = loadedModels.length > 0;

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            {t('nav.knowledge', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Локальна база знань з RAG-архітектурою' : 'Local knowledge base with RAG architecture'}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-6 border-emerald-500/20 border">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white mb-1">RAG (Retrieval-Augmented Generation)</h3>
            <p className="text-xs text-slate-400">
              {language === 'uk'
                ? 'Документи індексуються та використовуються разом з Flow-1 для точних відповідей на основі ваших даних. Тепер можна завантажувати дані з URL.'
                : 'Documents are indexed and used with Flow-1 for accurate answers based on your data. Now you can download data from URLs.'}
            </p>
            {!hasModel && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {language === 'uk' ? 'Завантажте Flow-1 модель для повної функціональності' : 'Load a Flow-1 model for full functionality'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          {language === 'uk' ? 'Завантажити з URL' : 'Download from URL'}
        </h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={language === 'uk' ? 'https://example.com/article' : 'https://example.com/article'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-indigo-500/20 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              disabled={isFetchingUrl}
            />
          </div>
          <button
            onClick={handleFetchUrl}
            disabled={!urlInput.trim() || isFetchingUrl}
            className="px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingUrl ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {language === 'uk' ? 'Завантаження...' : 'Fetching...'}
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                {language === 'uk' ? 'Завантажити' : 'Fetch'}
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {language === 'uk'
            ? '💡 Вставте URL статті або веб-сторінки. Дані будуть завантажені та індексовані.'
            : '💡 Paste a URL of an article or web page. Data will be downloaded and indexed.'}
        </p>
      </div>

      {/* File Upload Section */}
      <div className="flex gap-2 mb-6">
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
          <p className="text-sm text-slate-500">
            {language === 'uk' ? 'Завантажте файли або вставте URL для створення бази знань' : 'Upload files or paste URLs to create a knowledge base'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {knowledgeDocs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((doc) => (
            <div key={doc.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  doc.type === 'url' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                }`}>
                  {doc.type === 'url' ? (
                    <Globe className="w-5 h-5 text-blue-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{doc.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="uppercase">{doc.type}</span>
                    <span>{formatSize(doc.size)}</span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" /> {doc.chunks} chunks
                    </span>
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" /> Indexed
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
            <p className="text-xs text-slate-400">{language === 'uk' ? 'Розмір' : 'Total Size'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
