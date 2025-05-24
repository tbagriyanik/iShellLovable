
export class SettingsManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.defaultSettings = {
            themeColor: '#007AFF',
            backgroundColor: '#F2F2F7',
            fontFamily: 'system',
            iconSize: 80,
            language: 'tr',
            theme: 'light'
        };
        this.settings = { ...this.defaultSettings };
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('desktop_settings');
        if (savedSettings) {
            this.settings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
        }
        this.applySettings();
    }
    
    saveSettings() {
        // Get values from form
        const themeColor = document.getElementById('themeColor').value;
        const backgroundColor = document.getElementById('backgroundColor').value;
        const fontFamily = document.getElementById('fontFamily').value;
        const iconSize = document.getElementById('iconSize').value;
        const language = document.getElementById('languageSelect').value;
        
        this.settings = {
            ...this.settings,
            themeColor,
            backgroundColor,
            fontFamily,
            iconSize: parseInt(iconSize),
            language
        };
        
        localStorage.setItem('desktop_settings', JSON.stringify(this.settings));
        this.applySettings();
        
        console.log('Settings saved:', this.settings);
    }
    
    applySettings() {
        const root = document.documentElement;
        
        // Apply theme colors
        root.style.setProperty('--primary-color', this.settings.themeColor);
        root.style.setProperty('--background-color', this.settings.backgroundColor);
        root.style.setProperty('--icon-size', `${this.settings.iconSize}px`);
        
        // Apply font family
        const fontFamily = this.settings.fontFamily === 'system' 
            ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            : this.settings.fontFamily;
        root.style.setProperty('--font-family', fontFamily);
        
        // Apply theme class
        document.body.className = `theme-${this.settings.theme}`;
        
        // Set language
        this.desktop.languageManager.setLanguage(this.settings.language);
    }
    
    loadSettingsToForm() {
        document.getElementById('themeColor').value = this.settings.themeColor;
        document.getElementById('backgroundColor').value = this.settings.backgroundColor;
        document.getElementById('fontFamily').value = this.settings.fontFamily;
        document.getElementById('iconSize').value = this.settings.iconSize;
        document.getElementById('iconSizeValue').textContent = `${this.settings.iconSize}px`;
        document.getElementById('languageSelect').value = this.settings.language;
    }
    
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        localStorage.removeItem('desktop_settings');
        this.applySettings();
        this.loadSettingsToForm();
    }
    
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'desktop-settings.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                this.settings = { ...this.defaultSettings, ...importedSettings };
                localStorage.setItem('desktop_settings', JSON.stringify(this.settings));
                this.applySettings();
                this.loadSettingsToForm();
                console.log('Settings imported successfully');
            } catch (error) {
                console.error('Error importing settings:', error);
                alert('Ayarlar dosyası geçersiz!');
            }
        };
        reader.readAsText(file);
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    setSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('desktop_settings', JSON.stringify(this.settings));
        this.applySettings();
    }
}
