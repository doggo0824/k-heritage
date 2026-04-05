export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { messages } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ model: 'gpt-4', messages: messages, max_tokens: 500 })
        });
        const data = await response.json();
        const reply = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
