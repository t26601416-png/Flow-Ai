type Translations = {
  [key: string]: { uk: string; en: string };
};

export const translations: Translations = {
  // Navigation
  'nav.dashboard': { uk: 'Панель', en: 'Dashboard' },
  'nav.chat': { uk: 'AI Чат', en: 'AI Chat' },
  'nav.flowBuilder': { uk: 'Flow Builder', en: 'Flow Builder' },
  'nav.agents': { uk: 'AI Агенти', en: 'AI Agents' },
  'nav.models': { uk: 'Моделі', en: 'Models' },
  'nav.browser': { uk: 'Браузер', en: 'Browser' },
  'nav.knowledge': { uk: 'База знань', en: 'Knowledge Base' },
  'nav.documents': { uk: 'Документи', en: 'Documents' },
  'nav.imageAI': { uk: 'Генерація зображень', en: 'Image Generation' },
  'nav.audioAI': { uk: 'Аудіо AI', en: 'Audio AI' },
  'nav.automation': { uk: 'Автоматизація', en: 'Automation' },
  'nav.apiServer': { uk: 'API Сервер', en: 'API Server' },
  'nav.settings': { uk: 'Налаштування', en: 'Settings' },
  
  // Dashboard
  'dashboard.welcome': { uk: 'Ласкаво просимо до Local Flow AI', en: 'Welcome to Local Flow AI' },
  'dashboard.subtitle': { uk: 'Ваш персональний локальний штучний інтелект', en: 'Your personal local AI' },
  'dashboard.engineStatus': { uk: 'Статус AI рушія', en: 'AI Engine Status' },
  'dashboard.connected': { uk: 'Підключено', en: 'Connected' },
  'dashboard.disconnected': { uk: 'Відключено', en: 'Disconnected' },
  'dashboard.activeModel': { uk: 'Активна модель', en: 'Active Model' },
  'dashboard.installedModels': { uk: 'Встановлені моделі', en: 'Installed Models' },
  'dashboard.totalAgents': { uk: 'AI агенти', en: 'AI Agents' },
  'dashboard.recentChats': { uk: 'Останні діалоги', en: 'Recent Chats' },
  'dashboard.recentProjects': { uk: 'Останні проєкти', en: 'Recent Projects' },
  'dashboard.quickStart': { uk: 'Швидкий запуск', en: 'Quick Start' },
  'dashboard.noModels': { uk: 'Моделі не встановлені', en: 'No models installed' },
  'dashboard.installOllama': { uk: 'Встановіть Ollama для початку роботи', en: 'Install Ollama to get started' },
  'dashboard.checkConnection': { uk: 'Перевірити підключення', en: 'Check Connection' },
  
  // Chat
  'chat.newChat': { uk: 'Новий чат', en: 'New Chat' },
  'chat.placeholder': { uk: 'Напишіть повідомлення...', en: 'Type a message...' },
  'chat.send': { uk: 'Надіслати', en: 'Send' },
  'chat.stop': { uk: 'Зупинити', en: 'Stop' },
  'chat.regenerate': { uk: 'Перегенерувати', en: 'Regenerate' },
  'chat.copy': { uk: 'Копіювати', en: 'Copy' },
  'chat.export': { uk: 'Експорт', en: 'Export' },
  'chat.delete': { uk: 'Видалити', en: 'Delete' },
  'chat.selectModel': { uk: 'Оберіть модель', en: 'Select Model' },
  'chat.systemPrompt': { uk: 'Системна інструкція', en: 'System Prompt' },
  'chat.noMessages': { uk: 'Почніть розмову з AI', en: 'Start a conversation with AI' },
  'chat.thinking': { uk: 'Думаю...', en: 'Thinking...' },
  
  // Models
  'models.search': { uk: 'Пошук моделей...', en: 'Search models...' },
  'models.installed': { uk: 'Встановлені', en: 'Installed' },
  'models.available': { uk: 'Доступні', en: 'Available' },
  'models.download': { uk: 'Завантажити', en: 'Download' },
  'models.delete': { uk: 'Видалити', en: 'Delete' },
  'models.downloading': { uk: 'Завантаження...', en: 'Downloading...' },
  'models.parameters': { uk: 'Параметри', en: 'Parameters' },
  'models.size': { uk: 'Розмір', en: 'Size' },
  
  // Flow Builder
  'flow.newProject': { uk: 'Новий проєкт', en: 'New Project' },
  'flow.run': { uk: 'Запустити', en: 'Run' },
  'flow.save': { uk: 'Зберегти', en: 'Save' },
  'flow.nodes': { uk: 'Вузли', en: 'Nodes' },
  'flow.input': { uk: 'Введення', en: 'Input' },
  'flow.ai': { uk: 'AI', en: 'AI' },
  'flow.processing': { uk: 'Обробка', en: 'Processing' },
  'flow.memory': { uk: "Пам'ять", en: 'Memory' },
  'flow.output': { uk: 'Виведення', en: 'Output' },
  
  // Agents
  'agents.create': { uk: 'Створити агента', en: 'Create Agent' },
  'agents.name': { uk: 'Назва', en: 'Name' },
  'agents.description': { uk: 'Опис', en: 'Description' },
  'agents.systemPrompt': { uk: 'Системна інструкція', en: 'System Prompt' },
  'agents.tools': { uk: 'Інструменти', en: 'Tools' },
  
  // Settings
  'settings.general': { uk: 'Загальні', en: 'General' },
  'settings.aiSettings': { uk: 'Налаштування AI', en: 'AI Settings' },
  'settings.performance': { uk: 'Продуктивність', en: 'Performance' },
  'settings.privacy': { uk: 'Приватність', en: 'Privacy' },
  'settings.language': { uk: 'Мова', en: 'Language' },
  'settings.theme': { uk: 'Тема', en: 'Theme' },
  'settings.dark': { uk: 'Темна', en: 'Dark' },
  'settings.light': { uk: 'Світла', en: 'Light' },
  'settings.temperature': { uk: 'Температура', en: 'Temperature' },
  'settings.contextLength': { uk: 'Довжина контексту', en: 'Context Length' },
  'settings.maxTokens': { uk: 'Макс. токенів', en: 'Max Tokens' },
  'settings.ollamaUrl': { uk: 'URL Ollama', en: 'Ollama URL' },
  
  // Knowledge Base
  'kb.import': { uk: 'Імпортувати документ', en: 'Import Document' },
  'kb.search': { uk: 'Пошук...', en: 'Search...' },
  'kb.indexed': { uk: 'Індексовано', en: 'Indexed' },
  'kb.chunks': { uk: 'Фрагментів', en: 'Chunks' },
  
  // Common
  'common.save': { uk: 'Зберегти', en: 'Save' },
  'common.cancel': { uk: 'Скасувати', en: 'Cancel' },
  'common.delete': { uk: 'Видалити', en: 'Delete' },
  'common.edit': { uk: 'Редагувати', en: 'Edit' },
  'common.close': { uk: 'Закрити', en: 'Close' },
  'common.confirm': { uk: 'Підтвердити', en: 'Confirm' },
  'common.loading': { uk: 'Завантаження...', en: 'Loading...' },
  'common.error': { uk: 'Помилка', en: 'Error' },
  'common.success': { uk: 'Успішно', en: 'Success' },
};

export function t(key: string, lang: 'uk' | 'en'): string {
  return translations[key]?.[lang] || key;
}
