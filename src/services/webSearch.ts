// Web search service for neural network
// Fetches search results and extracts content for AI context

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

// Search using DuckDuckGo Instant Answer API
export async function searchWeb(query: string, maxResults: number = 5): Promise<WebSearchResponse> {
  try {
    // Use DuckDuckGo API
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error('Search request failed');
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    // Abstract (main answer)
    if (data.Abstract) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL || '',
        snippet: data.Abstract,
        content: data.AbstractText || data.Abstract,
      });
    }

    // Related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }

    // If no results from API, create a fallback
    if (results.length === 0) {
      results.push({
        title: `Результати пошуку: ${query}`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `Інформація про "${query}" доступна у вбудованому браузері. Використайте кнопку "Пошук веб" для детального перегляду.`,
      });
    }

    return {
      query,
      results: results.slice(0, maxResults),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      query,
      results: [{
        title: 'Помилка пошуку',
        url: '',
        snippet: 'Не вдалося виконати пошук. Спробуйте пізніше або використовуйте вбудований браузер.',
      }],
      timestamp: Date.now(),
    };
  }
}

// Extract relevant information from search results for AI context
export function formatSearchResultsForAI(searchResults: WebSearchResponse): string {
  if (searchResults.results.length === 0) {
    return 'Інформація в інтернеті не знайдена.';
  }

  let context = `\n\n[ІНФОРМАЦІЯ З ІНТЕРНЕТУ ПО ЗАПИТУ "${searchResults.query}"]\n`;
  
  searchResults.results.forEach((result, index) => {
    context += `\n--- Результат ${index + 1} ---\n`;
    context += `Заголовок: ${result.title}\n`;
    if (result.url) {
      context += `URL: ${result.url}\n`;
    }
    context += `Опис: ${result.snippet}\n`;
    if (result.content && result.content !== result.snippet) {
      context += `Детальніше: ${result.content}\n`;
    }
  });

  context += `\n[КІНЕЦЬ ІНФОРМАЦІЇ З ІНТЕРНЕТУ]\n\n`;
  context += `Використовуй цю інформацію для відповіді на запитання користувача. `;
  context += `Якщо інформація релевантна, включи її у відповідь. `;
  context += `Якщо ні, відповідай на основі своїх знань.\n`;

  return context;
}

// Detect if user query needs web search
export function needsWebSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Keywords that suggest need for current/recent information
  const searchKeywords = [
    'сьогодні', 'зараз', 'останні', 'новини', 'новий', 'нова', 'нове',
    'today', 'now', 'latest', 'news', 'new', 'recent', 'current',
    'пошук', 'знайти', 'шукаю', 'search', 'find', 'look for',
    'сайт', 'website', 'online', 'інтернет', 'internet',
    'актуальний', 'актуально', 'поточний', 'current', 'up-to-date',
    'скільки коштує', 'how much', 'price', 'вартість',
    'коли вийде', 'дата', 'when', 'date',
    'хто', 'what', 'who', 'where', 'коли', 'де',
  ];

  // Check if query contains search keywords
  const hasSearchKeyword = searchKeywords.some(keyword => lowerQuery.includes(keyword));
  
  // Check if query is a question
  const isQuestion = lowerQuery.includes('?') || 
                     lowerQuery.startsWith('хто') || 
                     lowerQuery.startsWith('що') || 
                     lowerQuery.startsWith('коли') ||
                     lowerQuery.startsWith('де') ||
                     lowerQuery.startsWith('how') ||
                     lowerQuery.startsWith('what') ||
                     lowerQuery.startsWith('who') ||
                     lowerQuery.startsWith('when') ||
                     lowerQuery.startsWith('where');

  // Check if query is short (likely needs search)
  const isShort = query.length < 50;

  // Combine conditions
  return (hasSearchKeyword && isQuestion) || (isShort && isQuestion);
}

// Perform web search and format for AI
export async function performWebSearchForAI(query: string): Promise<string> {
  const searchResults = await searchWeb(query);
  return formatSearchResultsForAI(searchResults);
}
