class ConservationExperience {
    constructor(apiKey) {
        this.artifactTypes = ['wood', 'stone', 'metal'];
        this.currentType = null;
        this.tools = {
            wood: ['brush', 'cleaner', 'preservative'],
            stone: ['brush', 'chisel', 'consolidant'],
            metal: ['brush', 'scalpel', 'corrosion_remover']
        };
        this.selectedTool = null;
        this.init();
    }
    init() {
        this.renderUI();
        this.setupCanvas();
    }
    renderUI() {
        const container = document.getElementById('feature-container');
        container.innerHTML = `
            <div class="conservation-experience">
                <h2>🔬 보존과학 체험</h2>
                <div class="artifact-selector">
                    <button data-type="wood">🌲 목재 유물</button>
                    <button data-type="stone">🪨 석재 유물</button>
                    <button data-type="metal">⚙️ 철제 유물</button>
                </div>
                <div class="tool-panel" id="tool-panel" style="display:none;">
                    <h3>보존 도구 선택</h3>
                    <div class="tools-grid" id="tools-grid"></div>
                </div>
                <div class="canvas-container" id="canvas-container" style="display:none;">
                    <canvas id="conservation-canvas"></canvas>
                </div>
            </div>
        `;
        container.querySelectorAll('.artifact-selector button').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectArtifact(e.target.dataset.type));
        });
    }
    setupCanvas() {
        this.canvas = document.getElementById('conservation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    }
    selectArtifact(type) {
        this.currentType = type;
        document.getElementById('tool-panel').style.display = 'block';
        document.getElementById('canvas-container').style.display = 'block';
        const toolsGrid = document.getElementById('tools-grid');
        toolsGrid.innerHTML = this.tools[type].map(tool => `<button class="tool-btn" data-tool="${tool}">${tool}</button>`).join('');
        toolsGrid.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectTool(btn.dataset.tool));
        });
        this.drawArtifact(type);
    }
    selectTool(tool) {
        this.selectedTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.tool === tool);
        });
    }
    drawArtifact(type) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = type === 'wood' ? '#8b4513' : type === 'stone' ? '#808080' : '#2f4f4f';
        ctx.fillRect(100, 100, 400, 200);
    }
    startDrawing(e) { this.isDrawing = true; this.lastX = e.offsetX; this.lastY = e.offsetY; }
    draw(e) {
        if (!this.isDrawing || !this.selectedTool) return;
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
    }
    stopDrawing() { this.isDrawing = false; }
}
