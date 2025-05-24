
import { AppManager } from './app-manager.js';
import { ModalManager } from './modal-manager.js';
import { SettingsManager } from './settings-manager.js';
import { LanguageManager } from './language-manager.js';
import { SearchManager } from './search-manager.js';
import { ContextMenuManager } from './context-menu-manager.js';
import { WindowManager } from './window-manager.js';
import { AIGenerator } from './ai-generator.js';

class DesktopEnvironment {
    constructor() {
        this.apps = [];
        this.windows = [];
        
        // Initialize managers
        this.appManager = new AppManager(this);
        this.modalManager = new ModalManager(this);
        this.settingsManager = new SettingsManager(this);
        this.languageManager = new LanguageManager(this);
        this.searchManager = new SearchManager(this);
        this.contextMenuManager = new ContextMenuManager(this);
        this.windowManager = new WindowManager(this);
        this.aiGenerator = new AIGenerator(this);
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateClock();
        this.loadAppsFromStorage();
        this.settingsManager.loadSettings();
        this.languageManager.loadLanguage();
        
        // Update clock every second
        setInterval(() => this.updateClock(), 1000);
        
        console.log('Desktop Environment initialized');
    }
    
    setupEventListeners() {
        // Header buttons
        document.getElementById('addBtn').addEventListener('click', () => {
            this.modalManager.openModal('addModal');
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.modalManager.openModal('settingsModal');
        });
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchManager.handleSearch(e.target.value);
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.searchManager.hideResults();
            }
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.modalManager.openModal('addModal');
                        break;
                    case ',':
                        e.preventDefault();
                        this.modalManager.openModal('settingsModal');
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('searchInput').focus();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.modalManager.closeAllModals();
                this.contextMenuManager.hideMenu();
                this.searchManager.hideResults();
            }
        });
        
        // Prevent context menu on desktop
        document.getElementById('desktopCanvas').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Hide context menu on click
        document.addEventListener('click', () => {
            this.contextMenuManager.hideMenu();
        });
    }
    
    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('timeDisplay').textContent = timeString;
    }
    
    loadAppsFromStorage() {
        const savedApps = localStorage.getItem('desktop_apps');
        if (savedApps) {
            this.apps = JSON.parse(savedApps);
            this.apps.forEach(app => {
                this.appManager.createDesktopIcon(app);
            });
        } else {
            // Create default apps
            this.createDefaultApps();
        }
    }
    
    createDefaultApps() {
        const defaultApps = [
            {
                id: 'welcome',
                name: 'Hoş Geldiniz',
                icon: '👋',
                content: this.aiGenerator.generateWelcomeApp(),
                position: { x: 50, y: 50 }
            },
            {
                id: 'calculator',
                name: 'Hesap Makinesi',
                icon: '🧮',
                content: this.aiGenerator.generateCalculatorApp(),
                position: { x: 50, y: 180 }
            }
        ];
        
        defaultApps.forEach(app => {
            this.apps.push(app);
            this.appManager.createDesktopIcon(app);
        });
        
        this.saveApps();
    }
    
    saveApps() {
        localStorage.setItem('desktop_apps', JSON.stringify(this.apps));
    }
    
    addApp(appData) {
        const app = {
            id: Date.now().toString(),
            name: appData.name,
            icon: appData.icon,
            prompt: appData.prompt,
            content: '',
            position: this.appManager.findAvailablePosition()
        };
        
        this.apps.push(app);
        this.appManager.createDesktopIcon(app);
        this.saveApps();
        
        // Generate app content with AI
        this.aiGenerator.generateAppContent(app);
        
        return app;
    }
    
    updateApp(appId, updates) {
        const app = this.apps.find(a => a.id === appId);
        if (app) {
            Object.assign(app, updates);
            this.saveApps();
            
            // Update icon if needed
            const iconElement = document.querySelector(`[data-app-id="${appId}"]`);
            if (iconElement && updates.name) {
                iconElement.querySelector('.icon-label').textContent = updates.name;
            }
        }
    }
    
    deleteApp(appId) {
        this.apps = this.apps.filter(a => a.id !== appId);
        this.saveApps();
        
        // Remove icon from desktop
        const iconElement = document.querySelector(`[data-app-id="${appId}"]`);
        if (iconElement) {
            iconElement.remove();
        }
        
        // Close app window if open
        this.windowManager.closeAppWindow(appId);
    }
    
    openApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (app) {
            this.windowManager.openAppWindow(app);
        }
    }
    
    searchApps(query) {
        return this.apps.filter(app => 
            app.name.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Initialize the desktop environment when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.desktop = new DesktopEnvironment();
});
