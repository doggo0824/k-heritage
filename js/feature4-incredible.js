// js/feature4-incredible.js
class TraditionalIncredibleBox {
    constructor(apiKey, app) {
        this.apiKey = apiKey;
        this.app = app;
        this.instruments = [
            { name: '거문고', sound: 'assets/sounds/geomungo.mp3', key: 'q', frequency: 261.63 },
            { name: '해금', sound: 'assets/sounds/haegeum.mp3', key: 'w', frequency: 293.66 },
            { name: '가야금', sound: 'assets/sounds/gayageum.mp3', key: 'e', frequency: 329.63 },
            { name: '대금', sound: 'assets/sounds/daegeum.mp3', key: 'r', frequency: 349.23 },
            { name: '장구', sound: 'assets/sounds/janggu.mp3', key: 'a', frequency: 392.00 },
            { name: '북', sound: 'assets/sounds/buk.mp3', key: 's', frequency: 440.00 }
        ];
        this.audios = {};
        this.init();
    }
    
    init() {
        this.renderUI();
        this.setupKeyboard();
        this.setupAudioContext();
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('IncredibleBox Audio initialized');
        } catch (e) {
            console.error('Audio setup failed:', e);
        }
    }
    
    async loadSounds() {
        for (const inst of this.instruments) {
            const audio = new Audio(inst.sound);
            audio.volume = 0.5;
            audio.preload = 'auto';
            this.audios[inst.key] = audio;
        }
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.audios[key]) {
                this.playInstrument(key);
            }
        });
    }
    
    renderUI() {
        const container = document.getElementById('feature-container');
        container.innerHTML = `
            <div class="instrument-panel">
                <h2 style="color:#00ff00; text-shadow:0 0 20px rgba(0,255,0,0.8); font-family:'Courier New', monospace; margin-bottom:2rem;">🎵 전통 악기 인크레디박스</h2>
                <div class="instruments-grid">
                    ${this.instruments.map(inst => `
                        <button class="instrument-btn" data-key="${inst.key}" data-freq="${inst.frequency}">
                            <span class="key">${inst.key.toUpperCase()}</span>
                            <span class="name">${inst.name}</span>
                        </button>
                    `).join('')}
                </div>
                <p style="color:#00ff00; margin-top:2rem; font-family:'Courier New', monospace;">
                    키보드나 버튼을 눌러 연주하세요<br>
                    <small>Q W E R A S 키</small>
                </p>
            </div>
        `;
        
        container.querySelectorAll('.instrument-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                this.playInstrument(key);
            });
            
            btn.addEventListener('mouseenter', () => {
                if (this.app) this.app.playSound('hover');
            });
        });
    }
    
    playInstrument(key) {
        const audio = this.audios[key];
        const btn = document.querySelector(`[data-key="${key}"]`);
        
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => {
                console.log('Audio play failed, using oscillator:', e);
                this.playTone(key);
            });
            
            if (this.app) this.app.playSound('instrument');
        } else {
            this.playTone(key);
        }
        
        if (btn) {
            btn.classList.add('playing');
            setTimeout(() => btn.classList.remove('playing'), 200);
        }
    }
    
    playTone(key) {
        if (!this.audioContext) return;
        
        const frequency = this.instruments.find(i => i.key === key)?.frequency || 440;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
}
