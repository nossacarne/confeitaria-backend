const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    console.log(`\n⚡ Buscando com disfarce: ${ingrediente}`);

    const options = {
        hostname: 'api.mercadolibre.com',
        path: `/sites/MLB/search?q=${encodeURIComponent(ingrediente)}`,
        method: 'GET',
        headers: {
            // O DISFARCE: Fazemos o Render fingir que é um computador pessoal
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'max-age=0'
        }
    };

    https.get(options, (respostaAPI) => {
        let dados = '';
        
        respostaAPI.on('data', (pedaco) => { dados += pedaco; });

        respostaAPI.on('end', () => {
            try {
                const resultado = JSON.parse(dados);
                
                // Se o ML retornar 200, ele aceitou nosso disfarce!
                if (respostaAPI.statusCode === 200 && resultado.results && resultado.results.length > 0) {
                    const precoExato = resultado.results[0].price;
                    console.log(`✅ Sucesso! Preço: R$ ${precoExato}`);
                    res.json({ preco: precoExato });
                } else {
                    console.log(`❌ Bloqueio ou lista vazia. Status: ${respostaAPI.statusCode}`);
                    res.json({ preco: null, erro: "Não foi possível obter o preço agora" });
                }
            } catch (e) {
                res.status(500).json({ erro: 'Erro ao processar dados' });
            }
        });
    }).on('error', (erro) => {
        res.status(500).json({ erro: 'Falha interna' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor com disfarce ativo na porta ${PORT}`);
});
