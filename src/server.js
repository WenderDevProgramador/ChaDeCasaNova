const express = require("express");

const conectarBanco = require("./database/server.js");

const app = express();

const PORT = 3000;

app.use(express.static("public"));

async function iniciarServidor() {
    const banco = await conectarBanco();

    await banco.exec(`
        CREATE TABLE IF NOT EXISTS presentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            valor REAL NOT NULL,
            link TEXT,
            escolhido INTEGER DEFAULT 0
        )
    `);

    

    const presentes = await banco.all(
        "SELECT * FROM presentes"
    );

    console.log(presentes);

    console.log("Banco de dados conectado!");
    console.log("Tabela presentes pronta!");

    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

iniciarServidor();