const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function conectarBanco() {
    const banco = await open({
        filename: "./banco.db",
        driver: sqlite3.Database
    });

    return banco;
}

module.exports = conectarBanco;