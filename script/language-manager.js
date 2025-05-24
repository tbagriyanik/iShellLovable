
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
                theme_color: 'Tema Rengi',
                background_color: 'Arkaplan Rengi',
                select_language: 'Dil Seçin',
                font_family: 'Yazı Tipi',
                icon_size: 'Simge Boyutu',
                save: 'Kaydet',
                
                // Context Menu
                edit: 'Düzenle',
                delete: 'Sil',
                
                // Messages
                generating_app: 'Uygulama oluşturuluyor...',
                fill_all_fields: 'Lütfen tüm alanları doldurun!',
                error_creating_app: 'Uygulama oluşturulurken hata oluştu!',
                confirm_delete: 'Bu uygulamayı silmek istediğinizden emin misiniz?',
                
                // App Names
                welcome: 'Hoş Geldiniz',
                calculator: 'Hesap Makinesi',
                notepad: 'Not Defteri',
                
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
                theme_color: 'Theme Color',
                background_color: 'Background Color',
                select_language: 'Select Language',
                font_family: 'Font Family',
                icon_size: 'Icon Size',
                save: 'Save',
                
                // Context Menu
                edit: 'Edit',
                delete: 'Delete',
                
                // Messages
                generating_app: 'Generating app...',
                fill_all_fields: 'Please fill all fields!',
                error_creating_app: 'Error creating app!',
                confirm_delete: 'Are you sure you want to delete this app?',
                
                // App Names
                welcome: 'Welcome',
                calculator: 'Calculator',
                notepad: 'Notepad',
                
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
