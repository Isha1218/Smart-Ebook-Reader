import { API_BASE_URL } from '../consts/consts';

const makeRequest = async (endpoint, data, method = 'POST') => {
  try {
    const url = endpoint.startsWith('/api/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
};

export const deleteHighlight = async (id) => {
  await makeRequest('delete_highlight', { id });
};

export const addHighlight = async (id, highlightText, cfiRange, chapter) => {
  return await makeRequest('add_highlight', {
    id,
    highlight_text: highlightText,
    cfi_range: cfiRange,
    chapter
  });
};

export const fetchHighlights = async () => {
  const response = await fetch(`${API_BASE_URL}/highlights`);
  if (!response.ok) {
    throw new Error('Failed to fetch highlights');
  }
  return response.json();
};

export const fastLookup = async (query, searchText) => {
  const data = await makeRequest('/api/fast_lookup', {
    query,
    search_text: searchText
  });
  return data.result;
};

export const doQA = async (query, searchText, selectedText, currentPageText) => {
  const data = await makeRequest('/api/qa', {
    query,
    search_text: searchText,
    selected_text: selectedText,
    current_page_text: currentPageText
  });
  return data.result;
};

export const getRecap = async (searchText) => {
  const data = await makeRequest('/api/recap', {
    search_text: searchText
  });
  return data.result;
};