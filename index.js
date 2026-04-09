const express = require('express');
const cors = require('cors');
const https = require('https'); // Módulo blindado e nativo do Node.js

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    console.log(`\n⚡ Buscando na API oficial: ${ingrediente}`);

    const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(ingrediente + ' supermercado')}`;

    https.get(urlAPI, (respostaAPI) => {
        let dados = '';

        // Vai recebendo as informações da API aos poucos
        respostaAPI.on('data', (pedaco) => {
            dados += pedaco;
        });

        // Quando terminar de baixar a resposta
        respostaAPI.on('end', () => {
            try {
                const resultadoJSON = JSON.parse(dados);
                
                if (resultadoJSON.results && resultadoJSON.results.length > 0) {
                    const precoExato = resultadoJSON.results[0].price;
                    console.log(`✅ Sucesso! Preço: R$ ${precoExato}`);
                    res.json({ ingrediente, preco: precoExato });
                } else {
                    console.log(`❌ Preço não encontrado na API.`);
                    res.json({ ingrediente, preco: null, erro: "Preço não encontrado" });
                }
            } catch (e) {
                console.error('Erro ao ler JSON:', e);
                res.status(500).json({ erro: 'Erro interno' });
            }
        });

    }).on('error', (erro) => {
        console.error(`❌ Erro de conexão:`, erro.message);
        res.status(500).json({ erro: 'Falha na requisição' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor API blindado rodando na porta ${PORT}`);
});
