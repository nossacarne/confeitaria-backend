const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    // Vamos buscar especificamente no catálogo público de preços
    const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(ingrediente)}&sort=price_asc&limit=1`;

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
    };

    https.get(urlAPI, options, (resAPI) => {
        let dados = '';
        resAPI.on('data', (d) => { dados += d; });
        resAPI.on('end', () => {
            try {
                const json = JSON.parse(dados);
                if (json.results && json.results.length > 0) {
                    // Pegamos o preço do primeiro resultado (que agora forçamos ser o mais barato)
                    const precoFinal = json.results[0].price;
                    res.json({ preco: precoFinal });
                } else {
                    res.json({ preco: null, erro: "Produto não localizado" });
                }
            } catch (e) {
                res.status(500).json({ erro: "Erro ao processar dados" });
            }
        });
    }).on('error', (e) => {
        res.status(500).json({ erro: "Erro de conexão" });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motor de busca ativo na porta ${PORT}`));
