const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).send("❌ HTML saknas!");
    }

    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        console.log("📡 Laddar HTML i Puppeteer...");

        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                    }
                    th, td { 
                        border: 1px solid black; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #007bff; 
                        color: white; 
                    }
                    img { 
                        max-width: 100%; 
                        height: auto; 
                    }
                    button { 
                        display: none !important; /* Dölj knappar */
                    }
                    h1, h2, h3 { 
                        font-weight: bold; 
                    }
                </style>
            </head>
            <body>${html}</body></html>
        `, { waitUntil: "networkidle2" });

        console.log("✅ HTML laddat i Puppeteer.");

        // Generera PDF
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

        if (pdfBuffer.length === 0) {
            throw new Error("❌ PDF-filen är tom! Puppeteer genererade ingen output.");
        }

        console.log("📂 Genererad PDF-storlek:", pdfBuffer.length, "bytes");

        fs.writeFileSync("test.pdf", pdfBuffer);
        console.log("💾 Sparat test.pdf i backend-mappen");

        // Skicka PDF till klienten på rätt sätt
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=sida.pdf");
        res.setHeader("Content-Length", pdfBuffer.length);
        res.end(pdfBuffer);

        console.log("✅ PDF skickad till klienten.");
    } catch (error) {
        console.error("❌ Fel vid generering av PDF:", error);
        res.status(500).send("Fel vid PDF-generering.");
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server körs på http://localhost:${PORT}`));
