
const formPresente = document.querySelector("#formPresente");
const listaAdmin = document.querySelector("#listaAdmin");

// Cadastrar um presente
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
                nome,
                valor: Number(valor),
                link
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Erro ao cadastrar presente."
            );
        }

        alert("Presente cadastrado com sucesso!");

        formPresente.reset();

        // Atualiza a lista após o cadastro
        carregarPresentes();

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert(erro.message);
    }
});

// Buscar e mostrar os presentes
async function carregarPresentes() {
    try {
        const resposta = await fetch("/api/presentes");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os presentes.");
        }

        const presentes = await resposta.json();

        listaAdmin.innerHTML = "";

        if (presentes.length === 0) {
            listaAdmin.innerHTML =
                "<li>Nenhum presente cadastrado.</li>";
            return;
        }

        presentes.forEach(function (presente) {
            const item = document.createElement("li");

            const nome = document.createElement("strong");
            nome.textContent = presente.nome;

            const valor = document.createElement("span");
            valor.textContent =
                ` — R$ ${Number(presente.valor)
                    .toFixed(2)
                    .replace(".", ",")}`;

            const situacao = document.createElement("span");
            situacao.textContent = presente.escolhido === 1
                ? " — Escolhido"
                : " — Disponível";

            item.appendChild(nome);
            item.appendChild(valor);
            item.appendChild(situacao);


            if (presente.link) {
                const link = document.createElement("a");
                link.textContent = " — Ver produto";
                link.href = presente.link;
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                item.appendChild(link);
            }


            const botaoExcluir = document.createElement("button");

            botaoExcluir.textContent = "Excluir";
            botaoExcluir.type = "button";

            botaoExcluir.addEventListener("click", async function () {
                const confirmar = confirm(
                    `Tem certeza que deseja excluir "${presente.nome}"?`
                );

                if (!confirmar) {
                    return;
                }

                try {
                    const resposta = await fetch(
                        `/api/presentes/${presente.id}`,
                        {
                            method: "DELETE"
                        }
                    );

                    const resultado = await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            resultado.erro || "Não foi possível excluir o presente."
                        );
                    }

                    alert("Presente excluído com sucesso!");

                    carregarPresentes();

                } catch (erro) {
                    console.error("Erro ao excluir:", erro);
                    alert(erro.message);
                }
            });


            const botaoEditar = document.createElement("button");
            botaoEditar.textContent = "Editar";
            botaoEditar.type = "button";

            botaoEditar.addEventListener("click", async function () {
                const novoNome = prompt(
                    "Nome do presente:",
                    presente.nome
                );

                if (novoNome === null) return;

                const nome = novoNome.trim();

                if (!nome) {
                    alert("O nome não pode ficar vazio.");
                    return;
                }

                const novoValor = prompt(
                    "Valor do presente:",
                    String(presente.valor)
                );

                if (novoValor === null) return;

                const valor = Number(novoValor.replace(",", "."));

                if (!Number.isFinite(valor) || valor < 0) {
                    alert("Digite um valor válido e não negativo.");
                    return;
                }

                const novoLink = prompt(
                    "Link do produto (opcional):",
                    presente.link || ""
                );

                if (novoLink === null) return;

                const link = novoLink.trim();

                try {
                    const resposta = await fetch(
                        `/api/presentes/${presente.id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                nome,
                                valor,
                                link
                            })
                        }
                    );

                    const resultado = await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            resultado.erro || "Erro ao editar presente."
                        );
                    }

                    alert("Presente atualizado com sucesso!");

                    carregarPresentes();

                } catch (erro) {
                    console.error("Erro ao editar:", erro);
                    alert(erro.message);
                }
            });



            const botaoSituacao = document.createElement("button");
            botaoSituacao.type = "button";

            botaoSituacao.textContent = presente.escolhido === 1
                ? "Marcar como disponível"
                : "Marcar como escolhido";

            botaoSituacao.addEventListener("click", async function () {
                const novaSituacao = presente.escolhido === 1 ? 0 : 1;

                try {
                    const resposta = await fetch(
                        `/api/presentes/${presente.id}/escolhido`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                escolhido: novaSituacao
                            })
                        }
                    );

                    const resultado = await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            resultado.erro || "Erro ao alterar situação."
                        );
                    }

                    carregarPresentes();

                } catch (erro) {
                    console.error("Erro ao alterar situação:", erro);
                    alert(erro.message);
                }
            });

            item.appendChild(botaoSituacao);
            item.appendChild(botaoEditar);
            item.appendChild(botaoExcluir);
            listaAdmin.appendChild(item);

        });

    } catch (erro) {
        console.error("Erro ao carregar presentes:", erro);

        listaAdmin.innerHTML =
            "<li>Erro ao carregar os presentes.</li>";
    }
}

// Carrega os presentes assim que a página abre
carregarPresentes();
