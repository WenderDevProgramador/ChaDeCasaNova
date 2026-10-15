
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const conectarBanco = require("./database/database.js");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

function verificarAdmin(req, res, next) {
    if (req.session && req.session.admin === true) {
        return next();
    }

    return res.status(401).json({
        erro: "Você precisa fazer login como administrador."
    });
}




// Disponibilizar os arquivos do Front-end
app.get("/admin.html", verificarAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/admin.html"));
});




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

    // Fazer login do administrador
    app.post("/api/login", async (req, res) => {
        try {
            const { usuario, senha } = req.body;

            if (
                typeof usuario !== "string" ||
                typeof senha !== "string" ||
                !process.env.ADMIN_USER ||
                !process.env.ADMIN_PASSWORD_HASH
            ) {
                return res.status(400).json({
                    erro: "Informe usuário e senha."
                });
            }

            const usuarioCorreto = usuario === process.env.ADMIN_USER;
            const senhaCorreta = await bcrypt.compare(
                senha,
                process.env.ADMIN_PASSWORD_HASH
            );

            if (!usuarioCorreto || !senhaCorreta) {
                return res.status(401).json({
                    erro: "Usuário ou senha incorretos."
                });
            }

            // Cria um novo identificador de sessão após autenticar.
            await new Promise((resolve, reject) => {
                req.session.regenerate(erro => {
                    if (erro) reject(erro);
                    else resolve();
                });
            });

            req.session.admin = true;

            // Garante que a sessão seja salva antes da resposta.
            await new Promise((resolve, reject) => {
                req.session.save(erro => {
                    if (erro) reject(erro);
                    else resolve();
                });
            });

            res.json({
                mensagem: "Login realizado com sucesso."
            });

        } catch (erro) {
            console.error("Erro no login:", erro);

            res.status(500).json({
                erro: "Erro interno ao realizar login."
            });
        }
    });

    // Sair da conta administrativa
    app.post("/api/logout", (req, res) => {
        req.session.destroy(erro => {
            if (erro) {
                console.error("Erro ao encerrar sessão:", erro);

                return res.status(500).json({
                    erro: "Não foi possível sair."
                });
            }

            res.clearCookie("connect.sid");

            res.json({
                mensagem: "Você saiu da área administrativa."
            });
        });
    });

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


    app.post("/api/presentes", verificarAdmin, async (req, res) => {
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


    app.put("/api/presentes/:id", verificarAdmin, async (req, res) => {
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



    app.patch("/api/presentes/:id/escolhido", verificarAdmin, async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { escolhido } = req.body;

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    erro: "ID inválido."
                });
            }

            if (escolhido !== 0 && escolhido !== 1) {
                return res.status(400).json({
                    erro: "A situação deve ser 0 ou 1."
                });
            }

            const resultado = await banco.run(
                "UPDATE presentes SET escolhido = ? WHERE id = ?",
                [escolhido, id]
            );

            if (resultado.changes === 0) {
                return res.status(404).json({
                    erro: "Presente não encontrado."
                });
            }

            res.json({
                mensagem: escolhido === 1
                    ? "Presente marcado como escolhido!"
                    : "Presente disponibilizado novamente!",
                id,
                escolhido
            });

        } catch (erro) {
            console.error("Erro ao alterar situação:", erro);

            res.status(500).json({
                erro: "Erro interno ao alterar situação."
            });
        }
    });




    app.delete("/api/presentes/:id", verificarAdmin, async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    erro: "ID inválido."
                });
            }

            const resultado = await banco.run(
                "DELETE FROM presentes WHERE id = ?",
                [id]
            );

            if (resultado.changes === 0) {
                return res.status(404).json({
                    erro: "Presente não encontrado."
                });
            }

            res.json({
                mensagem: "Presente excluído com sucesso!",
                id
            });
        } catch (erro) {
            console.error("Erro ao excluir presente:", erro);

            res.status(500).json({
                erro: "Erro interno ao excluir presente."
            });
        }
    });


    app.use(express.static(path.join(__dirname, "../public")));

    app.listen(PORT, () => {
        console.log(
            `Servidor rodando em http://localhost:${PORT}`
        );
    });
}

iniciarServidor();
