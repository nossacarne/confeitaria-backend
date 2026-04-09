const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/buscar-preco', async (req, res) => {
    const ingrediente = req.query.nome;
    if (!ingrediente) return res.status(400).json({ erro: 'Informe o nome.' });

    let browser;
    try {
        // AJUSTE PARA O RENDER: headless: true e flags de segurança do Linux
        browser = await puppeteer.launch({ 
            headless: true, 
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ] 
        }); 
        
        const page = await browser.newPage();
        const urlBusca = `https://lista.mercadolivre.com.br/supermercado/${encodeURIComponent(ingrediente)}`;
        
        await page.goto(urlBusca, { waitUntil: 'domcontentloaded' });

        try {
            await page.waitForSelector('.andes-money-amount__fraction', { timeout: 5000 });
        } catch(e) {}

        const precoExtraido = await page.evaluate(() => {
            const fracoesDePreco = Array.from(document.querySelectorAll('.andes-money-amount__fraction'));
            if (fracoesDePreco.length > 0) {
                let reais = fracoesDePreco[0].innerText.replace(/\./g, '');
                let centavos = '00';
                const elementoPai = fracoesDePreco[0].closest('.andes-money-amount');
                if(elementoPai) {
                    const elemCentavos = elementoPai.querySelector('.andes-money-amount__cents');
                    if (elemCentavos) centavos = elemCentavos.innerText;
                }
                return parseFloat(`${reais}.${centavos}`);
            }
            return null;
        });

        res.json({ ingrediente, preco: precoExtraido });

    } catch (erro) {
        res.status(500).json({ erro: 'Erro no servidor.' });
    } finally {
        if (browser) await browser.close(); 
    }
});

// O Render define a porta automaticamente, por isso usamos process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor online na porta ${PORT}`));