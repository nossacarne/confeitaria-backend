const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', async (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    console.log(`\n⚡ Buscando no Mercado Livre: ${ingrediente}`);

    const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(ingrediente)}`;

    try {
        // O TRUQUE DE MESTRE: O "Crachá" de identificação (User-Agent)
        // Isso faz o Mercado Livre achar que o Render é um computador normal
        const resposta = await fetch(urlAPI, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const dados = await resposta.json();

        // Verifica se a API devolveu produtos de verdade
        if (dados.results && dados.results.length > 0) {
            const precoExato = dados.results[0].price;
            console.log(`✅ Sucesso! Preço: R$ ${precoExato}`);
            res.json({ ingrediente, preco: precoExato });
        } else {
            console.log(`❌ Mercado Livre retornou lista vazia.`);
            res.json({ ingrediente, preco: null });
        }

    } catch (erro) {
        console.error(`❌ Erro no servidor:`, erro.message);
        res.json({ ingrediente, preco: null });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Blindado ativo na porta ${PORT}`);
});
