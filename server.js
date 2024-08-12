// const multer = require('multer');
// const XLSX = require('xlsx');
// const path = require('path');
// const fs = require('fs');

// // Configuração do multer para o upload de arquivos
// const upload = multer({ dest: '/tmp/uploads/' });

// // Função para realizar a busca PROCV
// function performLookup(filePath, searchValue, searchColumn, returnColumn) {
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     const parsedSearchValue = isNaN(searchValue) ? searchValue : Number(searchValue);

//     const results = data
//         .filter(row => {
//             const cellValue = row[searchColumn];
//             const parsedCellValue = isNaN(cellValue) ? cellValue : Number(cellValue);
//             return parsedCellValue === parsedSearchValue;
//         })
//         .map(row => `${searchColumn}: ${row[searchColumn]} ${returnColumn}: ${row[returnColumn] || 'Não encontrado'}`);

//     return results.length ? results : ['Não encontrado'];
// }

// // Função para enviar os resultados para a etiquetadora
// function printLabels(results) {
//     // Essa função pode ser ajustada para imprimir via API se necessário
//     // Aqui você pode simular a impressão ou enviar para outra API
//     console.log('Resultados para impressão:', results);
// }

// // Função principal da API
// module.exports = async (req, res) => {
//     if (req.method === 'POST') {
//         try {
//             // Handle file upload
//             const uploadMiddleware = upload.single('file');
//             await new Promise((resolve, reject) => {
//                 uploadMiddleware(req, res, (err) => {
//                     if (err) reject(err);
//                     else resolve();
//                 });
//             });

//             const filePath = path.join('/tmp/uploads/', req.file.filename);
//             const searchValue = req.body.search_value.trim();
//             const searchColumn = req.body.search_column.trim();
//             const returnColumn = req.body.return_column.trim();

//             const results = performLookup(filePath, searchValue, searchColumn, returnColumn);

//             // Imprime os resultados
//             printLabels(results);

//             // Limpa o arquivo após uso
//             fs.unlinkSync(filePath);

//             res.status(200).json({ results });
//         } catch (error) {
//             console.error('Erro:', error.message);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     } else {
//         res.status(405).json({ error: 'Method Not Allowed' });
//     }
// };


const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Inicializa o servidor Express
const app = express();

// Configuração do multer para o upload de arquivos
const upload = multer({ dest: '/tmp/uploads/' });

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
app.post('/lookup', upload.single('file'), (req, res) => {
    try {
        const filePath = path.join('/tmp/uploads/', req.file.filename);
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
        console.error('Erro:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Adiciona um endpoint para lidar com requisições GET (pode ser útil para testes)
app.get('/', (req, res) => {
    res.send('API de busca está funcionando!');
});

// Inicia o servidor na porta desejada
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
