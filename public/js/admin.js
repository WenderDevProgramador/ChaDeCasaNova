
const formPresente = document.querySelector("#formPresente");
const listaAdmin = document.querySelector("#listaAdmin");
const pesquisa = document.querySelector("#pesquisa");
const filtroSituacao = document.querySelector("#filtroSituacao");

// ========================================
// 1. CADASTRAR PRESENTE
// ========================================

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

        await carregarPresentes();

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert(erro.message);
    }
});


// ========================================
// 2. BUSCAR, PESQUISAR E LISTAR PRESENTES
// ========================================

async function carregarPresentes() {
    try {
        const resposta = await fetch("/api/presentes");

        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar os presentes."
            );
        }

        const presentes = await resposta.json();

        // Primeiro, lemos os filtros.
        const termo = pesquisa.value.trim().toLowerCase();
        const situacaoSelecionada = filtroSituacao.value;

        // Depois, filtramos os presentes.
        const presentesFiltrados = presentes.filter(function (presente) {
            const nomeCombina = presente.nome
                .toLowerCase()
                .includes(termo);

            const situacaoCombina =
                situacaoSelecionada === "todos" ||
                (
                    situacaoSelecionada === "disponivel" &&
                    Number(presente.escolhido) === 0
                ) ||
                (
                    situacaoSelecionada === "escolhido" &&
                    Number(presente.escolhido) === 1
                );

            return nomeCombina && situacaoCombina;
        });

        // Agora podemos limpar a lista.
        listaAdmin.innerHTML = "";

        // Verificamos se existem resultados após os filtros.
        if (presentesFiltrados.length === 0) {
            const mensagem = document.createElement("li");
            mensagem.textContent = presentes.length === 0
                ? "Nenhum presente cadastrado."
                : "Nenhum presente encontrado com esses filtros.";

            listaAdmin.appendChild(mensagem);
            return;
        }

        // Mostramos cada presente encontrado.
        presentesFiltrados.forEach(function (presente) {
            const item = document.createElement("li");

            // Nome
            const nome = document.createElement("strong");
            nome.textContent = presente.nome;
            item.appendChild(nome);

            // Valor
            const valor = document.createElement("span");
            valor.textContent =
                ` — R$ ${Number(presente.valor)
                    .toFixed(2)
                    .replace(".", ",")}`;
            item.appendChild(valor);

            // Situação
            const situacao = document.createElement("span");
            situacao.textContent = Number(presente.escolhido) === 1
                ? " — Escolhido"
                : " — Disponível";
            item.appendChild(situacao);

            // Link para comprar
            if (presente.link) {
                const linkProduto = document.createElement("a");
                linkProduto.textContent = " — Ver produto";
                linkProduto.href = presente.link;
                linkProduto.id = "verProduto";
                linkProduto.target = "_blank";
                linkProduto.rel = "noopener noreferrer";

                item.appendChild(linkProduto);
            }


            // ========================================
            // 3. ALTERAR SITUAÇÃO
            // ========================================

            const botaoSituacao = document.createElement("button");
            botaoSituacao.type = "button";

            botaoSituacao.textContent =
                Number(presente.escolhido) === 1
                    ? "Marcar como disponível"
                    : "Marcar como escolhido";

            botaoSituacao.addEventListener("click", async function () {
                const novaSituacao =
                    Number(presente.escolhido) === 1 ? 0 : 1;

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
                            resultado.erro ||
                            "Erro ao alterar situação."
                        );
                    }

                    await carregarPresentes();

                } catch (erro) {
                    console.error("Erro ao alterar situação:", erro);
                    alert(erro.message);
                }
            });

            item.appendChild(botaoSituacao);


            // ========================================
            // 4. EDITAR PRESENTE
            // ========================================

            const botaoEditar = document.createElement("button");
            botaoEditar.type = "button";
            botaoEditar.textContent = "Editar";

            botaoEditar.addEventListener("click", async function () {
                const novoNome = prompt(
                    "Nome do presente:",
                    presente.nome
                );

                if (novoNome === null) return;

                const nomeEditado = novoNome.trim();

                if (!nomeEditado) {
                    alert("O nome não pode ficar vazio.");
                    return;
                }

                const novoValor = prompt(
                    "Valor do presente:",
                    String(presente.valor)
                );

                if (novoValor === null) return;

                const valorEditado = Number(
                    novoValor.replace(",", ".")
                );

                if (
                    novoValor.trim() === "" ||
                    !Number.isFinite(valorEditado) ||
                    valorEditado < 0
                ) {
                    alert("Digite um valor válido e não negativo.");
                    return;
                }

                const novoLink = prompt(
                    "Link do produto (opcional):",
                    presente.link || ""
                );

                if (novoLink === null) return;

                const linkEditado = novoLink.trim();

                try {
                    const resposta = await fetch(
                        `/api/presentes/${presente.id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                nome: nomeEditado,
                                valor: valorEditado,
                                link: linkEditado
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

                    await carregarPresentes();

                } catch (erro) {
                    console.error("Erro ao editar:", erro);
                    alert(erro.message);
                }
            });

            item.appendChild(botaoEditar);


            // ========================================
            // 5. EXCLUIR PRESENTE
            // ========================================

            const botaoExcluir = document.createElement("button");
            botaoExcluir.type = "button";
            botaoExcluir.textContent = "Excluir";

            botaoExcluir.addEventListener("click", async function () {
                const confirmar = confirm(
                    `Tem certeza que deseja excluir "${presente.nome}"?`
                );

                if (!confirmar) return;

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
                            resultado.erro ||
                            "Não foi possível excluir o presente."
                        );
                    }

                    alert("Presente excluído com sucesso!");

                    await carregarPresentes();

                } catch (erro) {
                    console.error("Erro ao excluir:", erro);
                    alert(erro.message);
                }
            });

            item.appendChild(botaoExcluir);

            // Adiciona o presente completo à lista.
            listaAdmin.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar presentes:", erro);

        listaAdmin.innerHTML =
            "<li>Erro ao carregar os presentes.</li>";
    }
}


// ========================================
// 6. ATUALIZAR OS FILTROS AUTOMATICAMENTE
// ========================================

pesquisa.addEventListener("input", carregarPresentes);

filtroSituacao.addEventListener("change", carregarPresentes);


// ========================================
// 7. CARREGAR A LISTA AO ABRIR A PÁGINA
// ========================================

carregarPresentes();
