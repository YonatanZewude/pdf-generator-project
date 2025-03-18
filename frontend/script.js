const downloadPDF = async () => {
    console.log("📡 Skickar begäran till backend...");

    try {
        // Hämta HTML-innehållet och logga det för felsökning
        const htmlContent = document.getElementById("pdf-content").innerHTML;
        console.log("📜 HTML som skickas till backend:", htmlContent);

        const response = await fetch("http://localhost:5000/generate-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: htmlContent }),
        });

        console.log("📥 Mottar svar från backend...");

        if (!response.ok) {
            console.error("❌ Fel vid generering av PDF:", await response.text());
            return;
        }

        // Kontrollera MIME-typen
        const contentType = response.headers.get("Content-Type");
        console.log("📡 Header Content-Type:", contentType);

        if (!contentType || !contentType.includes("application/pdf")) {
            console.error("🚨 Fel: Backend returnerade inte en PDF-fil!", contentType);
            return;
        }

        const pdfBlob = await response.blob();

        if (pdfBlob.size === 0) {
            console.error("🚨 Fel: PDF-filen är tom!");
            return;
        }

        console.log("📂 PDF-blob mottagen, storlek:", pdfBlob.size, "bytes");

        // Skapa en länk och ladda ner filen
        const blobURL = URL.createObjectURL(pdfBlob);
        console.log("📎 Blob URL skapad:", blobURL);

        const link = document.createElement("a");
        link.href = blobURL;
        link.download = "sida.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("📂 PDF nedladdad!");

        setTimeout(() => {
            URL.revokeObjectURL(blobURL);
            console.log("🔄 Blob URL rensad.");
        }, 3000);
    } catch (error) {
        console.error("🚨 Något gick fel:", error);
    }
};
