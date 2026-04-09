const express = require('express');
const cors = require('cors');
const https = require('https'); // 🚀 A FERRAMENTA DE FÁBRICA QUE NUNCA FALHA!

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    console.log(`\n⚡ Buscando: ${ingrediente}`);

    const options = {
        hostname: 'api.mercadolibre.com',
        path: `/sites/MLB/search?q=${encodeURIComponent(ingrediente)}`,
        method: 'GET',
        headers: {
            // O crachá de segurança para o Mercado Livre deixar a gente passar
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    // A requisição à moda antiga que o Render não tem como recusar
    https.get(options, (respostaAPI) => {
        let dados = '';
        
        respostaAPI.on('data', (pedaco) => {
            dados += pedaco;
        });

        respostaAPI.on('end', () => {
            // Dedo Duro: Se o ML bloquear mesmo assim, manda o erro vermelho pro app
            if (respostaAPI.statusCode !== 200) {
                return res.status(respostaAPI.statusCode).json({ erro: 'Bloqueado pelo Mercado Livre' });
            }

            try {
                const resultado = JSON.parse(dados);
                if (resultado.results && resultado.results.length > 0) {
                    const precoExato = resultado.results[0].price;
                    console.log(`✅ Sucesso! Preço: R$ ${precoExato}`);
                    res.json({ preco: precoExato });
                } else {
                    console.log(`❌ Mercado Livre retornou lista vazia.`);
                    res.json({ preco: null });
                }
            } catch (e) {
                res.status(500).json({ erro: 'Erro ao ler dados' });
            }
        });
    }).on('error', (erro) => {
        res.status(500).json({ erro: 'Falha interna do servidor' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor NATIVO e Blindado rodando na porta ${PORT}`);
});
