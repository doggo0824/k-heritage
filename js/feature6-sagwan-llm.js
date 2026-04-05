class SagwanLLM {
    constructor(apiKey) {
        this.conversation = [];
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
            <div class="sagwan-chat">
                <div class="chat-history" id="chat-history">
                    <div class="system-message">
                        <h3>📜 사관 LLM</h3>
                        <p>조선왕조실록 스타일로 기록됩니다</p>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="user-input" placeholder="대화 내용을 입력하세요..." />
                    <button id="send-btn">전송</button>
                    <button id="save-btn">실록 저장</button>
                </div>
            </div>
        `;
    }
    setupEventListeners() {
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    async sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        if (!message) return;
        this.addMessage('user', message);
        this.conversation.push({ role: 'user', content: message });
        input.value = '';
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: this.conversation })
            });
            const data = await response.json();
            this.addMessage('assistant', data.reply || '응답 생성 중 오류');
            this.conversation.push({ role: 'assistant', content: data.reply });
        } catch (error) {
            this.addMessage('assistant', 'API 호출 실패: ' + error.message);
        }
    }
    addMessage(role, content) {
        const history = document.getElementById('chat-history');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.innerHTML = `
            <div class="message-role">${role === 'user' ? '👤 사용자' : '📜 사관'}</div>
            <div class="message-content">${content}</div>
        `;
        history.appendChild(messageDiv);
        history.scrollTop = history.scrollHeight;
    }
}
