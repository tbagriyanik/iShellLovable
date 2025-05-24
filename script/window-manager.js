export class WindowManager {
    constructor(desktop) {
        this.desktop = desktop;
        this.windows = [];
        this.activeWindow = null;
        this.zIndexCounter = 1600;
    }
    
    openAppWindow(app) {
        // Check if window is already open
        const existingWindow = this.windows.find(w => w.appId === app.id);
        if (existingWindow) {
            this.focusWindow(existingWindow.element);
            return;
        }
        
        // Create window element
        const windowElement = this.createWindowElement(app);
        document.body.appendChild(windowElement);
        
        // Add to windows array
        const windowData = {
            appId: app.id,
            element: windowElement,
            position: { x: 100 + this.windows.length * 30, y: 100 + this.windows.length * 30 },
            size: { width: 600, height: 400 },
            minimized: false
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
        
        return windowData;
    }
    
    createWindowElement(app) {
        const template = document.getElementById('appWindowTemplate');
        const windowElement = template.cloneNode(true);
        
        windowElement.id = `window_${app.id}`;
        windowElement.style.display = 'block';
        windowElement.style.left = '100px';
        windowElement.style.top = '100px';
        windowElement.style.width = '600px';
        windowElement.style.height = '400px';
        windowElement.style.zIndex = ++this.zIndexCounter;
        
        // Set window title
        const titleElement = windowElement.querySelector('.window-title');
        titleElement.textContent = app.name;
        
        return windowElement;
    }
    
    setupWindowEvents(windowElement, windowData) {
        const header = windowElement.querySelector('.window-header');
        const minimizeBtn = windowElement.querySelector('.window-btn.minimize');
        const closeBtn = windowElement.querySelector('.window-btn.close');
        
        // Window dragging
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = windowElement.getBoundingClientRect();
            dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            this.focusWindow(windowElement);
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            
            // Keep window within screen bounds
            const maxX = window.innerWidth - windowElement.offsetWidth;
            const maxY = window.innerHeight - windowElement.offsetHeight;
            
            windowElement.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            windowElement.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
            
            windowData.position = { x, y };
        };
        
        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        // Window focus
        windowElement.addEventListener('mousedown', () => {
            this.focusWindow(windowElement);
        });
        
        // Minimize button
        minimizeBtn.addEventListener('click', () => {
            this.minimizeWindow(windowElement, windowData);
        });
        
        // Close button
        closeBtn.addEventListener('click', () => {
            this.closeWindow(windowElement, windowData);
        });
        
        // Double-click header to maximize/restore
        header.addEventListener('dblclick', () => {
            this.toggleMaximize(windowElement, windowData);
        });
    }
    
    loadAppContent(windowElement, app) {
        const iframe = windowElement.querySelector('.app-iframe');
        
        if (app.content) {
            // Create blob URL for app content
            const blob = new Blob([app.content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            iframe.src = url;
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
                            background: #f5f5f5;
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
    }
    
    closeWindow(windowElement, windowData) {
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
            windowElement.style.top = '60px'; // Account for header
            windowElement.style.width = '100vw';
            windowElement.style.height = 'calc(100vh - 60px)';
            windowData.maximized = true;
        }
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
        });
    }
    
    tileWindows() {
        const visibleWindows = this.getOpenWindows();
        if (visibleWindows.length === 0) return;
        
        const cols = Math.ceil(Math.sqrt(visibleWindows.length));
        const rows = Math.ceil(visibleWindows.length / cols);
        
        const windowWidth = window.innerWidth / cols;
        const windowHeight = (window.innerHeight - 60) / rows; // Account for header
        
        visibleWindows.forEach((windowData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = col * windowWidth;
            const y = 60 + row * windowHeight; // Account for header
            
            windowData.element.style.left = `${x}px`;
            windowData.element.style.top = `${y}px`;
            windowData.element.style.width = `${windowWidth}px`;
            windowData.element.style.height = `${windowHeight}px`;
            
            windowData.position = { x, y };
            windowData.size = { width: windowWidth, height: windowHeight };
            windowData.maximized = false;
        });
    }
}
