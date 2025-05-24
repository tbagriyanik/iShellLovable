export class SearchManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.searchResults = document.getElementById('searchResults');
        this.searchInput = document.getElementById('searchInput');
        this.debounceTimer = null;
    }
    
    handleSearch(query) {
        // Clear previous timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Debounce search
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }
    
    performSearch(query) {
        if (!query.trim()) {
            this.hideResults();
            return;
        }
        
        const results = this.desktop.searchApps(query);
        this.showResults(results, query);
    }
    
    showResults(results, query) {
        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <span>${this.desktop.languageManager.get('no_results')}</span>
                </div>
            `;
        } else {
            results.forEach(app => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <span class="search-result-icon">${app.icon}</span>
                    <span>${this.highlightMatch(app.name, query)}</span>
                `;
                
                resultItem.addEventListener('click', () => {
                    this.desktop.openApp(app.id);
                    this.hideResults();
                    this.searchInput.value = '';
                });
                
                this.searchResults.appendChild(resultItem);
            });
        }
        
        this.searchResults.style.display = 'block';
        this.searchResults.classList.add('slide-down');
    }
    
    hideResults() {
        this.searchResults.style.display = 'none';
        this.searchResults.classList.remove('slide-down');
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
    
    navigateResults(direction) {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        if (items.length === 0) return;
        
        const currentActive = this.searchResults.querySelector('.search-result-item.active');
        let nextIndex = 0;
        
        if (currentActive) {
            const currentIndex = Array.from(items).indexOf(currentActive);
            currentActive.classList.remove('active');
            
            if (direction === 'down') {
                nextIndex = (currentIndex + 1) % items.length;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            }
        }
        
        items[nextIndex].classList.add('active');
        items[nextIndex].scrollIntoView({ block: 'nearest' });
    }
    
    selectActiveResult() {
        const activeItem = this.searchResults.querySelector('.search-result-item.active');
        if (activeItem) {
            activeItem.click();
        } else {
            const firstItem = this.searchResults.querySelector('.search-result-item');
            if (firstItem) {
                firstItem.click();
            }
        }
    }
    
    setupKeyboardNavigation() {
        this.searchInput.addEventListener('keydown', (e) => {
            if (this.searchResults.style.display === 'none') return;
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateResults('down');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateResults('up');
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.selectActiveResult();
                    break;
                case 'Escape':
                    this.hideResults();
                    this.searchInput.blur();
                    break;
            }
        });
    }
    
    addSearchSuggestion(app) {
        // Add recently opened apps to search suggestions
        const suggestions = JSON.parse(localStorage.getItem('search_suggestions') || '[]');
        
        // Remove if already exists
        const filtered = suggestions.filter(s => s.id !== app.id);
        
        // Add to beginning
        filtered.unshift({
            id: app.id,
            name: app.name,
            icon: app.icon,
            timestamp: Date.now()
        });
        
        // Keep only last 10 suggestions
        const limited = filtered.slice(0, 10);
        
        localStorage.setItem('search_suggestions', JSON.stringify(limited));
    }
    
    getSearchSuggestions() {
        return JSON.parse(localStorage.getItem('search_suggestions') || '[]');
    }
    
    showSuggestions() {
        const suggestions = this.getSearchSuggestions();
        if (suggestions.length === 0) return;
        
        this.searchResults.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const app = this.desktop.apps.find(a => a.id === suggestion.id);
            if (app) {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <span class="search-result-icon">${app.icon}</span>
                    <span>${app.name}</span>
                `;
                
                resultItem.addEventListener('click', () => {
                    this.desktop.openApp(app.id);
                    this.hideResults();
                    this.searchInput.value = '';
                });
                
                this.searchResults.appendChild(resultItem);
            }
        });
        
        if (this.searchResults.children.length > 0) {
            this.searchResults.style.display = 'block';
        }
    }
}
