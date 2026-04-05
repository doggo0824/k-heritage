export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { prompt } = req.body;
    const apiKey = process.env.DALLE_API_KEY;
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ model: 'dall-e-3', prompt: prompt + ', korean traditional heritage style', n: 1, size: '1024x1024' })
        });
        const data = await response.json();
        return res.status(200).json({ image_url: data.data[0].url });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
