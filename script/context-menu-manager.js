
export class ContextMenuManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.contextMenu = document.getElementById('contextMenu');
        this.currentAppId = null;
        this.setupContextMenuEvents();
    }
    
    setupContextMenuEvents() {
        // Open app
        document.getElementById('openApp').addEventListener('click', () => {
            if (this.currentAppId) {
                this.desktop.openApp(this.currentAppId);
            }
            this.hideMenu();
        });
        
        // Edit app
        document.getElementById('editApp').addEventListener('click', () => {
            if (this.currentAppId) {
                this.editApp(this.currentAppId);
            }
            this.hideMenu();
        });
        
        // Delete app
        document.getElementById('deleteApp').addEventListener('click', () => {
            if (this.currentAppId) {
                this.deleteApp(this.currentAppId);
            }
            this.hideMenu();
        });
    }
    
    showMenu(x, y, appId) {
        // Hide any existing context menus first
        this.desktop.hideAllContextMenus();
        
        this.currentAppId = appId;
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('active');
        
        // Mark as current menu
        this.desktop.currentContextMenu = this.contextMenu;
        
        // Adjust position if menu goes off screen
        this.adjustMenuPosition();
    }
    
    hideMenu() {
        this.contextMenu.classList.remove('active');
        this.currentAppId = null;
        if (this.desktop.currentContextMenu === this.contextMenu) {
            this.desktop.currentContextMenu = null;
        }
    }
    
    adjustMenuPosition() {
        const menu = this.contextMenu;
        const rect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Adjust horizontal position
        if (rect.right > windowWidth) {
            const newLeft = windowWidth - rect.width - 10;
            menu.style.left = `${Math.max(10, newLeft)}px`;
        }
        
        // Adjust vertical position
        if (rect.bottom > windowHeight) {
            const newTop = windowHeight - rect.height - 10;
            menu.style.top = `${Math.max(10, newTop)}px`;
        }
    }
    
    editApp(appId) {
        const app = this.desktop.apps.find(a => a.id === appId);
        if (!app) return;
        
        // Close any open modals first
        this.desktop.modalManager.closeAllModals();
        
        // Open edit modal
        this.openEditModal(app);
    }
    
    openEditModal(app) {
        // Create edit modal dynamically
        const editModal = document.createElement('div');
        editModal.className = 'modal active';
        editModal.id = 'editModal';
        
        const presetApps = [
            { icon: '📝', name: 'Notepad', prompt: 'Create a simple text editor with save/load functionality' },
            { icon: '🧮', name: 'Calculator', prompt: 'Create a functional calculator with basic operations' },
            { icon: '🎨', name: 'Paint', prompt: 'Create a simple drawing application with tools' },
            { icon: '🌐', name: 'Browser', prompt: 'Create a simple web browser with navigation' },
            { icon: '🎵', name: 'Media Player', prompt: 'Create a media player for audio files' },
            { icon: '⏱️', name: 'Timer', prompt: 'Create a countdown timer and stopwatch' },
            { icon: '🔒', name: 'Screen Saver', prompt: 'Create an animated screen saver' },
            { icon: '📊', name: 'Charts', prompt: 'Create data visualization charts' },
            { icon: '🎮', name: 'Game', prompt: 'Create a simple puzzle game' },
            { icon: '📧', name: 'Email', prompt: 'Create an email client interface' }
        ];
        
        const presetOptions = presetApps.map(preset => 
            `<option value="${preset.icon}|${preset.name}|${preset.prompt}" ${app.icon === preset.icon ? 'selected' : ''}>${preset.icon} ${preset.name}</option>`
        ).join('');
        
        editModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 data-tr="edit_app">Edit Application</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editAppForm">
                        <div class="form-group">
                            <label for="presetSelect" data-tr="preset_apps">Preset Applications:</label>
                            <select id="presetSelect">
                                <option value="">-- Custom Application --</option>
                                ${presetOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editAppName" data-tr="app_name">Application Name:</label>
                            <input type="text" id="editAppName" value="${app.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="editAppIcon" data-tr="app_icon">Application Icon:</label>
                            <input type="text" id="editAppIcon" value="${app.icon}" required>
                        </div>
                        <div class="form-group">
                            <label for="editAppPrompt" data-tr="ai_prompt">AI Prompt:</label>
                            <textarea id="editAppPrompt" rows="4">${app.prompt || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="editModalCancel" data-tr="cancel">Cancel</button>
                            <button type="submit" class="btn-primary" data-tr="save">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        
        // Apply theme color to modal header
        const header = editModal.querySelector('.modal-header');
        const themeColor = this.desktop.settingsManager.getSetting('themeColor') || '#007AFF';
        header.style.backgroundColor = themeColor;
        header.style.color = '#ffffff';
        
        // Make modal draggable
        this.desktop.modalManager.makeDraggable(editModal);
        
        // Update translations
        this.desktop.languageManager.updateUI();
        
        // Setup preset selection
        const presetSelect = editModal.querySelector('#presetSelect');
        presetSelect.addEventListener('change', () => {
            if (presetSelect.value) {
                const [icon, name, prompt] = presetSelect.value.split('|');
                document.getElementById('editAppIcon').value = icon;
                document.getElementById('editAppName').value = name;
                document.getElementById('editAppPrompt').value = prompt;
            }
        });
        
        // Setup event listeners
        const closeBtn = editModal.querySelector('.modal-close');
        const cancelBtn = editModal.querySelector('#editModalCancel');
        const form = editModal.querySelector('#editAppForm');
        
        const closeModal = () => {
            editModal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeModal();
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newName = document.getElementById('editAppName').value;
            const newIcon = document.getElementById('editAppIcon').value;
            const newPrompt = document.getElementById('editAppPrompt').value;
            
            if (!newName || !newIcon) {
                alert(this.desktop.languageManager.get('fill_all_fields'));
                return;
            }
            
            // Update app
            this.desktop.updateApp(app.id, {
                name: newName,
                icon: newIcon,
                prompt: newPrompt
            });
            
            // If content needs to be regenerated
            if (newPrompt && newPrompt !== app.prompt) {
                this.desktop.aiGenerator.generateAppContent(app);
            }
            
            closeModal();
        });
    }
    
    deleteApp(appId) {
        const app = this.desktop.apps.find(a => a.id === appId);
        if (!app) return;
        
        const confirmMessage = this.desktop.languageManager.get('confirm_delete');
        if (confirm(confirmMessage)) {
            this.desktop.deleteApp(appId);
        }
    }
    
    addCustomMenuItem(text, callback) {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-item';
        menuItem.textContent = text;
        menuItem.addEventListener('click', () => {
            callback(this.currentAppId);
            this.hideMenu();
        });
        
        this.contextMenu.appendChild(menuItem);
        return menuItem;
    }
    
    removeCustomMenuItem(menuItem) {
        if (menuItem && menuItem.parentNode === this.contextMenu) {
            this.contextMenu.removeChild(menuItem);
        }
    }
}
