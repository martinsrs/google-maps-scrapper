const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

// Rota raiz
app.get("/", (req, res) => {
  res.send("Bem vindo ao Scraper Google Maps");
});

// Rota de busca no Google Maps
app.get("/search", async (req, res) => {
  const searchTerm = req.query.term;

  if (!searchTerm) {
    return res.status(400).json({ error: "O parâmetro 'term' é obrigatório." });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/google-chrome", // Caminho para o Chrome instalado
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--lang=pt-BR", // Define o idioma do navegador como português
      ],
    });

    const page = await browser.newPage();

    // Configura o cabeçalho de idioma
    await page.setExtraHTTPHeaders({
      "Accept-Language": "pt-BR,pt;q=0.9",
    });

    // Gera a URL de pesquisa do Google Maps
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log(`Pesquisando: ${searchTerm}`);

    // Seletor para os resultados
    const resultsSelector = `[aria-label="Resultados para ${searchTerm}"]`;
    await page.waitForSelector(resultsSelector, { timeout: 60000 }); // Aumenta o tempo limite para o carregamento

    // Rolar a página até carregar todos os resultados
    let previousHeight;
    while (true) {
      const resultDiv = await page.$(resultsSelector);
      previousHeight = await page.evaluate((el) => el.scrollHeight, resultDiv);
      await page.evaluate((el) => el.scrollBy(0, el.scrollHeight), resultDiv);
      await new Promise((resolve) => setTimeout(resolve, 6000)); // Aguarda 6 segundos entre as rolagens
      const newHeight = await page.evaluate((el) => el.scrollHeight, resultDiv);
      if (newHeight === previousHeight) break; // Sai do loop se não houver mais resultados
    }

    // Espera os resultados carregarem
    const results = await page.evaluate(() => {
      const names = document.querySelectorAll('.fontHeadlineSmall');
      const websites = Array.from(document.querySelectorAll('[data-value="Website"]'));

      const summary = document.querySelectorAll('.UaQhfb');
      const addresses = Array.from(summary).map((el) => {
            let text = el.innerText;
            const match = text.match(/·\s[^·\n]+·\s([^·\n]+)\n/);

            let address = null;
            if (match) {
              address = match[1].trim();
            } else {
              address = "Endereço não encontrado";
            }

            return address;
      });

      // Extrair os nomes, websites, telefones e endereços
      return Array.from(names).map((el, index) => {

        const findPhone = /\(\d{2}\)\s?\d{4,5}-\d{4}/;
        const findAddress = /·\s[^·\n]+·\s([^·\n]+)\n/;
        const address = summary[index].innerText.match(findAddress) ? summary[index].innerText.match(findAddress)[1] : "Endereço não encontrado";
        const phone = summary[index].innerText.match(findPhone) ? summary[index].innerText.match(findPhone)[0] : "Telefone não encontrado";


        const siteMatch = websites.find(site =>
          site.getAttribute("aria-label").includes(el.innerText)
        );

        return {
          name: el.innerText,
          website: siteMatch ? siteMatch.href : "Website não encontrado",
          address: address,
          phone: phone,
          summary: summary[index] ? summary[index].innerText : "Resumo não encontrado",
        };
      });

    });

    await browser.close();

    console.log("Consulta Finalizada");

    // Retorna os resultados como JSON
    return res.json({
      term: searchTerm,
      results,
    });
  } catch (error) {
    console.error("Erro ao realizar a pesquisa:", error);
    return res.status(500).json({ error: "Erro ao realizar a pesquisa." });
  }
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
