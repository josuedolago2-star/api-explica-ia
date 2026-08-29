export default async function handler(req, res) {
  // Libera o acesso para o seu app Android conseguir fazer a requisição (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Trata a requisição de validação do Android (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Garante que só aceita requisições do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido. Use POST.' });
  }

  try {
    // Pega o texto enviado pelo seu aplicativo Android
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ erro: 'O campo "texto" é obrigatório.' });
    }

    // Pega a sua chave secreta que você vai cadastrar nas configurações da Vercel
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({ erro: 'Chave de API não configurada no servidor.' });
    }

    // Faz a chamada para o OpenRouter usando o DeepSeek Gratuito
    const response = await fetch('https://openrouter.ai', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://meuapp.com', // O OpenRouter pede um link qualquer de identificação
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free', // Modelo público e gratuito
        messages: [
          { 
            role: 'system', 
            content: 'Você é um assistente educacional e teológico. Explique o versículo bíblico ou o hino enviado pelo usuário de forma simples, pastoral e direta.' 
          },
          { 
            role: 'user', 
            content: texto 
          }
        ]
      })
    });

    const data = await response.json();

    // Extrai o texto gerado pela IA e devolve para o Android
    const respostaIa = data.choices?.[0]?.message?.content || 'Não foi possível gerar uma explicação.';
    
    return res.status(200).json({ resposta: respostaIa });

  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor: ' + error.message });
  }
}
