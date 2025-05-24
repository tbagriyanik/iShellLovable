
export class AIGenerator {
    constructor(desktop) {
        this.desktop = desktop;
    }
    
    async generateAppContent(app) {
        try {
            // Show loading overlay
            document.getElementById('loadingOverlay').classList.add('active');
            
            // Generate content based on prompt
            const content = await this.createAppFromPrompt(app.prompt, app.name);
            
            // Update app with generated content
            app.content = content;
            this.desktop.saveApps();
            
            // Update any open windows
            const windowData = this.desktop.windowManager.windows.find(w => w.appId === app.id);
            if (windowData) {
                this.desktop.windowManager.loadAppContent(windowData.element, app);
            }
            
            // Hide loading overlay
            document.getElementById('loadingOverlay').classList.remove('active');
            
            console.log('App content generated successfully for:', app.name);
            
        } catch (error) {
            console.error('Error generating app content:', error);
            document.getElementById('loadingOverlay').classList.remove('active');
            
            // Fallback to basic template
            app.content = this.createBasicTemplate(app.name, app.prompt);
            this.desktop.saveApps();
        }
    }
    
    async createAppFromPrompt(prompt, appName) {
        // Simulate AI generation with a more sophisticated template system
        await this.delay(2000); // Simulate AI processing time
        
        // Analyze prompt to determine app type
        const appType = this.analyzePromptType(prompt);
        
        switch (appType) {
            case 'calculator':
                return this.generateCalculatorApp();
            case 'notepad':
                return this.generateNotepadApp();
            case 'todo':
                return this.generateTodoApp();
            case 'timer':
                return this.generateTimerApp();
            case 'weather':
                return this.generateWeatherApp();
            case 'game':
                return this.generateSimpleGame(prompt);
            case 'form':
                return this.generateFormApp(prompt);
            case 'chart':
                return this.generateChartApp();
            default:
                return this.generateCustomApp(prompt, appName);
        }
    }
    
    analyzePromptType(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('hesap') || lowerPrompt.includes('calculator') || lowerPrompt.includes('matematik')) {
            return 'calculator';
        } else if (lowerPrompt.includes('not') || lowerPrompt.includes('note') || lowerPrompt.includes('text')) {
            return 'notepad';
        } else if (lowerPrompt.includes('todo') || lowerPrompt.includes('görev') || lowerPrompt.includes('task')) {
            return 'todo';
        } else if (lowerPrompt.includes('timer') || lowerPrompt.includes('krono') || lowerPrompt.includes('zaman')) {
            return 'timer';
        } else if (lowerPrompt.includes('weather') || lowerPrompt.includes('hava')) {
            return 'weather';
        } else if (lowerPrompt.includes('oyun') || lowerPrompt.includes('game')) {
            return 'game';
        } else if (lowerPrompt.includes('form') || lowerPrompt.includes('input')) {
            return 'form';
        } else if (lowerPrompt.includes('chart') || lowerPrompt.includes('grafik')) {
            return 'chart';
        } else {
            return 'custom';
        }
    }
    
    generateCalculatorApp() {
        return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hesap Makinesi</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
        }
        .calculator {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 300px;
            margin: 0 auto;
        }
        .display {
            background: #000;
            color: white;
            padding: 20px;
            text-align: right;
            font-size: 24px;
            margin-bottom: 20px;
            border-radius: 8px;
            min-height: 40px;
        }
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        button {
            padding: 20px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            cursor: pointer;
            background: #e0e0e0;
            transition: all 0.2s;
        }
        button:hover {
            background: #d0d0d0;
            transform: scale(1.05);
        }
        .operator {
            background: #007AFF;
            color: white;
        }
        .operator:hover {
            background: #0056CC;
        }
        .equals {
            background: #34C759;
            color: white;
        }
        .equals:hover {
            background: #28A745;
        }
        .clear {
            background: #FF3B30;
            color: white;
        }
        .clear:hover {
            background: #DC3545;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <div class="display" id="display">0</div>
        <div class="buttons">
            <button class="clear" onclick="clearDisplay()">C</button>
            <button onclick="deleteLast()">⌫</button>
            <button class="operator" onclick="appendToDisplay('/')">/</button>
            <button class="operator" onclick="appendToDisplay('*')">×</button>
            
            <button onclick="appendToDisplay('7')">7</button>
            <button onclick="appendToDisplay('8')">8</button>
            <button onclick="appendToDisplay('9')">9</button>
            <button class="operator" onclick="appendToDisplay('-')">-</button>
            
            <button onclick="appendToDisplay('4')">4</button>
            <button onclick="appendToDisplay('5')">5</button>
            <button onclick="appendToDisplay('6')">6</button>
            <button class="operator" onclick="appendToDisplay('+')">+</button>
            
            <button onclick="appendToDisplay('1')">1</button>
            <button onclick="appendToDisplay('2')">2</button>
            <button onclick="appendToDisplay('3')">3</button>
            <button class="equals" onclick="calculate()" rowspan="2">=</button>
            
            <button onclick="appendToDisplay('0')" colspan="2" style="grid-column: span 2;">0</button>
            <button onclick="appendToDisplay('.')">.</button>
        </div>
    </div>

    <script>
        let display = document.getElementById('display');
        let currentInput = '0';
        let shouldResetDisplay = false;

        function updateDisplay() {
            display.textContent = currentInput;
        }

        function appendToDisplay(value) {
            if (shouldResetDisplay) {
                currentInput = '';
                shouldResetDisplay = false;
            }
            
            if (currentInput === '0' && value !== '.') {
                currentInput = value;
            } else {
                currentInput += value;
            }
            updateDisplay();
        }

        function clearDisplay() {
            currentInput = '0';
            updateDisplay();
        }

        function deleteLast() {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        }

        function calculate() {
            try {
                // Replace × with * for evaluation
                let expression = currentInput.replace(/×/g, '*');
                let result = eval(expression);
                currentInput = result.toString();
                shouldResetDisplay = true;
                updateDisplay();
            } catch (error) {
                currentInput = 'Hata';
                shouldResetDisplay = true;
                updateDisplay();
            }
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            if ('0123456789'.includes(key) || '+-*/.'.includes(key)) {
                appendToDisplay(key === '*' ? '×' : key);
            } else if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            } else if (key === 'Backspace') {
                deleteLast();
            }
        });
    </script>
</body>
</html>
        `;
    }
    
    generateNotepadApp() {
        return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Not Defteri</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .toolbar {
            background: #f8f9fa;
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .toolbar button {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .toolbar button:hover {
            background: #e9ecef;
        }
        .toolbar select {
            padding: 6px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
        }
        #editor {
            flex: 1;
            border: none;
            padding: 20px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            outline: none;
        }
        .status-bar {
            background: #f8f9fa;
            padding: 5px 10px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button onclick="newDocument()">Yeni</button>
        <button onclick="saveDocument()">Kaydet</button>
        <button onclick="openDocument()">Aç</button>
        <select id="fontSize" onchange="changeFontSize()">
            <option value="12">12px</option>
            <option value="14" selected>14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
        </select>
        <button onclick="toggleWordWrap()">Satır Kaydırma</button>
    </div>
    
    <textarea id="editor" placeholder="Notlarınızı buraya yazın..."></textarea>
    
    <div class="status-bar">
        <span id="charCount">0 karakter</span> | 
        <span id="wordCount">0 kelime</span> | 
        <span id="lineCount">1 satır</span>
    </div>

    <script>
        const editor = document.getElementById('editor');
        let wordWrapEnabled = true;

        // Auto-save to localStorage
        function autoSave() {
            localStorage.setItem('notepad_content', editor.value);
            updateStats();
        }

        // Load saved content
        function loadSavedContent() {
            const saved = localStorage.getItem('notepad_content');
            if (saved) {
                editor.value = saved;
                updateStats();
            }
        }

        function newDocument() {
            if (confirm('Mevcut dokümanı kaybetmek istediğinizden emin misiniz?')) {
                editor.value = '';
                localStorage.removeItem('notepad_content');
                updateStats();
            }
        }

        function saveDocument() {
            const content = editor.value;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'not.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function openDocument() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.onchange = function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        editor.value = e.target.result;
                        autoSave();
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        }

        function changeFontSize() {
            const fontSize = document.getElementById('fontSize').value;
            editor.style.fontSize = fontSize + 'px';
        }

        function toggleWordWrap() {
            wordWrapEnabled = !wordWrapEnabled;
            editor.style.whiteSpace = wordWrapEnabled ? 'pre-wrap' : 'pre';
        }

        function updateStats() {
            const text = editor.value;
            const charCount = text.length;
            const wordCount = text.trim() ? text.trim().split(/\\s+/).length : 0;
            const lineCount = text.split('\\n').length;

            document.getElementById('charCount').textContent = charCount + ' karakter';
            document.getElementById('wordCount').textContent = wordCount + ' kelime';
            document.getElementById('lineCount').textContent = lineCount + ' satır';
        }

        // Event listeners
        editor.addEventListener('input', autoSave);
        
        // Keyboard shortcuts
        editor.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        saveDocument();
                        break;
                    case 'o':
                        e.preventDefault();
                        openDocument();
                        break;
                    case 'n':
                        e.preventDefault();
                        newDocument();
                        break;
                }
            }
        });

        // Initialize
        loadSavedContent();
    </script>
</body>
</html>
        `;
    }
    
    generateWelcomeApp() {
        return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoş Geldiniz</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            height: calc(100vh - 80px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
            max-width: 600px;
            line-height: 1.6;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 800px;
            margin-top: 40px;
        }
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .feature h3 {
            margin-top: 0;
            font-size: 1.5em;
        }
        .emoji {
            font-size: 2em;
            margin-bottom: 10px;
            display: block;
        }
        .version {
            position: absolute;
            bottom: 20px;
            right: 20px;
            opacity: 0.6;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>🚀 AI Desktop Environment</h1>
    <p>
        Modern, yapay zeka destekli masaüstü ortamına hoş geldiniz! 
        Bu platform ile kendi uygulamalarınızı oluşturabilir, 
        özelleştirebilir ve organize edebilirsiniz.
    </p>
    
    <div class="features">
        <div class="feature">
            <span class="emoji">🤖</span>
            <h3>AI Destekli</h3>
            <p>Sadece açıklama yazın, AI sizin için uygulama oluştursun.</p>
        </div>
        <div class="feature">
            <span class="emoji">🎨</span>
            <h3>Özelleştirilebilir</h3>
            <p>Temalar, renkler ve yazı tiplerini istediğiniz gibi ayarlayın.</p>
        </div>
        <div class="feature">
            <span class="emoji">🖱️</span>
            <h3>Sürükle & Bırak</h3>
            <p>Uygulamaları masaüstünde istediğiniz yere taşıyın.</p>
        </div>
        <div class="feature">
            <span class="emoji">🔍</span>
            <h3>Akıllı Arama</h3>
            <p>Uygulamalarınızı hızla bulun ve çalıştırın.</p>
        </div>
        <div class="feature">
            <span class="emoji">🌍</span>
            <h3>Çoklu Dil</h3>
            <p>Türkçe ve İngilizce dil desteği mevcuttur.</p>
        </div>
        <div class="feature">
            <span class="emoji">💾</span>
            <h3>Yerel Depolama</h3>
            <p>Tüm verileriniz güvenle tarayıcınızda saklanır.</p>
        </div>
    </div>
    
    <div class="version">v1.0.0</div>
    
    <script>
        // Add some interactive animations
        document.querySelectorAll('.feature').forEach((feature, index) => {
            feature.style.animationDelay = (index * 0.1) + 's';
            feature.style.animation = 'fadeInUp 0.6s ease-out forwards';
        });
        
        // CSS animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .feature {
                opacity: 0;
                transform: translateY(30px);
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>
        `;
    }
    
    generateCustomApp(prompt, appName) {
        // Generate a basic template for custom apps
        return this.createBasicTemplate(appName, prompt);
    }
    
    createBasicTemplate(appName, prompt) {
        return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: calc(100vh - 80px);
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        .prompt-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #007AFF;
        }
        .feature-placeholder {
            padding: 20px;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            text-align: center;
            color: #6c757d;
            margin: 20px 0;
        }
        button {
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }
        button:hover {
            background: #0056CC;
            transform: translateY(-1px);
        }
        .demo-area {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 ${appName}</h1>
        
        <div class="prompt-info">
            <h3>🤖 AI Prompt:</h3>
            <p>${prompt}</p>
        </div>
        
        <div class="feature-placeholder">
            <h3>🚧 Uygulama Geliştiriliyor</h3>
            <p>Bu uygulama AI tarafından oluşturulacak.<br>
            Prompt'a göre özel özellikler eklenecektir.</p>
        </div>
        
        <div class="demo-area">
            <h3>Demo Özellikleri:</h3>
            <button onclick="showMessage()">Test Butonu</button>
            <button onclick="addContent()">İçerik Ekle</button>
            <div id="output" style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px; min-height: 50px;"></div>
        </div>
    </div>

    <script>
        function showMessage() {
            document.getElementById('output').innerHTML = \`
                <h4>✅ Test Başarılı!</h4>
                <p>Uygulama çalışıyor. Prompt: "${prompt}"</p>
                <p>Zaman: \${new Date().toLocaleTimeString()}</p>
            \`;
        }

        function addContent() {
            const output = document.getElementById('output');
            const content = prompt('Eklemek istediğiniz içerik:');
            if (content) {
                output.innerHTML += \`<div style="margin: 10px 0; padding: 10px; background: #e3f2fd; border-radius: 4px;">📝 \${content}</div>\`;
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            console.log('${appName} uygulaması yüklendi');
            console.log('Prompt:', '${prompt}');
        });
    </script>
</body>
</html>
        `;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
