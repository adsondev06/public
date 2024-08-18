const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Inicializa o servidor Express
const app = express();

// Configuração do multer para o upload de arquivos
const upload = multer({ 
    dest: path.join(__dirname, 'tmp/uploads'),
    limits: { fileSize: 10 * 1024 * 1024 } // Limita o tamanho do arquivo a 10MB
});

// Middleware para lidar com JSON e URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função para realizar a busca PROCV
function performLookup(filePath, searchValue, searchColumn, returnColumn) {
    try {
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
    } catch (error) {
        console.error('Erro ao processar o arquivo Excel:', error.message);
        throw new Error('Erro ao processar o arquivo Excel');
    }
}

// Função para enviar os resultados para a etiquetadora (essa função é um placeholder)
function printLabels(results) {
    console.log('Resultados para impressão:', results);
}

// Endpoint principal para lidar com o upload e a busca
app.post('/lookup', upload.single('file'), (req, res) => {
    console.log('Arquivo recebido:', req.file);
    console.log('Body:', req.body);

    try {
        if (!req.file) {
            throw new Error('Nenhum arquivo enviado.');
        }

        const filePath = path.join(__dirname, 'tmp/uploads', req.file.filename);
        const searchValue = req.body.search_value.trim();
        const searchColumn = req.body.search_column.trim();
        const returnColumn = req.body.return_column.trim();

        if (!searchValue || !searchColumn || !returnColumn) {
            throw new Error('Parâmetros de busca inválidos.');
        }

        console.log('Caminho do arquivo:', filePath);
        console.log('Valor de busca:', searchValue);
        console.log('Coluna de busca:', searchColumn);
        console.log('Coluna de retorno:', returnColumn);

        const results = performLookup(filePath, searchValue, searchColumn, returnColumn);

        // Imprime os resultados
        printLabels(results);

        // Limpa o arquivo após uso
        fs.unlinkSync(filePath);

        res.status(200).json({ results });
    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
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

// Exporta o aplicativo Express
module.exports = app;
