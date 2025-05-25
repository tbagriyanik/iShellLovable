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
        this.lastOpenWindow = null;
        this.currentContextMenu = null;
        
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
        this.setupDesktopContextMenu();
        this.addSettingsIconToHeader();
        this.updateClock();
        this.loadAppsFromStorage();
        this.settingsManager.loadSettings();
        this.languageManager.loadLanguage();
        this.loadLastOpenWindow();
        
        // Update clock every second
        setInterval(() => this.updateClock(), 1000);
        
        console.log('Desktop Environment initialized');
    }
    
    addSettingsIconToHeader() {
        const timeDisplay = document.getElementById('timeDisplay');
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'settings-icon-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Settings';
        
        settingsBtn.addEventListener('click', () => {
            this.modalManager.openModal('settingsModal');
        });
        
        timeDisplay.parentNode.insertBefore(settingsBtn, timeDisplay);
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
            
            // Clear icon selection when clicking on empty space
            if (e.target === document.getElementById('desktopCanvas')) {
                this.appManager.clearSelection();
            }
            
            // Hide context menus
            this.hideAllContextMenus();
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && !e.ctrlKey && !e.metaKey) {
                switch(e.key) {
                    case 'N':
                        e.preventDefault();
                        this.modalManager.openModal('addModal');
                        break;
                    case 'F4':
                        e.preventDefault();
                        if (this.windowManager.activeWindow) {
                            const windowData = this.windowManager.windows.find(w => 
                                w.element === this.windowManager.activeWindow
                            );
                            if (windowData) {
                                this.windowManager.closeWindow(windowData.element, windowData);
                            }
                        }
                        break;
                }
            }
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case ',':
                        e.preventDefault();
                        this.modalManager.openModal('settingsModal');
                        break;
                    case 'f':
                    case 'F':
                        e.preventDefault();
                        document.getElementById('searchInput').focus();
                        break;
                }
                
                if (e.shiftKey && e.key === 'Tab') {
                    e.preventDefault();
                    this.windowManager.cycleWindows();
                }
            }
            
            if (e.key === 'Escape') {
                this.modalManager.closeAllModals();
                this.hideAllContextMenus();
                this.searchManager.hideResults();
                this.appManager.clearSelection();
            }
        });
    }
    
    hideAllContextMenus() {
        // Hide all context menus
        document.querySelectorAll('.context-menu').forEach(menu => {
            menu.classList.remove('active');
            if (menu.classList.contains('desktop-context-menu')) {
                menu.remove();
            }
        });
        this.contextMenuManager.hideMenu();
        this.currentContextMenu = null;
    }
    
    setupDesktopContextMenu() {
        const desktop = document.getElementById('desktopCanvas');
        
        desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showDesktopContextMenu(e.clientX, e.clientY);
        });
        
        // Mobile long press support
        let longPressTimer;
        desktop.addEventListener('touchstart', (e) => {
            if (e.target === desktop) {
                longPressTimer = setTimeout(() => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    this.showDesktopContextMenu(touch.clientX, touch.clientY);
                }, 800);
            }
        });
        
        desktop.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        
        desktop.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }
    
    showDesktopContextMenu(x, y) {
        this.hideAllContextMenus();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu desktop-context-menu active';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.zIndex = '9999';
        
        const lang = this.languageManager;
        menu.innerHTML = `
            <div class="context-item" id="desktopNewApp">
                <span>➕</span>
                <span data-tr="new_app">${lang.get('new_app')}</span>
            </div>
            <div class="context-item" id="desktopSettings">
                <span>⚙️</span>
                <span data-tr="settings">${lang.get('settings')}</span>
            </div>
            <div class="context-item" id="desktopArrange">
                <span>📋</span>
                <span data-tr="arrange_icons">${lang.get('arrange_icons')}</span>
            </div>
            <div class="context-item" id="desktopRefresh">
                <span>🔄</span>
                <span data-tr="refresh">${lang.get('refresh')}</span>
            </div>
        `;
        
        document.body.appendChild(menu);
        this.currentContextMenu = menu;
        
        // Add event listeners
        menu.querySelector('#desktopNewApp').addEventListener('click', () => {
            this.modalManager.openModal('addModal');
            menu.remove();
        });
        
        menu.querySelector('#desktopSettings').addEventListener('click', () => {
            this.modalManager.openModal('settingsModal');
            menu.remove();
        });
        
        menu.querySelector('#desktopArrange').addEventListener('click', () => {
            this.appManager.arrangeIcons();
            menu.remove();
        });
        
        menu.querySelector('#desktopRefresh').addEventListener('click', () => {
            this.refreshDesktop();
            menu.remove();
        });
        
        // Adjust position if needed
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
    }
    
    arrangeIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        const gridSize = 100;
        let col = 0;
        let row = 0;
        
        icons.forEach((icon, index) => {
            const x = 50 + col * gridSize;
            const y = 50 + row * gridSize;
            
            icon.style.left = `${x}px`;
            icon.style.top = `${y}px`;
            
            // Update app position
            const appId = icon.getAttribute('data-app-id');
            const app = this.apps.find(a => a.id === appId);
            if (app) {
                app.position = { x, y };
            }
            
            col++;
            if (col >= Math.floor((window.innerWidth - 100) / gridSize)) {
                col = 0;
                row++;
            }
        });
        
        this.saveApps();
    }
    
    refreshDesktop() {
        const desktop = document.getElementById('desktopCanvas');
        desktop.innerHTML = '';
        this.apps.forEach(app => {
            this.appManager.createDesktopIcon(app);
        });
    }
    
    updateClock() {
        const now = new Date();
        const settings = this.settingsManager.settings;
        
        let timeOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (settings.showSeconds === 'true') {
            timeOptions.second = '2-digit';
        }
        
        if (settings.timeFormat === '12') {
            timeOptions.hour12 = true;
        } else {
            timeOptions.hour12 = false;
        }
        
        let timeString = now.toLocaleTimeString(
            settings.language === 'en' ? 'en-US' : 'tr-TR',
            timeOptions
        );
        
        if (settings.showDate === 'true') {
            const dateString = now.toLocaleDateString(
                settings.language === 'en' ? 'en-US' : 'tr-TR',
                { day: '2-digit', month: '2-digit', year: 'numeric' }
            );
            timeString = `${dateString} ${timeString}`;
        }
        
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
            this.createDefaultApps();
        }
    }
    
    loadLastOpenWindow() {
        const lastOpenAppId = localStorage.getItem('last_open_window');
        if (lastOpenAppId) {
            setTimeout(() => {
                const app = this.apps.find(a => a.id === lastOpenAppId);
                if (app) {
                    this.openApp(lastOpenAppId);
                }
            }, 1000);
        }
    }
    
    createDefaultApps() {
        const defaultApps = [
            {
                id: 'welcome',
                name: 'Welcome',
                icon: '👋',
                content: this.aiGenerator.generateWelcomeApp(),
                position: { x: 50, y: 50 }
            },
            {
                id: 'calc',
                name: 'Calculator',
                icon: '🧮',
                content: this.aiGenerator.generateCalculatorApp(),
                position: { x: 50, y: 180 }
            },
            {
                id: 'notepad',
                name: 'Notepad',
                icon: '📝',
                content: this.aiGenerator.generateNotepadApp(),
                position: { x: 180, y: 50 }
            },
            {
                id: 'paint',
                name: 'Paint',
                icon: '🎨',
                content: this.aiGenerator.generatePaintApp(),
                position: { x: 180, y: 180 }
            },
            {
                id: 'browser',
                name: 'Browser',
                icon: '🌐',
                content: this.aiGenerator.generateBrowserApp(),
                position: { x: 310, y: 50 }
            },
            {
                id: 'mediaplayer',
                name: 'Media Player',
                icon: '🎵',
                content: this.aiGenerator.generateMediaPlayerApp(),
                position: { x: 310, y: 180 }
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
            
            // Update open windows immediately
            const windowData = this.windowManager.windows.find(w => w.appId === appId);
            if (windowData) {
                // Update window title
                const titleElement = windowData.element.querySelector('.window-name');
                if (titleElement && updates.name) {
                    titleElement.textContent = updates.name;
                }
                
                // Update window icon
                const iconElement = windowData.element.querySelector('.window-icon');
                if (iconElement && updates.icon) {
                    iconElement.textContent = updates.icon;
                }
                
                // Regenerate content if prompt changed
                if (updates.prompt) {
                    this.aiGenerator.generateAppContent(app);
                }
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
            console.log('Opening app:', app.name);
            this.windowManager.openAppWindow(app);
            this.lastOpenWindow = appId;
            localStorage.setItem('last_open_window', appId);
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
