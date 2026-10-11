
const formPresente = document.querySelector("#formPresente");

formPresente.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = document.querySelector("#nome").value.trim();
    const valor = document.querySelector("#valor").value;
    const link = document.querySelector("#link").value.trim();

    try {
        const resposta = await fetch("/api/presentes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome,
                valor: Number(valor),
                link: link
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao cadastrar presente.");
        }

        alert("Presente cadastrado com sucesso!");

        formPresente.reset();

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert(erro.message);
    }
});
