
const formLogin = document.querySelector("#formLogin");
const mensagemErro = document.querySelector("#mensagemErro");

formLogin.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const usuario = document.querySelector("#usuario").value.trim();
    const senha = document.querySelector("#senha").value;

    mensagemErro.textContent = "";

    try {
        const resposta = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario,
                senha
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Não foi possível entrar."
            );
        }

        // O navegador já recebeu o cookie de sessão.
        window.location.href = "/admin.html";

    } catch (erro) {
        mensagemErro.textContent = erro.message;
    }
});
