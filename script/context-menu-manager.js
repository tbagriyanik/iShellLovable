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
        this.currentAppId = appId;
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('active');
        
        // Adjust position if menu goes off screen
        this.adjustMenuPosition();
    }
    
    hideMenu() {
        this.contextMenu.classList.remove('active');
        this.currentAppId = null;
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
        
        // Open edit modal
        this.openEditModal(app);
    }
    
    openEditModal(app) {
        // Create edit modal dynamically
        const editModal = document.createElement('div');
        editModal.className = 'modal active';
        editModal.id = 'editModal';
        
        editModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 data-tr="edit_app">Uygulamayı Düzenle</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editAppForm">
                        <div class="form-group">
                            <label for="editAppName" data-tr="app_name">Uygulama Adı:</label>
                            <input type="text" id="editAppName" value="${app.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="editAppIcon" data-tr="app_icon">Uygulama Simgesi:</label>
                            <select id="editAppIcon">
                                <option value="📱" ${app.icon === '📱' ? 'selected' : ''}>📱 Mobil</option>
                                <option value="🧮" ${app.icon === '🧮' ? 'selected' : ''}>🧮 Hesap Makinesi</option>
                                <option value="📝" ${app.icon === '📝' ? 'selected' : ''}>📝 Not Defteri</option>
                                <option value="🎨" ${app.icon === '🎨' ? 'selected' : ''}>🎨 Sanat</option>
                                <option value="📊" ${app.icon === '📊' ? 'selected' : ''}>📊 Grafik</option>
                                <option value="🎮" ${app.icon === '🎮' ? 'selected' : ''}>🎮 Oyun</option>
                                <option value="⚙️" ${app.icon === '⚙️' ? 'selected' : ''}>⚙️ Araç</option>
                                <option value="🌐" ${app.icon === '🌐' ? 'selected' : ''}>🌐 Web</option>
                                <option value="📧" ${app.icon === '📧' ? 'selected' : ''}>📧 E-posta</option>
                                <option value="📷" ${app.icon === '📷' ? 'selected' : ''}>📷 Kamera</option>
                                <option value="🎵" ${app.icon === '🎵' ? 'selected' : ''}>🎵 Müzik</option>
                                <option value="🎬" ${app.icon === '🎬' ? 'selected' : ''}>🎬 Video</option>
                                <option value="📁" ${app.icon === '📁' ? 'selected' : ''}>📁 Dosya</option>
                                <option value="💬" ${app.icon === '💬' ? 'selected' : ''}>💬 Sohbet</option>
                                <option value="🔐" ${app.icon === '🔐' ? 'selected' : ''}>🔐 Güvenlik</option>
                                <option value="💰" ${app.icon === '💰' ? 'selected' : ''}>💰 Finans</option>
                                <option value="📰" ${app.icon === '📰' ? 'selected' : ''}>📰 Haber</option>
                                <option value="🏪" ${app.icon === '🏪' ? 'selected' : ''}>🏪 Alışveriş</option>
                                <option value="🎯" ${app.icon === '🎯' ? 'selected' : ''}>🎯 Hedef</option>
                                <option value="📈" ${app.icon === '📈' ? 'selected' : ''}>📈 Borsa</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editAppPrompt" data-tr="ai_prompt">AI Prompt:</label>
                            <textarea id="editAppPrompt" rows="4">${app.prompt || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="editModalCancel" data-tr="cancel">İptal</button>
                            <button type="submit" class="btn-primary" data-tr="save">Kaydet</button>
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
        
        // Update translations
        this.desktop.languageManager.updateUI();
        
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
            
            if (!newName) {
                alert(this.desktop.languageManager.get('fill_all_fields'));
                return;
            }
            
            // Update app
            this.desktop.updateApp(app.id, {
                name: newName,
                icon: newIcon,
                prompt: newPrompt
            });
            
            // Update icon on desktop
            const iconElement = document.querySelector(`[data-app-id="${app.id}"]`);
            if (iconElement) {
                iconElement.querySelector('.icon-image').textContent = newIcon;
                iconElement.querySelector('.icon-label').textContent = newName;
            }
            
            // If content needs to be regenerated
            if (newPrompt !== app.prompt) {
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
