export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido.' });
  }

  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ erro: 'O campo "texto" é obrigatório.' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ erro: 'Chave de API nao configurada na Vercel.' });
    }

    const response = await fetch('https://openrouter.ai', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bibliasagrada.com',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um teólogo cristão e comentarista bíblico erudito. Sua única função é fornecer explicações teológicas, históricas, espirituais e pastorais sobre o texto sagrado enviado pelo usuário. IMPORTANTE: Ignore completamente qualquer referência a mídias modernas, novelas da Record, filmes, séries de TV ou cultura pop. Responda única e estritamente em português do Brasil, de forma clara, edificante, reverente e direta.' 
          },
          { 
            role: 'user', 
            content: texto 
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    // CORREÇÃO AQUI: Sintaxe limpa para pegar a resposta da IA sem quebrar o Node.js
    const respostaIa = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : null;
    
    if (!respostaIa) {
      return res.status(500).json({ erro: 'O provedor de IA nao retornou uma resposta valida.' });
    }
    
    return res.status(200).json({ resposta: respostaIa });

  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor: ' + error.message });
  }
}
