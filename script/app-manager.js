export class AppManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.gridSize = 20;
    }
    
    createDesktopIcon(app) {
        const icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.dataset.appId = app.id;
        icon.style.left = `${app.position.x}px`;
        icon.style.top = `${app.position.y}px`;
        
        icon.innerHTML = `
            <div class="icon-image">${app.icon}</div>
            <div class="icon-label">${app.name}</div>
        `;
        
        this.setupIconEvents(icon, app);
        document.getElementById('desktopCanvas').appendChild(icon);
        
        // Add fade-in animation
        icon.classList.add('fade-in');
        
        return icon;
    }
    
    setupIconEvents(icon, app) {
        // Double click to open app
        icon.addEventListener('dblclick', () => {
            this.desktop.openApp(app.id);
        });
        
        // Right click for context menu
        icon.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.desktop.contextMenuManager.showMenu(e.clientX, e.clientY, app.id);
        });
        
        // Drag and drop
        icon.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.startDrag(icon, e);
            }
        });
        
        // Touch events for mobile
        icon.addEventListener('touchstart', (e) => {
            this.startDrag(icon, e.touches[0]);
        });
    }
    
    startDrag(element, event) {
        this.draggedElement = element;
        const rect = element.getBoundingClientRect();
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        this.dragOffset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        element.classList.add('dragging');
        
        // Mouse events
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        
        // Touch events
        document.addEventListener('touchmove', this.handleTouchDrag.bind(this));
        document.addEventListener('touchend', this.stopDrag.bind(this));
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
    }
    
    handleDrag(e) {
        if (!this.draggedElement) return;
        this.updateElementPosition(e.clientX, e.clientY);
    }
    
    handleTouchDrag(e) {
        if (!this.draggedElement) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.updateElementPosition(touch.clientX, touch.clientY);
    }
    
    updateElementPosition(clientX, clientY) {
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        let x = clientX - canvasRect.left - this.dragOffset.x;
        let y = clientY - canvasRect.top - this.dragOffset.y;
        
        // Snap to grid
        x = Math.round(x / this.gridSize) * this.gridSize;
        y = Math.round(y / this.gridSize) * this.gridSize;
        
        // Keep within bounds
        const maxX = canvasRect.width - 80;
        const maxY = canvasRect.height - 110;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        this.draggedElement.style.left = `${x}px`;
        this.draggedElement.style.top = `${y}px`;
    }
    
    stopDrag() {
        if (!this.draggedElement) return;
        
        // Update app position in data
        const appId = this.draggedElement.dataset.appId;
        const app = this.desktop.apps.find(a => a.id === appId);
        
        if (app) {
            app.position = {
                x: parseInt(this.draggedElement.style.left),
                y: parseInt(this.draggedElement.style.top)
            };
            this.desktop.saveApps();
        }
        
        this.draggedElement.classList.remove('dragging');
        this.draggedElement = null;
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.handleDrag.bind(this));
        document.removeEventListener('mouseup', this.stopDrag.bind(this));
        document.removeEventListener('touchmove', this.handleTouchDrag.bind(this));
        document.removeEventListener('touchend', this.stopDrag.bind(this));
        
        // Re-enable text selection
        document.body.style.userSelect = '';
    }
    
    findAvailablePosition() {
        const iconSize = 100;
        const margin = 20;
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        for (let y = margin; y < canvasRect.height - iconSize; y += iconSize + margin) {
            for (let x = margin; x < canvasRect.width - iconSize; x += iconSize + margin) {
                if (this.isPositionAvailable(x, y)) {
                    return { x, y };
                }
            }
        }
        
        // If no position found, place randomly
        return {
            x: Math.random() * (canvasRect.width - iconSize),
            y: Math.random() * (canvasRect.height - iconSize)
        };
    }
    
    isPositionAvailable(x, y) {
        const iconSize = 80;
        const threshold = 40;
        
        return !this.desktop.apps.some(app => {
            const dx = Math.abs(app.position.x - x);
            const dy = Math.abs(app.position.y - y);
            return dx < threshold && dy < threshold;
        });
    }
    
    arrangeIcons() {
        const iconSize = 100;
        const margin = 20;
        let x = margin;
        let y = margin;
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        this.desktop.apps.forEach((app, index) => {
            app.position = { x, y };
            
            const iconElement = document.querySelector(`[data-app-id="${app.id}"]`);
            if (iconElement) {
                iconElement.style.left = `${x}px`;
                iconElement.style.top = `${y}px`;
            }
            
            x += iconSize + margin;
            if (x + iconSize > canvasRect.width) {
                x = margin;
                y += iconSize + margin;
            }
        });
        
        this.desktop.saveApps();
    }
}
