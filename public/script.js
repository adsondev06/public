// const resultElement = document.getElementById('result');

// document.getElementById('lookup-form').addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const formData = new FormData();
//     formData.append('file', document.getElementById('file').files[0]);
//     formData.append('search_value', document.getElementById('search_value').value);
//     formData.append('search_column', document.getElementById('search_column').value);
//     formData.append('return_column', document.getElementById('return_column').value);

//     try {
//         const response = await fetch('/lookup', {
//             method: 'POST',
//             body: formData
//         });

//         if (!response.ok) {
//             throw new Error('Erro na resposta do servidor');
//         }

//         const data = await response.json();
//         const newResults = data.results || [];

//         // Adiciona novos resultados ao início da lista
//         const existingResults = Array.from(resultElement.querySelectorAll('li')).map(li => li.textContent);
//         const allResults = newResults.concat(existingResults);

//         // Atualiza a lista de resultados
//         resultElement.innerHTML = allResults.map(result => `<li>${result}</li>`).join('');
        
//         // Limpar apenas o campo de busca
//         document.getElementById('search_value').value = '';
//     } catch (error) {
//         console.error('Erro:', error);
//         resultElement.innerHTML = '<li>Erro ao buscar pedido.</li>';
//     }
// });


const resultElement = document.getElementById('result');

document.getElementById('lookup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', document.getElementById('file').files[0]);
    formData.append('search_value', document.getElementById('search_value').value);
    formData.append('search_column', document.getElementById('search_column').value);
    formData.append('return_column', document.getElementById('return_column').value);

    try {
        const response = await fetch('/lookup', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro na resposta do servidor: ${response.status}`);
        }

        const data = await response.json();
        const newResults = data.results || [];

        // Adiciona novos resultados ao início da lista
        const existingResults = Array.from(resultElement.querySelectorAll('li')).map(li => li.textContent);
        const allResults = [...newResults, ...existingResults];

        // Atualiza a lista de resultados
        resultElement.innerHTML = allResults.map(result => `<li>${result}</li>`).join('');
        
        // Limpar os campos de entrada
        document.getElementById('file').value = '';
        document.getElementById('search_value').value = '';
        document.getElementById('search_column').value = '';
        document.getElementById('return_column').value = '';
    } catch (error) {
        console.error('Erro:', error);
        resultElement.innerHTML = '<li>Erro ao buscar o pedido. Por favor, tente novamente.</li>';
    }
});
