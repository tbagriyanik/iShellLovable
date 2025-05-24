export class AppManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.gridSize = 20;
        this.iconSize = 100;
        this.iconMargin = 20;
    }
    
    createDesktopIcon(app) {
        const icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.dataset.appId = app.id;
        icon.style.left = `${app.position.x}px`;
        icon.style.top = `${app.position.y}px`;
        
        // Enhanced colorful icons
        const colorfulIcons = {
            '📱': { icon: '📱', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            '🧮': { icon: '🧮', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            '📝': { icon: '📝', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
            '🎨': { icon: '🎨', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
            '📊': { icon: '📊', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            '🎮': { icon: '🎮', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
            '⚙️': { icon: '⚙️', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
            '👋': { icon: '👋', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
        };
        
        const iconStyle = colorfulIcons[app.icon] || { icon: app.icon, bg: 'var(--surface-color)' };
        
        icon.innerHTML = `
            <div class="icon-image" style="background: ${iconStyle.bg};">${iconStyle.icon}</div>
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
        
        // Improved drag and drop
        icon.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.startDrag(icon, e);
            }
        });
        
        // Touch events for mobile
        icon.addEventListener('touchstart', (e) => {
            e.preventDefault();
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
        element.style.transition = 'none';
        element.style.zIndex = '9999';
        
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
        requestAnimationFrame(() => {
            this.updateElementPosition(e.clientX, e.clientY);
        });
    }
    
    handleTouchDrag(e) {
        if (!this.draggedElement) return;
        e.preventDefault();
        const touch = e.touches[0];
        requestAnimationFrame(() => {
            this.updateElementPosition(touch.clientX, touch.clientY);
        });
    }
    
    updateElementPosition(clientX, clientY) {
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        let x = clientX - canvasRect.left - this.dragOffset.x;
        let y = clientY - canvasRect.top - this.dragOffset.y;
        
        // Snap to grid for better alignment
        x = Math.round(x / this.gridSize) * this.gridSize;
        y = Math.round(y / this.gridSize) * this.gridSize;
        
        // Keep within bounds
        const maxX = canvasRect.width - this.iconSize;
        const maxY = canvasRect.height - 110;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        // Check for overlapping with other icons
        const finalPosition = this.findNonOverlappingPosition(x, y);
        
        this.draggedElement.style.left = `${finalPosition.x}px`;
        this.draggedElement.style.top = `${finalPosition.y}px`;
    }
    
    findNonOverlappingPosition(targetX, targetY) {
        const threshold = this.iconSize - 20;
        const currentAppId = this.draggedElement.dataset.appId;
        
        // Check if position overlaps with any other icon
        const overlapping = this.desktop.apps.some(app => {
            if (app.id === currentAppId) return false;
            
            const dx = Math.abs(app.position.x - targetX);
            const dy = Math.abs(app.position.y - targetY);
            return dx < threshold && dy < threshold;
        });
        
        if (!overlapping) {
            return { x: targetX, y: targetY };
        }
        
        // Find nearest non-overlapping position
        const spiralSearch = (centerX, centerY, step = this.gridSize) => {
            let x = centerX;
            let y = centerY;
            let direction = 0; // 0: right, 1: down, 2: left, 3: up
            let steps = 1;
            let stepCount = 0;
            
            for (let i = 0; i < 100; i++) { // Limit search iterations
                // Check current position
                const overlapping = this.desktop.apps.some(app => {
                    if (app.id === currentAppId) return false;
                    const dx = Math.abs(app.position.x - x);
                    const dy = Math.abs(app.position.y - y);
                    return dx < threshold && dy < threshold;
                });
                
                if (!overlapping) {
                    const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
                    if (x >= 0 && y >= 0 && x <= canvasRect.width - this.iconSize && y <= canvasRect.height - 110) {
                        return { x, y };
                    }
                }
                
                // Move in spiral pattern
                switch (direction) {
                    case 0: x += step; break; // right
                    case 1: y += step; break; // down
                    case 2: x -= step; break; // left
                    case 3: y -= step; break; // up
                }
                
                stepCount++;
                if (stepCount === steps) {
                    stepCount = 0;
                    direction = (direction + 1) % 4;
                    if (direction % 2 === 0) steps++;
                }
            }
            
            return { x: targetX, y: targetY }; // Fallback to original position
        };
        
        return spiralSearch(targetX, targetY);
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
        this.draggedElement.style.transition = 'var(--transition)';
        this.draggedElement.style.zIndex = '';
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
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        for (let y = this.iconMargin; y < canvasRect.height - this.iconSize; y += this.iconSize + this.iconMargin) {
            for (let x = this.iconMargin; x < canvasRect.width - this.iconSize; x += this.iconSize + this.iconMargin) {
                if (this.isPositionAvailable(x, y)) {
                    return { x, y };
                }
            }
        }
        
        // If no position found, place randomly with overlap check
        return this.findRandomAvailablePosition();
    }
    
    findRandomAvailablePosition() {
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        const maxAttempts = 50;
        
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.random() * (canvasRect.width - this.iconSize);
            const y = Math.random() * (canvasRect.height - 110);
            
            if (this.isPositionAvailable(x, y)) {
                return { x, y };
            }
        }
        
        // Last resort: place at top-left area
        return { x: this.iconMargin, y: this.iconMargin };
    }
    
    isPositionAvailable(x, y) {
        const threshold = this.iconSize - 20;
        
        return !this.desktop.apps.some(app => {
            const dx = Math.abs(app.position.x - x);
            const dy = Math.abs(app.position.y - y);
            return dx < threshold && dy < threshold;
        });
    }
    
    arrangeIcons() {
        let x = this.iconMargin;
        let y = this.iconMargin;
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        this.desktop.apps.forEach((app, index) => {
            app.position = { x, y };
            
            const iconElement = document.querySelector(`[data-app-id="${app.id}"]`);
            if (iconElement) {
                iconElement.style.left = `${x}px`;
                iconElement.style.top = `${y}px`;
            }
            
            x += this.iconSize + this.iconMargin;
            if (x + this.iconSize > canvasRect.width) {
                x = this.iconMargin;
                y += this.iconSize + this.iconMargin;
            }
        });
        
        this.desktop.saveApps();
    }
}
