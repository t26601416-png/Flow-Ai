import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  Globe, Search, ArrowLeft, ArrowRight, RotateCw, Home, Bookmark,
  Plus, X, History, Star, Lock, AlertCircle, ExternalLink
} from 'lucide-react';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

interface HistoryEntry {
  url: string;
  title: string;
  timestamp: number;
}

interface BookmarkEntry {
  url: string;
  title: string;
  favicon?: string;
}

export default function Browser() {
  const { language } = useStore();
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab-1', title: 'Нова вкладка', url: '', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [addressBar, setAddressBar] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([
    { url: 'https://duckduckgo.com', title: 'DuckDuckGo' },
    { url: 'https://wikipedia.org', title: 'Wikipedia' },
    { url: 'https://github.com', title: 'GitHub' },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('browser-history');
    const savedBookmarks = localStorage.getItem('browser-bookmarks');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('browser-history', JSON.stringify(history.slice(0, 100)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('browser-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const navigate = (url: string) => {
    if (!url) return;

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it's a search query
      if (!url.includes('.') || url.includes(' ')) {
        url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
      } else {
        url = `https://${url}`;
      }
    }

    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, isLoading: true, title: 'Завантаження...' }
        : tab
    ));
    setAddressBar(url);

    // Add to history
    setHistory(prev => [{
      url,
      title: url,
      timestamp: Date.now()
    }, ...prev]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
      navigate(searchUrl);
      setSearchQuery('');
    }
  };

  const handleAddressBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(addressBar);
  };

  const addTab = () => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: 'Нова вкладка',
      url: '',
      isLoading: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setAddressBar('');
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      setTabs([{ id: `tab-${Date.now()}`, title: 'Нова вкладка', url: '', isLoading: false }]);
      setActiveTabId(tabs[0].id);
    } else {
      const newTabs = tabs.filter(t => t.id !== tabId);
      setTabs(newTabs);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
    }
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setAddressBar(tab.url);
    }
  };

  const goBack = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.back();
      } catch (e) {
        console.log('Cannot go back');
      }
    }
  };

  const goForward = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.forward();
      } catch (e) {
        console.log('Cannot go forward');
      }
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const goHome = () => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url: '', title: 'Нова вкладка', isLoading: false }
        : tab
    ));
    setAddressBar('');
  };

  const addBookmark = () => {
    if (activeTab?.url) {
      setBookmarks([...bookmarks, {
        url: activeTab.url,
        title: activeTab.title || activeTab.url
      }]);
    }
  };

  const removeBookmark = (url: string) => {
    setBookmarks(bookmarks.filter(b => b.url !== url));
  };

  const handleIframeLoad = () => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, isLoading: false, title: iframeRef.current?.contentDocument?.title || tab.url }
        : tab
    ));
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Tabs Bar */}
      <div className="h-10 bg-slate-900/80 border-b border-indigo-500/20 flex items-center px-2 gap-1">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer max-w-[200px] transition-colors ${
              activeTabId === tab.id
                ? 'bg-slate-800/80 text-white'
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/40'
            }`}
          >
            {tab.isLoading ? (
              <RotateCw className="w-3 h-3 animate-spin flex-shrink-0" />
            ) : (
              <Globe className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="text-xs truncate flex-1">{tab.title || 'Нова вкладка'}</span>
            <button
              onClick={(e) => closeTab(tab.id, e)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={addTab}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-slate-800/60 border-b border-indigo-500/20 flex items-center px-3 gap-2">
        <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={goForward} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={refresh} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
          <RotateCw className="w-4 h-4" />
        </button>
        <button onClick={goHome} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
          <Home className="w-4 h-4" />
        </button>

        {/* Address Bar */}
        <form onSubmit={handleAddressBarSubmit} className="flex-1 flex items-center">
          <div className="flex-1 flex items-center bg-slate-900/60 border border-indigo-500/20 rounded-lg px-3 py-1.5">
            <Lock className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={addressBar}
              onChange={(e) => setAddressBar(e.target.value)}
              placeholder={language === 'uk' ? 'Введіть URL або пошуковий запит' : 'Enter URL or search query'}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </form>

        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className={`p-2 rounded-lg transition-colors ${showBookmarks ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-400'}`}
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-400'}`}
        >
          <History className="w-4 h-4" />
        </button>
        <button
          onClick={addBookmark}
          disabled={!activeTab?.url}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      {showBookmarks && bookmarks.length > 0 && (
        <div className="h-8 bg-slate-800/40 border-b border-indigo-500/20 flex items-center px-3 gap-2 overflow-x-auto">
          {bookmarks.map((bookmark, i) => (
            <div key={i} className="group flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
              <button
                onClick={() => navigate(bookmark.url)}
                className="flex items-center gap-1.5 text-xs text-slate-300"
              >
                <Globe className="w-3 h-3" />
                {bookmark.title}
              </button>
              <button
                onClick={() => removeBookmark(bookmark.url)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-red-400"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Browser Content */}
        <div className="flex-1 relative">
          {activeTab?.url ? (
            <iframe
              ref={iframeRef}
              src={activeTab.url}
              onLoad={handleIframeLoad}
              className="w-full h-full border-none bg-white"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            /* New Tab Page */
            <div className="h-full bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {language === 'uk' ? 'Local Flow Browser' : 'Local Flow Browser'}
                  </h1>
                  <p className="text-slate-400">
                    {language === 'uk' ? 'Ваш приватний вбудований браузер' : 'Your private built-in browser'}
                  </p>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="mb-8">
                  <div className="flex items-center bg-slate-800/60 border border-indigo-500/30 rounded-2xl px-6 py-4 shadow-lg">
                    <Search className="w-5 h-5 text-indigo-400 mr-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'uk' ? 'Шукати в DuckDuckGo...' : 'Search with DuckDuckGo...'}
                      className="flex-1 bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </form>

                {/* Quick Links */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { url: 'https://duckduckgo.com', title: 'DuckDuckGo', icon: '🔍' },
                    { url: 'https://wikipedia.org', title: 'Wikipedia', icon: '📚' },
                    { url: 'https://github.com', title: 'GitHub', icon: '💻' },
                    { url: 'https://youtube.com', title: 'YouTube', icon: '📺' },
                  ].map((link, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(link.url)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-indigo-500/10 hover:border-indigo-500/30 transition-all"
                    >
                      <span className="text-3xl">{link.icon}</span>
                      <span className="text-xs text-slate-300">{link.title}</span>
                    </button>
                  ))}
                </div>

                {/* Info */}
                <div className="mt-8 text-center">
                  <p className="text-xs text-slate-500">
                    {language === 'uk' 
                      ? '💡 Деякі сайти можуть блокувати вбудовування через політику безпеки. Використовуйте DuckDuckGo для пошуку.'
                      : '💡 Some sites may block embedding due to security policies. Use DuckDuckGo for search.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-80 border-l border-indigo-500/20 bg-slate-900/80 overflow-y-auto">
            <div className="p-4 border-b border-indigo-500/20 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <History className="w-4 h-4" />
                {language === 'uk' ? 'Історія' : 'History'}
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded hover:bg-white/5 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  {language === 'uk' ? 'Історія порожня' : 'History is empty'}
                </p>
              ) : (
                history.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(entry.url)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <p className="text-xs text-white truncate">{entry.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{entry.url}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
