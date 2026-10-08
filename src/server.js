
const express = require("express");

const conectarBanco = require("./database/server.js");

const app = express();

const PORT = 3000;

// Disponibilizar os arquivos do Front-end
app.use(express.static("public"));

async function iniciarServidor() {
    const banco = await conectarBanco();

    // Criar a tabela caso ela ainda não exista
    await banco.exec(`
        CREATE TABLE IF NOT EXISTS presentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            valor REAL NOT NULL,
            link TEXT,
            escolhido INTEGER DEFAULT 0
        )
    `);

    // Nossa primeira rota da API
    app.get("/api/presentes", async (req, res) => {
        try {
            const presentes = await banco.all(
                "SELECT * FROM presentes"
            );

            res.json(presentes);

        } catch (erro) {
            console.error("Erro ao buscar presentes:", erro);

            res.status(500).json({
                erro: "Erro interno ao buscar presentes"
            });
        }
    });

    app.listen(PORT, () => {
        console.log(
            `Servidor rodando em http://localhost:${PORT}`
        );
    });
}

iniciarServidor();
