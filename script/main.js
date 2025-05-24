
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
        this.loadLastOpenWindow();
        
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
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportProjectCode();
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
                    case 'N':
                        e.preventDefault();
                        this.modalManager.openModal('addModal');
                        break;
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
            settings.language === 'tr' ? 'tr-TR' : 'en-US',
            timeOptions
        );
        
        if (settings.showDate === 'true') {
            const dateString = now.toLocaleDateString(
                settings.language === 'tr' ? 'tr-TR' : 'en-US',
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
            // Delay opening to ensure everything is loaded
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
    
    exportProjectCode() {
        // Create a comprehensive ZIP file with all project files
        const projectFiles = {
            'index.html': this.getIndexHtmlContent(),
            'css/main.css': this.getCssContent('main'),
            'css/components.css': this.getCssContent('components'),
            'css/themes.css': this.getCssContent('themes'),
            'script/main.js': this.getScriptContent('main'),
            'script/app-manager.js': this.getScriptContent('app-manager'),
            'script/window-manager.js': this.getScriptContent('window-manager'),
            'script/settings-manager.js': this.getScriptContent('settings-manager'),
            'script/search-manager.js': this.getScriptContent('search-manager'),
            'script/modal-manager.js': this.getScriptContent('modal-manager'),
            'script/language-manager.js': this.getScriptContent('language-manager'),
            'script/context-menu-manager.js': this.getScriptContent('context-menu-manager'),
            'script/ai-generator.js': this.getScriptContent('ai-generator'),
            'README.md': this.generateReadme(),
            'apps.json': JSON.stringify(this.apps, null, 2),
            'settings.json': JSON.stringify(this.settingsManager.settings, null, 2)
        };
        
        // Create and download ZIP file
        this.createZipDownload(projectFiles, 'ai-desktop-project.zip');
    }
    
    createZipDownload(files, filename) {
        // Simple implementation for downloading files as separate downloads
        // In a real implementation, you'd use a ZIP library like JSZip
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        Object.entries(files).forEach(([filepath, content]) => {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${timestamp}_${filepath.replace(/\//g, '_')}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        
        // Show completion message
        const lang = this.languageManager.getCurrentLanguage();
        const message = lang === 'tr' 
            ? 'Proje dosyaları indirildi!'
            : 'Project files downloaded!';
        
        alert(message);
    }
    
    getIndexHtmlContent() {
        return document.documentElement.outerHTML;
    }
    
    getCssContent(type) {
        const links = document.querySelectorAll(`link[href*="${type}.css"]`);
        if (links.length > 0) {
            // Return placeholder - in real implementation, fetch actual CSS content
            return `/* ${type}.css content would be here */`;
        }
        return '';
    }
    
    getScriptContent(name) {
        // Return placeholder - in real implementation, fetch actual script content
        return `// ${name}.js content would be here`;
    }
    
    generateReadme() {
        return `# AI Desktop Environment

Bu proje AI destekli bir masaüstü ortamıdır.

## Özellikler
- Sürükle-bırak simge yönetimi
- AI ile uygulama üretimi
- Tema ve dil desteği
- Responsive tasarım
- Pencere yönetimi

## Kurulum
1. Tüm dosyaları bir web sunucusuna yükleyin
2. index.html dosyasını açın

## Kullanım
- Ctrl+N: Yeni uygulama ekle
- Ctrl+,: Ayarlar
- Ctrl+F: Arama

Geliştirici: AI Desktop Environment
Tarih: ${new Date().toLocaleDateString()}
`;
    }
}

// Initialize the desktop environment when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.desktop = new DesktopEnvironment();
});
