// Selecionar elementos
const btnCopia = document.querySelector("#Copia");
const inputCpf = document.querySelector("#cpf");

// Criar a função para copiar
btnCopia.addEventListener("click", function () {
    // Copiar o valor do input para a área de transferência
    navigator.clipboard.writeText(inputCpf.value).then(() => {
        // Exibir um alerta
        alert("Chave Pix copiada para a área de transferência!");
    }).catch(err => {
        console.error("Erro ao copiar a chave Pix:", err);
    });
});




// Selecionar todos os botões "Escolher"
const buttons = document.querySelectorAll('.bnt');

// Número de WhatsApp para receber as mensagens
const whatsappNumber = "5561993578692";

// Adicionar evento de clique a cada botão
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Capturar o item relacionado ao botão clicado
        const listItem = button.parentElement;
        const itemName = listItem.textContent.split("ou pix:")[0].trim(); // Nome do item
        const pixValue = listItem.querySelector('span').textContent.trim(); // Valor do PIX

        // Mensagem para o WhatsApp
        const message = `Olá Wender, gostaria de escolher o seguinte item da sua lista de presentes: ${itemName} .`;

        // Redirecionar para o WhatsApp
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });
});
