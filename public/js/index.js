
const btnCopia = document.querySelector("#Copia");
const inputCpf = document.querySelector("#cpf");
const listaPresentes = document.querySelector("#listaPresentes");

// Copiar a chave Pix
btnCopia.addEventListener("click", function () {
    navigator.clipboard.writeText(inputCpf.value)
        .then(() => {
            alert("Chave Pix copiada para a área de transferência!");
        })
        .catch(erro => {
            console.error("Erro ao copiar a chave Pix:", erro);
        });
});

// Buscar presentes na API
async function carregarPresentes() {
    try {
        const resposta = await fetch("/api/presentes");

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar os presentes.");
        }

        const presentes = await resposta.json();

        listaPresentes.innerHTML = "";

        if (presentes.length === 0) {
            listaPresentes.innerHTML =
                "<li>Nenhum presente cadastrado no momento.</li>";
            return;
        }

        presentes.forEach(presente => {
            const item = document.createElement("li");

            const nome = document.createElement("strong");
            nome.textContent = presente.nome;

            const valor = document.createElement("span");
            valor.textContent =
                ` ou pix: R$ ${Number(presente.valor).toFixed(2).replace(".", ",")}`;

            item.appendChild(nome);
            item.appendChild(valor);

            if (presente.link) {
                const botaoComprar = document.createElement("a");
                botaoComprar.textContent = "Comprar";
                botaoComprar.href = presente.link;
                botaoComprar.target = "_blank";
                botaoComprar.rel = "noopener noreferrer";

                item.appendChild(botaoComprar);
            }

            const botaoEscolher = document.createElement("button");
            botaoEscolher.type = "button";

            if (presente.escolhido === 1) {
                botaoEscolher.textContent = "Presente já escolhido!";
                botaoEscolher.disabled = true;
            } else {
                botaoEscolher.textContent = "Escolher";
                botaoEscolher.classList.add("bnt");
                botaoEscolher.dataset.nome = presente.nome;
            }

            item.appendChild(botaoEscolher);
            listaPresentes.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar presentes:", erro);

        listaPresentes.innerHTML =
            "<li>Não foi possível carregar os presentes.</li>";
    }
}

// Botões criados dinamicamente também serão reconhecidos
listaPresentes.addEventListener("click", function (evento) {
    const botao = evento.target.closest(".bnt");

    if (!botao) {
        return;
    }

    const whatsappNumber = "5561993578692";
    const itemName = botao.dataset.nome;

    const message =
        `Olá Wender, gostaria de escolher o seguinte item da sua lista de presentes: ${itemName}.`;

    const url =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
});

// Iniciar o carregamento
carregarPresentes();
