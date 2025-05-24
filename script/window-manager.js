export class WindowManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.windows = [];
        this.activeWindow = null;
        this.zIndexCounter = 1600;
        this.loadWindowStates();
    }
    
    loadWindowStates() {
        const savedStates = localStorage.getItem('window_states');
        this.windowStates = savedStates ? JSON.parse(savedStates) : {};
    }
    
    saveWindowState(appId, state) {
        this.windowStates[appId] = state;
        localStorage.setItem('window_states', JSON.stringify(this.windowStates));
    }
    
    openAppWindow(app) {
        console.log('WindowManager: Opening window for app:', app.name);
        
        // Check if window is already open
        const existingWindow = this.windows.find(w => w.appId === app.id);
        if (existingWindow) {
            this.focusWindow(existingWindow.element);
            return;
        }
        
        // Get saved state or use defaults
        const savedState = this.windowStates[app.id] || {
            position: { x: 100 + this.windows.length * 30, y: 100 + this.windows.length * 30 },
            size: { width: Math.max(600, 200), height: Math.max(400, 200) },
            minimized: false,
            maximized: false
        };
        
        // Ensure minimum size
        savedState.size.width = Math.max(savedState.size.width, 200);
        savedState.size.height = Math.max(savedState.size.height, 200);
        
        // Create window element
        const windowElement = this.createWindowElement(app);
        document.body.appendChild(windowElement);
        
        // Apply saved state
        windowElement.style.left = `${savedState.position.x}px`;
        windowElement.style.top = `${savedState.position.y}px`;
        windowElement.style.width = `${savedState.size.width}px`;
        windowElement.style.height = `${savedState.size.height}px`;
        
        // Add glass effect
        windowElement.style.backdropFilter = 'blur(10px)';
        windowElement.style.background = 'rgba(255, 255, 255, 0.1)';
        windowElement.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        
        // Add to windows array
        const windowData = {
            appId: app.id,
            element: windowElement,
            position: savedState.position,
            size: savedState.size,
            minimized: savedState.minimized,
            maximized: savedState.maximized
        };
        
        this.windows.push(windowData);
        
        // Setup window events
        this.setupWindowEvents(windowElement, windowData);
        
        // Load app content
        this.loadAppContent(windowElement, app);
        
        // Focus the window
        this.focusWindow(windowElement);
        
        // Add search suggestion
        this.desktop.searchManager.addSearchSuggestion(app);
        
        console.log('Window opened successfully for:', app.name);
        return windowData;
    }
    
    createWindowElement(app) {
        const template = document.getElementById('appWindowTemplate');
        const windowElement = template.cloneNode(true);
        
        windowElement.id = `window_${app.id}`;
        windowElement.style.display = 'block';
        windowElement.style.zIndex = ++this.zIndexCounter;
        
        // Set window title with icon
        const iconElement = windowElement.querySelector('.window-icon');
        const nameElement = windowElement.querySelector('.window-name');
        iconElement.textContent = app.icon;
        nameElement.textContent = app.name;
        
        // Apply theme color to header
        const header = windowElement.querySelector('.window-header');
        const themeColor = this.desktop.settingsManager.getSetting('themeColor') || '#007AFF';
        header.style.backgroundColor = themeColor;
        header.style.color = '#ffffff';
        
        // Make window resizable
        this.makeResizable(windowElement);
        
        return windowElement;
    }
    
    makeResizable(windowElement) {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            background: linear-gradient(-45deg, transparent 0px, transparent 6px, #666 6px, #666 10px, transparent 10px);
            cursor: nw-resize;
            z-index: 10;
        `;
        
        windowElement.appendChild(resizeHandle);
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(windowElement).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(windowElement).height, 10);
            
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
        });
        
        const handleResize = (e) => {
            if (!isResizing) return;
            
            const newWidth = Math.max(200, startWidth + e.clientX - startX);
            const newHeight = Math.max(200, startHeight + e.clientY - startY);
            
            windowElement.style.width = newWidth + 'px';
            windowElement.style.height = newHeight + 'px';
        };
        
        const stopResize = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
            
            // Save new size
            const windowData = this.windows.find(w => w.element === windowElement);
            if (windowData) {
                windowData.size = {
                    width: windowElement.offsetWidth,
                    height: windowElement.offsetHeight
                };
                this.saveWindowState(windowData.appId, windowData);
            }
        };
    }
    
    setupWindowEvents(windowElement, windowData) {
        const header = windowElement.querySelector('.window-header');
        const closeBtn = windowElement.querySelector('.window-btn.close');
        
        // Window dragging with improved performance
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-btn')) return;
            
            isDragging = true;
            const rect = windowElement.getBoundingClientRect();
            dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            this.focusWindow(windowElement);
            windowElement.style.transition = 'none';
            
            const handleMouseMove = (e) => {
                if (!isDragging) return;
                
                requestAnimationFrame(() => {
                    const x = e.clientX - dragOffset.x;
                    const y = e.clientY - dragOffset.y;
                    
                    // Keep window within screen bounds
                    const maxX = window.innerWidth - windowElement.offsetWidth;
                    const maxY = window.innerHeight - windowElement.offsetHeight;
                    
                    const newX = Math.max(0, Math.min(x, maxX));
                    const newY = Math.max(0, Math.min(y, maxY));
                    
                    windowElement.style.left = `${newX}px`;
                    windowElement.style.top = `${newY}px`;
                    
                    windowData.position = { x: newX, y: newY };
                });
            };
            
            const handleMouseUp = () => {
                isDragging = false;
                windowElement.style.transition = 'var(--transition)';
                this.saveWindowState(windowData.appId, windowData);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        // Window focus
        windowElement.addEventListener('mousedown', () => {
            this.focusWindow(windowElement);
        });
        
        // Close button
        closeBtn.addEventListener('click', () => {
            this.closeWindow(windowElement, windowData);
        });
        
        // Double-click header to maximize/restore
        header.addEventListener('dblclick', () => {
            this.toggleMaximize(windowElement, windowData);
        });
        
        // Save state on resize
        const resizeObserver = new ResizeObserver(() => {
            if (!windowData.maximized) {
                windowData.size = {
                    width: Math.max(200, windowElement.offsetWidth),
                    height: Math.max(200, windowElement.offsetHeight)
                };
                this.saveWindowState(windowData.appId, windowData);
            }
        });
        resizeObserver.observe(windowElement);
    }
    
    loadAppContent(windowElement, app) {
        const iframe = windowElement.querySelector('.app-iframe');
        
        if (app.content) {
            // Create blob URL for app content
            const blob = new Blob([app.content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            iframe.src = url;
            
            // Special handling for welcome app - make it fullscreen background
            if (app.id === 'welcome') {
                iframe.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        } else {
            // Show loading message
            iframe.srcdoc = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                        }
                        .loading {
                            text-align: center;
                            color: #666;
                        }
                        .spinner {
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #007AFF;
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 10px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </head>
                <body>
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Uygulama yükleniyor...</p>
                    </div>
                </body>
                </html>
            `;
        }
    }
    
    focusWindow(windowElement) {
        // Remove active class from all windows
        this.windows.forEach(w => w.element.classList.remove('active'));
        
        // Add active class to focused window
        windowElement.classList.add('active');
        windowElement.style.zIndex = ++this.zIndexCounter;
        
        this.activeWindow = windowElement;
    }
    
    minimizeWindow(windowElement, windowData) {
        if (windowData.minimized) {
            // Restore window
            windowElement.style.display = 'block';
            windowData.minimized = false;
            this.focusWindow(windowElement);
        } else {
            // Minimize window
            windowElement.style.display = 'none';
            windowData.minimized = true;
        }
        this.saveWindowState(windowData.appId, windowData);
    }
    
    closeWindow(windowElement, windowData) {
        // Save final state
        this.saveWindowState(windowData.appId, windowData);
        
        // Remove from windows array
        this.windows = this.windows.filter(w => w !== windowData);
        
        // Remove element from DOM
        windowElement.remove();
        
        // Focus next window if any
        if (this.windows.length > 0) {
            const lastWindow = this.windows[this.windows.length - 1];
            if (!lastWindow.minimized) {
                this.focusWindow(lastWindow.element);
            }
        } else {
            this.activeWindow = null;
        }
    }
    
    closeAppWindow(appId) {
        const windowData = this.windows.find(w => w.appId === appId);
        if (windowData) {
            this.closeWindow(windowData.element, windowData);
        }
    }
    
    toggleMaximize(windowElement, windowData) {
        if (windowData.maximized) {
            // Restore window
            windowElement.style.left = `${windowData.position.x}px`;
            windowElement.style.top = `${windowData.position.y}px`;
            windowElement.style.width = `${windowData.size.width}px`;
            windowElement.style.height = `${windowData.size.height}px`;
            windowData.maximized = false;
        } else {
            // Save current position and size
            windowData.position = {
                x: parseInt(windowElement.style.left),
                y: parseInt(windowElement.style.top)
            };
            windowData.size = {
                width: windowElement.offsetWidth,
                height: windowElement.offsetHeight
            };
            
            // Maximize window
            windowElement.style.left = '0px';
            windowElement.style.top = '60px';
            windowElement.style.width = '100vw';
            windowElement.style.height = 'calc(100vh - 60px)';
            windowData.maximized = true;
        }
        this.saveWindowState(windowData.appId, windowData);
    }
    
    getOpenWindows() {
        return this.windows.filter(w => !w.minimized);
    }
    
    getMinimizedWindows() {
        return this.windows.filter(w => w.minimized);
    }
    
    cascadeWindows() {
        this.windows.forEach((windowData, index) => {
            const offset = index * 30;
            windowData.element.style.left = `${100 + offset}px`;
            windowData.element.style.top = `${100 + offset}px`;
            windowData.position = { x: 100 + offset, y: 100 + offset };
            this.saveWindowState(windowData.appId, windowData);
        });
    }
    
    tileWindows() {
        const visibleWindows = this.getOpenWindows();
        if (visibleWindows.length === 0) return;
        
        const cols = Math.ceil(Math.sqrt(visibleWindows.length));
        const rows = Math.ceil(visibleWindows.length / cols);
        
        const windowWidth = window.innerWidth / cols;
        const windowHeight = (window.innerHeight - 60) / rows;
        
        visibleWindows.forEach((windowData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = col * windowWidth;
            const y = 60 + row * windowHeight;
            
            windowData.element.style.left = `${x}px`;
            windowData.element.style.top = `${y}px`;
            windowData.element.style.width = `${windowWidth}px`;
            windowData.element.style.height = `${windowHeight}px`;
            
            windowData.position = { x, y };
            windowData.size = { width: windowWidth, height: windowHeight };
            windowData.maximized = false;
            
            this.saveWindowState(windowData.appId, windowData);
        });
    }
    
    cycleWindows() {
        const visibleWindows = this.getOpenWindows();
        if (visibleWindows.length <= 1) return;
        
        const currentIndex = visibleWindows.findIndex(w => w.element === this.activeWindow);
        const nextIndex = (currentIndex + 1) % visibleWindows.length;
        this.focusWindow(visibleWindows[nextIndex].element);
    }
}
