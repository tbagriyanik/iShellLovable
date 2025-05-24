
export class SearchManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.searchHistory = this.loadSearchHistory();
        this.searchSuggestions = new Set();
    }
    
    loadSearchHistory() {
        const saved = localStorage.getItem('search_history');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveSearchHistory() {
        localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }
    
    handleSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (!query.trim()) {
            this.hideResults();
            return;
        }
        
        const results = this.desktop.searchApps(query);
        this.displayResults(results, query);
        
        // Add to search history if not empty
        if (query.trim() && !this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
            this.saveSearchHistory();
        }
    }
    
    displayResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            // Show appropriate "no results" message based on language
            const lang = this.desktop.languageManager.getCurrentLanguage();
            const noResultsMessage = lang === 'tr' 
                ? `"${query}" için sonuç bulunamadı`
                : `No results found for "${query}"`;
            
            resultsContainer.innerHTML = `
                <div class="search-result-item no-results">
                    <span class="search-result-icon">🔍</span>
                    <span>${noResultsMessage}</span>
                </div>
            `;
        } else {
            results.forEach(app => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <span class="search-result-icon">${app.icon}</span>
                    <span>${app.name}</span>
                `;
                
                resultItem.addEventListener('click', () => {
                    this.desktop.openApp(app.id);
                    this.hideResults();
                    document.getElementById('searchInput').value = '';
                });
                
                resultsContainer.appendChild(resultItem);
            });
        }
        
        resultsContainer.style.display = 'block';
        resultsContainer.classList.add('slide-down');
    }
    
    hideResults() {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.style.display = 'none';
        resultsContainer.classList.remove('slide-down');
    }
    
    addSearchSuggestion(app) {
        this.searchSuggestions.add(app.name.toLowerCase());
    }
    
    removeSearchSuggestion(appName) {
        this.searchSuggestions.delete(appName.toLowerCase());
    }
    
    getSuggestions(query) {
        if (!query.trim()) return [];
        
        const queryLower = query.toLowerCase();
        const suggestions = [];
        
        // Add matching apps
        this.desktop.apps.forEach(app => {
            if (app.name.toLowerCase().includes(queryLower)) {
                suggestions.push(app.name);
            }
        });
        
        // Add matching search history
        this.searchHistory.forEach(historyItem => {
            if (historyItem.toLowerCase().includes(queryLower) && !suggestions.includes(historyItem)) {
                suggestions.push(historyItem);
            }
        });
        
        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }
    
    clearHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }
    
    getPopularSearches() {
        // Return most frequently used searches
        const searchCounts = {};
        this.searchHistory.forEach(search => {
            searchCounts[search] = (searchCounts[search] || 0) + 1;
        });
        
        return Object.entries(searchCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([search]) => search);
    }
}
