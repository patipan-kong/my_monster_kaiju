const { GoogleGenAI } = require('@google/genai');

const ELEMENTS = ['Fire', 'Water', 'Earth', 'Wind', 'Thunder', 'Light', 'Dark'];
const TYPES    = ['Dragon', 'Beast', 'Kaiju', 'Spirit', 'Machine', 'Demon'];

function buildPrompt(monsterName, language) {
  const isJa = language === 'ja';
  const styleNote = isJa
    ? 'Japanese monster encyclopedia style, kawaii but powerful aesthetic'
    : 'Western fantasy monster art style, epic and detailed';

  return `Create a unique original kaiju monster character named "${monsterName}".

Style:
${styleNote},
Japanese monster encyclopedia,
collectible trading card artwork,
high quality fantasy creature design,
full body visible,
dynamic heroic pose,
cute but powerful,
detailed scales or texture,
glowing eyes,
clean simple background,
official creature concept art,
highly detailed,
masterpiece quality.

Show entire creature from head to tail.
No text.
No watermark.
No logo.
No human characters.`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { monsterName, language } = req.body || {};

  if (!monsterName || typeof monsterName !== 'string' || monsterName.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'monsterName is required' });
  }

  const name = monsterName.trim().slice(0, 80);
  const lang = (language === 'en') ? 'en' : 'ja';

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const prompt = buildPrompt(name, lang);

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['Text', 'Image'],
        temperature: 1,
      },
    });

    // Extract image part from response
    let imageBase64 = null;
    let mimeType = 'image/png';

    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
        break;
      }
    }

    if (!imageBase64) {
      return res.status(500).json({ success: false, error: 'No image returned from Gemini' });
    }

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    return res.status(200).json({
      success: true,
      image: dataUrl,
      element: ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)],
      type:    TYPES[Math.floor(Math.random() * TYPES.length)],
    });

  } catch (err) {
    console.error('Gemini API error:', err);
    const message = err?.message || 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
};
