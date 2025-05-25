export class AppManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.gridSize = 20;
        this.iconSize = 100;
        this.iconMargin = 20;
        this.dragThreshold = 5;
        this.isDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.selectedIcon = null;
    }
    
    createDesktopIcon(app) {
        const icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.dataset.appId = app.id;
        icon.style.left = `${app.position.x}px`;
        icon.style.top = `${app.position.y}px`;
        
        // Enhanced colorful icons with gradients
        const colorfulIcons = {
            '📱': { icon: '📱', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            '🧮': { icon: '🧮', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            '📝': { icon: '📝', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
            '🎨': { icon: '🎨', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
            '📊': { icon: '📊', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            '🎮': { icon: '🎮', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
            '⚙️': { icon: '⚙️', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
            '👋': { icon: '👋', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
            '🌐': { icon: '🌐', bg: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
            '📧': { icon: '📧', bg: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)' },
            '📷': { icon: '📷', bg: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)' },
            '🎵': { icon: '🎵', bg: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)' },
            '🎬': { icon: '🎬', bg: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' },
            '📁': { icon: '📁', bg: 'linear-gradient(135deg, #00b894 0%, #55a3ff 100%)' },
            '💬': { icon: '💬', bg: 'linear-gradient(135deg, #00cec9 0%, #55efc4 100%)' },
            '🔐': { icon: '🔐', bg: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)' },
            '💰': { icon: '💰', bg: 'linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%)' },
            '📰': { icon: '📰', bg: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
            '🏪': { icon: '🏪', bg: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)' },
            '🎯': { icon: '🎯', bg: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)' },
            '📈': { icon: '📈', bg: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)' }
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
    
    selectIcon(icon) {
        // Clear previous selection
        if (this.selectedIcon) {
            this.selectedIcon.classList.remove('selected');
        }
        
        // Set new selection
        this.selectedIcon = icon;
        if (icon) {
            icon.classList.add('selected');
        }
    }
    
    clearSelection() {
        if (this.selectedIcon) {
            this.selectedIcon.classList.remove('selected');
            this.selectedIcon = null;
        }
    }
    
    setupIconEvents(icon, app) {
        let clickTimeout;
        let touchStartTime = 0;
        
        // Single click to select and open app
        icon.addEventListener('click', (e) => {
            if (!this.isDragging) {
                e.preventDefault();
                e.stopPropagation();
                this.selectIcon(icon);
                this.desktop.openApp(app.id);
            }
        });
        
        // Right click for context menu
        icon.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.selectIcon(icon);
            this.desktop.contextMenuManager.showMenu(e.clientX, e.clientY, app.id);
        });
        
        // Touch events for mobile
        icon.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            this.startDrag(icon, e.touches[0]);
        });
        
        icon.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration > 500 && !this.isDragging) {
                // Long press - show context menu
                e.preventDefault();
                const touch = e.changedTouches[0];
                this.selectIcon(icon);
                this.desktop.contextMenuManager.showMenu(touch.clientX, touch.clientY, app.id);
            } else if (!this.isDragging && touchDuration < 300) {
                // Short tap - select and open app
                this.selectIcon(icon);
                this.desktop.openApp(app.id);
            }
        });
        
        // Mouse drag
        icon.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.selectIcon(icon);
                this.startDrag(icon, e);
            }
        });
    }
    
    startDrag(element, event) {
        this.draggedElement = element;
        this.isDragging = false;
        const rect = element.getBoundingClientRect();
        const canvasRect = document.getElementById('desktopCanvas').getBoundingClientRect();
        
        this.dragStartPos = {
            x: event.clientX,
            y: event.clientY
        };
        
        this.dragOffset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
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
        
        const deltaX = Math.abs(e.clientX - this.dragStartPos.x);
        const deltaY = Math.abs(e.clientY - this.dragStartPos.y);
        
        if (!this.isDragging && (deltaX > this.dragThreshold || deltaY > this.dragThreshold)) {
            this.isDragging = true;
            this.draggedElement.classList.add('dragging');
            this.draggedElement.style.transition = 'none';
            this.draggedElement.style.zIndex = '9999';
        }
        
        if (this.isDragging) {
            requestAnimationFrame(() => {
                this.updateElementPosition(e.clientX, e.clientY);
            });
        }
    }
    
    handleTouchDrag(e) {
        if (!this.draggedElement) return;
        e.preventDefault();
        const touch = e.touches[0];
        
        const deltaX = Math.abs(touch.clientX - this.dragStartPos.x);
        const deltaY = Math.abs(touch.clientY - this.dragStartPos.y);
        
        if (!this.isDragging && (deltaX > this.dragThreshold || deltaY > this.dragThreshold)) {
            this.isDragging = true;
            this.draggedElement.classList.add('dragging');
            this.draggedElement.style.transition = 'none';
            this.draggedElement.style.zIndex = '9999';
        }
        
        if (this.isDragging) {
            requestAnimationFrame(() => {
                this.updateElementPosition(touch.clientX, touch.clientY);
            });
        }
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
        
        // Find nearest non-overlapping position using spiral search
        const spiralSearch = (centerX, centerY, step = this.gridSize) => {
            let x = centerX;
            let y = centerY;
            let direction = 0;
            let steps = 1;
            let stepCount = 0;
            
            for (let i = 0; i < 100; i++) {
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
                
                switch (direction) {
                    case 0: x += step; break;
                    case 1: y += step; break;
                    case 2: x -= step; break;
                    case 3: y -= step; break;
                }
                
                stepCount++;
                if (stepCount === steps) {
                    stepCount = 0;
                    direction = (direction + 1) % 4;
                    if (direction % 2 === 0) steps++;
                }
            }
            
            return { x: targetX, y: targetY };
        };
        
        return spiralSearch(targetX, targetY);
    }
    
    stopDrag() {
        if (!this.draggedElement) return;
        
        // Update app position in data only if actually dragged
        if (this.isDragging) {
            const appId = this.draggedElement.dataset.appId;
            const app = this.desktop.apps.find(a => a.id === appId);
            
            if (app) {
                app.position = {
                    x: parseInt(this.draggedElement.style.left),
                    y: parseInt(this.draggedElement.style.top)
                };
                this.desktop.saveApps();
            }
        }
        
        this.draggedElement.classList.remove('dragging');
        this.draggedElement.style.transition = 'var(--transition)';
        this.draggedElement.style.zIndex = '';
        this.draggedElement = null;
        this.isDragging = false;
        
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
