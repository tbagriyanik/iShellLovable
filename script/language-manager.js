export class LanguageManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.currentLanguage = 'tr';
        this.translations = {
            tr: {
                // Header
                add_app: 'Uygulama Ekle',
                settings: 'Ayarlar',
                search_placeholder: 'Uygulama ara...',
                
                // Add App Modal
                app_name: 'Uygulama Adı',
                ai_prompt: 'AI Prompt (Uygulama Açıklaması)',
                app_icon: 'Uygulama Simgesi',
                cancel: 'İptal',
                create_app: 'Uygulamayı Oluştur',
                
                // Settings Modal
                theme: 'Tema',
                language: 'Dil',
                display: 'Görünüm',
                time: 'Saat',
                data: 'Veri',
                theme_color: 'Tema Rengi',
                background_color: 'Arkaplan Rengi',
                select_language: 'Dil Seçin',
                font_family: 'Yazı Tipi',
                icon_size: 'Simge Boyutu',
                save: 'Kaydet',
                reset_all: 'Tümünü Sıfırla',
                export_settings: 'Ayarları Dışa Aktar',
                import_settings: 'Ayarları İçe Aktar',
                export_apps: 'Uygulamaları Dışa Aktar',
                import_apps: 'Uygulamaları İçe Aktar',
                backup_restore: 'Yedekleme ve Geri Yükleme',
                import_data: 'Veri İçe Aktar',
                
                // Time Settings
                time_format: 'Saat Formatı',
                show_seconds: 'Saniye Göster',
                show_date: 'Tarih Göster',
                time_12_hour: '12 Saat',
                time_24_hour: '24 Saat',
                yes: 'Evet',
                no: 'Hayır',
                
                // Context Menu
                edit: 'Düzenle',
                delete: 'Sil',
                open: 'Aç',
                arrange_icons: 'Simgeleri Düzenle',
                refresh: 'Yenile',
                new_app: 'Yeni Uygulama',
                
                // Messages
                generating_app: 'Uygulama oluşturuluyor...',
                fill_all_fields: 'Lütfen tüm alanları doldurun!',
                error_creating_app: 'Uygulama oluşturulurken hata oluştu!',
                confirm_delete: 'Bu uygulamayı silmek istediğinizden emin misiniz?',
                confirm_reset: 'Tüm ayarları sıfırlamak istediğinizden emin misiniz?',
                data_imported: 'Veri başarıyla içe aktarıldı!',
                invalid_data: 'Veri dosyası geçersiz!',
                
                // App Names
                welcome: 'Hoş Geldiniz',
                calculator: 'Hesap Makinesi',
                notepad: 'Not Defteri',
                
                // Shortcuts
                shortcut_new_app: 'Yeni Uygulama (Ctrl+Shift+N)',
                shortcut_settings: 'Ayarlar (Ctrl+,)',
                shortcut_search: 'Arama (Ctrl+F)',
                
                // Time
                monday: 'Pazartesi',
                tuesday: 'Salı',
                wednesday: 'Çarşamba',
                thursday: 'Perşembe',
                friday: 'Cuma',
                saturday: 'Cumartesi',
                sunday: 'Pazar'
            },
            en: {
                // Header
                add_app: 'Add App',
                settings: 'Settings',
                search_placeholder: 'Search apps...',
                
                // Add App Modal
                app_name: 'App Name',
                ai_prompt: 'AI Prompt (App Description)',
                app_icon: 'App Icon',
                cancel: 'Cancel',
                create_app: 'Create App',
                
                // Settings Modal
                theme: 'Theme',
                language: 'Language',
                display: 'Display',
                time: 'Time',
                data: 'Data',
                theme_color: 'Theme Color',
                background_color: 'Background Color',
                select_language: 'Select Language',
                font_family: 'Font Family',
                icon_size: 'Icon Size',
                save: 'Save',
                reset_all: 'Reset All',
                export_settings: 'Export Settings',
                import_settings: 'Import Settings',
                export_apps: 'Export Apps',
                import_apps: 'Import Apps',
                backup_restore: 'Backup and Restore',
                import_data: 'Import Data',
                
                // Time Settings
                time_format: 'Time Format',
                show_seconds: 'Show Seconds',
                show_date: 'Show Date',
                time_12_hour: '12 Hour',
                time_24_hour: '24 Hour',
                yes: 'Yes',
                no: 'No',
                
                // Context Menu
                edit: 'Edit',
                delete: 'Delete',
                open: 'Open',
                arrange_icons: 'Arrange Icons',
                refresh: 'Refresh',
                new_app: 'New App',
                
                // Messages
                generating_app: 'Generating app...',
                fill_all_fields: 'Please fill all fields!',
                error_creating_app: 'Error creating app!',
                confirm_delete: 'Are you sure you want to delete this app?',
                confirm_reset: 'Are you sure you want to reset all settings?',
                data_imported: 'Data imported successfully!',
                invalid_data: 'Invalid data file!',
                
                // App Names
                welcome: 'Welcome',
                calculator: 'Calculator',
                notepad: 'Notepad',
                
                // Shortcuts
                shortcut_new_app: 'New App (Ctrl+Shift+N)',
                shortcut_settings: 'Settings (Ctrl+,)',
                shortcut_search: 'Search (Ctrl+F)',
                
                // Time
                monday: 'Monday',
                tuesday: 'Tuesday',
                wednesday: 'Wednesday',
                thursday: 'Thursday',
                friday: 'Friday',
                saturday: 'Saturday',
                sunday: 'Sunday'
            }
        };
    }
    
    loadLanguage() {
        const savedLanguage = localStorage.getItem('desktop_language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        }
        this.updateUI();
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('desktop_language', lang);
            this.updateUI();
            console.log('Language changed to:', lang);
        }
    }
    
    get(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
    
    updateUI() {
        // Update all elements with data-tr attribute
        document.querySelectorAll('[data-tr]').forEach(element => {
            const key = element.getAttribute('data-tr');
            const translation = this.get(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update document language
        document.documentElement.lang = this.currentLanguage;
        
        // Update search placeholder specifically
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.placeholder = this.get('search_placeholder');
        }
        
        // Update tooltips
        const addBtn = document.getElementById('addBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        if (addBtn) {
            addBtn.setAttribute('data-tooltip', this.get('shortcut_new_app'));
        }
        if (settingsBtn) {
            settingsBtn.setAttribute('data-tooltip', this.get('shortcut_settings'));
        }
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
    
    addTranslation(lang, translations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        Object.assign(this.translations[lang], translations);
    }
    
    formatDate(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return date.toLocaleDateString(
            this.currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
            options
        );
    }
    
    formatTime(date) {
        return date.toLocaleTimeString(
            this.currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
            { hour: '2-digit', minute: '2-digit' }
        );
    }
}
