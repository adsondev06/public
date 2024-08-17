const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Verifica se o diretório de upload temporário existe, e o cria se necessário
const uploadDir = path.join(__dirname, 'tmp/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Inicializa o servidor Express
const app = express();

// Configuração do multer para o upload de arquivos
const upload = multer({ dest: uploadDir });

// Função para realizar a busca PROCV
function performLookup(filePath, searchValue, searchColumn, returnColumn) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const parsedSearchValue = isNaN(searchValue) ? searchValue : Number(searchValue);

    const results = data
        .filter(row => {
            const cellValue = row[searchColumn];
            const parsedCellValue = isNaN(cellValue) ? cellValue : Number(cellValue);
            return parsedCellValue === parsedSearchValue;
        })
        .map(row => `${searchColumn}: ${row[searchColumn]} ${returnColumn}: ${row[returnColumn] || 'Não encontrado'}`);

    return results.length ? results : ['Não encontrado'];
}

// Função para enviar os resultados para a etiquetadora (essa função é um placeholder)
function printLabels(results) {
    console.log('Resultados para impressão:', results);
}

// Endpoint principal para lidar com o upload e a busca
app.post('/api/lookup', upload.single('file'), (req, res) => {
    console.log('Arquivo recebido:', req.file);
    console.log('Body:', req.body);

    try {
        if (!req.file) {
            throw new Error('Nenhum arquivo enviado.');
        }

        const filePath = path.join(uploadDir, req.file.filename);
        const searchValue = req.body.search_value.trim();
        const searchColumn = req.body.search_column.trim();
        const returnColumn = req.body.return_column.trim();

        const results = performLookup(filePath, searchValue, searchColumn, returnColumn);

        // Imprime os resultados
        printLabels(results);

        // Limpa o arquivo após uso
        fs.unlinkSync(filePath);

        res.status(200).json({ results });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: error.message });
    }
});

// Adiciona um endpoint para lidar com requisições GET (pode ser útil para testes)
app.get('/', (req, res) => {
    res.send('API de busca está funcionando!');
});

// Inicia o servidor na porta desejada
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
