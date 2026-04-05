class InteractiveHeritage {
    constructor(apiKey) {
        this.prompt = '';
        this.generatedImage = null;
        this.apiKey = apiKey;
        this.init();
    }
    init() {
        this.renderUI();
        this.setupEventListeners();
    }
    renderUI() {
        const container = document.getElementById('feature-container');
        container.innerHTML = `
            <div class="interactive-heritage">
                <h2>🎨 인터렉티브 국가유산</h2>
                <div class="input-section">
                    <textarea id="prompt-input" placeholder="국가유산 이미지를 생성할 내용을 입력하세요..."></textarea>
                    <button id="generate-btn">🖼️ 이미지 생성</button>
                </div>
                <div class="image-preview" id="image-preview">
                    <p>생성된 이미지가 여기에 표시됩니다</p>
                </div>
                <div class="print-section" id="print-section" style="display:none;">
                    <button id="download-btn">💾 다운로드</button>
                    <button id="print-btn">🖨️ 프린터로 출력</button>
                </div>
            </div>
        `;
        document.getElementById('generate-btn').addEventListener('click', () => this.generateImage());
        document.getElementById('print-btn').addEventListener('click', () => this.printImage());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadImage());
    }
    setupEventListeners() {}
    async generateImage() {
        const input = document.getElementById('prompt-input');
        const prompt = input.value.trim();
        if (!prompt) { alert('내용을 입력해주세요.'); return; }
        this.prompt = prompt;
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '<p>이미지 생성 중...</p>';
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, style: 'korean_heritage' })
            });
            const data = await response.json();
            if (data.image_url) {
                this.generatedImage = data.image_url;
                preview.innerHTML = `<img src="${data.image_url}" alt="생성된 국가유산 이미지" />`;
                document.getElementById('print-section').style.display = 'block';
            }
        } catch (error) {
            preview.innerHTML = `<p style="color:red;">오류: ${error.message}</p>`;
        }
    }
    printImage() {
        if (!this.generatedImage) { alert('출력할 이미지가 없습니다.'); return; }
        window.print();
    }
    downloadImage() {
        if (!this.generatedImage) { alert('다운로드할 이미지가 없습니다.'); return; }
        const link = document.createElement('a');
        link.download = `heritage_${Date.now()}.png`;
        link.href = this.generatedImage;
        link.click();
    }
}
