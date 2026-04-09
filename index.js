const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', async (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    console.log(`\n⚡ Buscando via API do Mercado Livre: ${ingrediente}`);

    try {
        // Usa a API pública e oficial do Mercado Livre (porta dos fundos, sem bloqueios!)
        // O fetch nativo do Node.js faz a busca instantaneamente sem abrir navegador
        const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(ingrediente + ' supermercado')}`;
        
        const resposta = await fetch(urlAPI);
        const dados = await resposta.json();

        // Verifica se a API retornou algum produto na lista (results)
        if (dados.results && dados.results.length > 0) {
            // Pega o preço (price) do primeiro produto da lista
            const precoExato = dados.results[0].price;
            
            console.log(`✅ Sucesso! Preço encontrado: R$ ${precoExato}`);
            res.json({ ingrediente, preco: precoExato });
        } else {
            console.log(`❌ Preço não encontrado na API.`);
            res.json({ ingrediente, preco: null, erro: "Preço não encontrado" });
        }

    } catch (erro) {
        console.error(`❌ Erro no servidor:`, erro.message);
        res.status(500).json({ erro: 'Falha na conexão com a API.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor API super rápido ativo na porta ${PORT}`);
});
