
export class ModalManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.activeModal = null;
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // Add App Modal
        this.setupAddModal();
        
        // Settings Modal
        this.setupSettingsModal();
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });
        
        // Cancel buttons
        document.querySelectorAll('[id$="Cancel"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });
    }
    
    setupAddModal() {
        const form = document.getElementById('addAppForm');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const appData = {
                name: formData.get('appName') || document.getElementById('appName').value,
                icon: document.getElementById('appIcon').value,
                prompt: document.getElementById('appPrompt').value
            };
            
            if (!appData.name || !appData.prompt) {
                alert(this.desktop.languageManager.get('fill_all_fields'));
                return;
            }
            
            // Show loading
            loadingOverlay.classList.add('active');
            
            try {
                // Add the app
                const app = this.desktop.addApp(appData);
                
                // Reset form and close modal
                form.reset();
                this.closeModal('addModal');
                
                // Hide loading
                loadingOverlay.classList.remove('active');
                
                console.log('App created successfully:', app);
                
            } catch (error) {
                console.error('Error creating app:', error);
                alert(this.desktop.languageManager.get('error_creating_app'));
                loadingOverlay.classList.remove('active');
            }
        });
    }
    
    setupSettingsModal() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Settings form
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.desktop.settingsManager.saveSettings();
            this.closeModal('settingsModal');
        });
        
        // Color pickers
        document.getElementById('themeColor').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--primary-color', e.target.value);
        });
        
        document.getElementById('backgroundColor').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--background-color', e.target.value);
        });
        
        // Font family selector
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            const fontFamily = e.target.value === 'system' 
                ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                : e.target.value;
            document.documentElement.style.setProperty('--font-family', fontFamily);
        });
        
        // Icon size slider
        const iconSizeSlider = document.getElementById('iconSize');
        const iconSizeValue = document.getElementById('iconSizeValue');
        
        iconSizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            iconSizeValue.textContent = `${size}px`;
            document.documentElement.style.setProperty('--icon-size', `${size}px`);
        });
        
        // Language selector
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.desktop.languageManager.setLanguage(e.target.value);
        });
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.activeModal = modalId;
            
            // Focus first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
            // Load current settings if settings modal
            if (modalId === 'settingsModal') {
                this.desktop.settingsManager.loadSettingsToForm();
            }
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            this.activeModal = null;
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.activeModal = null;
    }
    
    isModalOpen() {
        return this.activeModal !== null;
    }
}
