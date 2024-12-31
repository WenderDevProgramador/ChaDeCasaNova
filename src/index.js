// Selecionar todos os botões "Escolher"
const buttons = document.querySelectorAll('button');

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
