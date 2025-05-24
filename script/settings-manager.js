export class SettingsManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.defaultSettings = {
            themeColor: '#007AFF',
            backgroundColor: '#F2F2F7',
            fontFamily: 'system',
            iconSize: 80,
            language: 'tr',
            theme: 'light',
            timeFormat: '24',
            showSeconds: 'false',
            showDate: 'false'
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
        const timeFormat = document.getElementById('timeFormat').value;
        const showSeconds = document.getElementById('showSeconds').value;
        const showDate = document.getElementById('showDate').value;
        
        this.settings = {
            ...this.settings,
            themeColor,
            backgroundColor,
            fontFamily,
            iconSize: parseInt(iconSize),
            language,
            timeFormat,
            showSeconds,
            showDate
        };
        
        localStorage.setItem('desktop_settings', JSON.stringify(this.settings));
        this.applySettings();
        
        console.log('Settings saved:', this.settings);
    }
    
    applySettings() {
        const root = document.documentElement;
        
        // Apply theme colors - FIXED: Tema rengi şimdi düzgün uygulanacak
        root.style.setProperty('--primary-color', this.settings.themeColor);
        root.style.setProperty('--background-color', this.settings.backgroundColor);
        root.style.setProperty('--icon-size', `${this.settings.iconSize}px`);
        
        // FIXED: Arkaplan rengi body'ye de uygulanır
        document.body.style.backgroundColor = this.settings.backgroundColor;
        
        // Generate harmonious colors based on primary color
        const primaryColor = this.hexToHsl(this.settings.themeColor);
        const lighterColor = this.hslToHex(primaryColor.h, primaryColor.s, Math.min(primaryColor.l + 20, 95));
        const darkerColor = this.hslToHex(primaryColor.h, primaryColor.s, Math.max(primaryColor.l - 20, 5));
        
        root.style.setProperty('--primary-light', lighterColor);
        root.style.setProperty('--primary-dark', darkerColor);
        
        // Apply font family with better fallbacks
        const fontFamilies = {
            'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'inter': '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            'roboto': '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
            'open-sans': '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
            'lato': '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
            'montserrat': '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
            'poppins': '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
            'jetbrains-mono': '"JetBrains Mono", "Fira Code", "Consolas", monospace',
            'fira-code': '"Fira Code", "JetBrains Mono", "Consolas", monospace',
            'arial': '"Arial", "Helvetica Neue", Helvetica, sans-serif',
            'helvetica': '"Helvetica Neue", Helvetica, Arial, sans-serif',
            'times': '"Times New Roman", Times, serif',
            'georgia': 'Georgia, "Times New Roman", serif'
        };
        
        const fontFamily = fontFamilies[this.settings.fontFamily] || fontFamilies.system;
        root.style.setProperty('--font-family', fontFamily);
        
        // Apply theme class
        document.body.className = `theme-${this.settings.theme}`;
        
        // Update CSS custom properties for better theme integration
        this.updateThemeColors();
        
        // Set language
        this.desktop.languageManager.setLanguage(this.settings.language);
        
        // FIXED: Tüm pencere başlıklarını güncelle
        this.updateAllWindowHeaders();
    }
    
    updateAllWindowHeaders() {
        // Tüm açık pencerelerin başlık çubuğu rengini güncelle
        const windows = document.querySelectorAll('.app-window .window-header');
        windows.forEach(header => {
            header.style.backgroundColor = this.settings.themeColor;
        });
    }
    
    updateThemeColors() {
        const root = document.documentElement;
        const backgroundColor = this.settings.backgroundColor;
        const primaryColor = this.settings.themeColor;
        
        // Determine if background is light or dark
        const bgLightness = this.getLightness(backgroundColor);
        const isLightBackground = bgLightness > 50;
        
        // Set appropriate text colors based on background
        if (isLightBackground) {
            root.style.setProperty('--text-primary', '#000000');
            root.style.setProperty('--text-secondary', '#6D6D70');
            root.style.setProperty('--surface-color', '#FFFFFF');
            root.style.setProperty('--border-color', '#C6C6C8');
            root.style.setProperty('--shadow', '0 2px 10px rgba(0, 0, 0, 0.1)');
        } else {
            root.style.setProperty('--text-primary', '#FFFFFF');
            root.style.setProperty('--text-secondary', '#8E8E93');
            root.style.setProperty('--surface-color', '#1C1C1E');
            root.style.setProperty('--border-color', '#38383A');
            root.style.setProperty('--shadow', '0 2px 10px rgba(0, 0, 0, 0.5)');
        }
    }
    
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        
        if (0 <= h && h < 1/6) {
            r = c; g = x; b = 0;
        } else if (1/6 <= h && h < 1/3) {
            r = x; g = c; b = 0;
        } else if (1/3 <= h && h < 1/2) {
            r = 0; g = c; b = x;
        } else if (1/2 <= h && h < 2/3) {
            r = 0; g = x; b = c;
        } else if (2/3 <= h && h < 5/6) {
            r = x; g = 0; b = c;
        } else if (5/6 <= h && h < 1) {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    getLightness(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 / 255 * 100;
    }
    
    loadSettingsToForm() {
        document.getElementById('themeColor').value = this.settings.themeColor;
        document.getElementById('backgroundColor').value = this.settings.backgroundColor;
        document.getElementById('fontFamily').value = this.settings.fontFamily;
        document.getElementById('iconSize').value = this.settings.iconSize;
        document.getElementById('iconSizeValue').textContent = `${this.settings.iconSize}px`;
        document.getElementById('languageSelect').value = this.settings.language;
        document.getElementById('timeFormat').value = this.settings.timeFormat;
        document.getElementById('showSeconds').value = this.settings.showSeconds;
        document.getElementById('showDate').value = this.settings.showDate;
    }
    
    resetSettings() {
        const lang = this.desktop.languageManager.getCurrentLanguage();
        const confirmMessage = lang === 'tr' 
            ? 'Tüm ayarları sıfırlamak istediğinizden emin misiniz?'
            : 'Are you sure you want to reset all settings?';
            
        if (confirm(confirmMessage)) {
            this.settings = { ...this.defaultSettings };
            localStorage.removeItem('desktop_settings');
            this.applySettings();
            this.loadSettingsToForm();
            
            const successMessage = lang === 'tr' 
                ? 'Tüm ayarlar sıfırlandı!'
                : 'All settings have been reset!';
            alert(successMessage);
        }
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
    
    exportApps() {
        const dataStr = JSON.stringify(this.desktop.apps, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'desktop-apps.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Check if it's settings or apps data
                if (importedData.themeColor !== undefined) {
                    // It's settings data
                    this.settings = { ...this.defaultSettings, ...importedData };
                    localStorage.setItem('desktop_settings', JSON.stringify(this.settings));
                    this.applySettings();
                    this.loadSettingsToForm();
                    console.log('Settings imported successfully');
                } else if (Array.isArray(importedData)) {
                    // It's apps data
                    this.desktop.apps = importedData;
                    this.desktop.saveApps();
                    
                    // Reload the desktop
                    document.getElementById('desktopCanvas').innerHTML = '';
                    this.desktop.apps.forEach(app => {
                        this.desktop.appManager.createDesktopIcon(app);
                    });
                    console.log('Apps imported successfully');
                }
                
                const lang = this.desktop.languageManager.getCurrentLanguage();
                const message = lang === 'tr' 
                    ? 'Veri başarıyla içe aktarıldı!'
                    : 'Data imported successfully!';
                alert(message);
            } catch (error) {
                console.error('Error importing data:', error);
                const lang = this.desktop.languageManager.getCurrentLanguage();
                const message = lang === 'tr' 
                    ? 'Veri dosyası geçersiz!'
                    : 'Invalid data file!';
                alert(message);
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
