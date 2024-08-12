const resultElement = document.getElementById('result');

document.getElementById('lookup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', document.getElementById('file').files[0]);
    formData.append('search_value', document.getElementById('search_value').value);
    formData.append('search_column', document.getElementById('search_column').value);
    formData.append('return_column', document.getElementById('return_column').value);

    try {
        const response = await fetch('/api/lookup', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro na resposta do servidor: ${response.status}`);
        }

        const data = await response.json();
        const newResults = data.results || [];

        const existingResults = Array.from(resultElement.querySelectorAll('li')).map(li => li.textContent);
        const allResults = [...newResults, ...existingResults];

        resultElement.innerHTML = allResults.map(result => `<li>${result}</li>`).join('');
        
        document.getElementById('file').value = '';
        document.getElementById('search_value').value = '';
        document.getElementById('search_column').value = '';
        document.getElementById('return_column').value = '';
    } catch (error) {
        console.error('Erro:', error);
        resultElement.innerHTML = '<li>Erro ao buscar o pedido. Por favor, tente novamente.</li>';
    }
});
