
const express = require("express");

const conectarBanco = require("./database/server.js");

const app = express();

const PORT = 3000;

// Disponibilizar os arquivos do Front-end
app.use(express.static("public"));
app.use(express.json());

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

    // Rota de criação de presente


    app.post("/api/presentes", async (req, res) => {
        try {
            const { nome, valor, link } = req.body;

            if (!nome || valor === undefined || valor === null || valor === "") {
                return res.status(400).json({
                    erro: "Nome e valor são obrigatórios."
                });
            }

            const valorNumerico = Number(valor);

            if (!Number.isFinite(valorNumerico) || valorNumerico < 0) {
                return res.status(400).json({
                    erro: "O valor precisa ser um número válido e não negativo."
                });
            }

            const resultado = await banco.run(
                `INSERT INTO presentes (nome, valor, link)
             VALUES (?, ?, ?)`,
                [nome.trim(), valorNumerico, link || null]
            );

            res.status(201).json({
                mensagem: "Presente cadastrado com sucesso!",
                id: resultado.lastID,
                nome: nome.trim(),
                valor: valorNumerico,
                link: link || null,
                escolhido: 0
            });
        } catch (erro) {
            console.error("Erro ao cadastrar presente:", erro);

            res.status(500).json({
                erro: "Erro interno ao cadastrar presente."
            });
        }
    });


    app.put("/api/presentes/:id", async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { nome, valor, link } = req.body;

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    erro: "ID inválido."
                });
            }

            if (
                typeof nome !== "string" ||
                !nome.trim() ||
                valor === undefined ||
                valor === null ||
                valor === ""
            ) {
                return res.status(400).json({
                    erro: "Nome e valor são obrigatórios."
                });
            }

            const valorNumerico = Number(valor);

            if (!Number.isFinite(valorNumerico) || valorNumerico < 0) {
                return res.status(400).json({
                    erro: "O valor precisa ser um número válido e não negativo."
                });
            }

            const presente = await banco.get(
                "SELECT id FROM presentes WHERE id = ?",
                [id]
            );

            if (!presente) {
                return res.status(404).json({
                    erro: "Presente não encontrado."
                });
            }

            await banco.run(
                `UPDATE presentes
             SET nome = ?, valor = ?, link = ?
             WHERE id = ?`,
                [nome.trim(), valorNumerico, link || null, id]
            );

            res.json({
                mensagem: "Presente atualizado com sucesso!",
                id,
                nome: nome.trim(),
                valor: valorNumerico,
                link: link || null
            });
        } catch (erro) {
            console.error("Erro ao atualizar presente:", erro);

            res.status(500).json({
                erro: "Erro interno ao atualizar presente."
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
