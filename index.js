const express = require('express');
const cors = require('cors');
const https = require('https'); 

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    console.log(`\n⚡ Buscando na API oficial: ${ingrediente}`);

    // CORREÇÃO: Removi a palavra "supermercado" para a API achar o produto pelo nome exato
    const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(ingrediente)}`;

    https.get(urlAPI, (respostaAPI) => {
        let dados = '';

        respostaAPI.on('data', (pedaco) => {
            dados += pedaco;
        });

        respostaAPI.on('end', () => {
            try {
                const resultadoJSON = JSON.parse(dados);
                
                // Se a API do Mercado Livre devolver uma lista com pelo menos 1 produto
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
