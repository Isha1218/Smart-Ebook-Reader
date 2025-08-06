const API_BASE_URL = 'http://192.168.0.19:5000/api';

export const deleteHighlight = async (id) => {
  try {
    const response = await fetch('http://192.168.0.19:5000/delete_highlight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting highlight:', error);
    throw error;
  }
}

export const addHighlight = async (id, highlightText, cfiRange, chapter) => {
  try {
    const response = await fetch('http://192.168.0.19:5000/add_highlight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        highlight_text: highlightText,
        cfi_range: cfiRange,
        chapter: chapter
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding highlight:', error);
    throw error;
  }
};

export const fetchHighlights = async () => {
  const response = await fetch('http://192.168.0.19:5000/highlights');
  if (!response.ok) {
    throw new Error('Failed to fetch highlights');
  }
  return response.json();
};

export const fastLookup = async (query, searchText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fast_lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        search_text: searchText
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error calling fast_lookup:', error);
    throw error;
  }
};

export const doQA = async (query, searchText, selectedText, currentPageText) => {
  console.log('this is the current page text ' + currentPageText)
  try {
    const response = await fetch(`${API_BASE_URL}/qa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        search_text: searchText,
        selected_text: selectedText,
        current_page_text: currentPageText
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error calling QA:', error);
    throw error;
  }
};

export const getRecap = async (searchText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search_text: searchText
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error calling recap:', error);
    throw error;
  }
};