const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const escpos = require('escpos');

// Configuração do escpos para usar USB
escpos.USB = require('escpos-usb');

let device, printer;
try {
    device = new escpos.USB();
    printer = new escpos.Printer(device);
} catch (error) {
    console.error('Erro ao inicializar a impressora:', error.message);
}

const app = express();
const port = 3000;

// Configuração do multer para o upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Middleware para servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

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

// Função para enviar os resultados para a etiquetadora
function printLabels(results) {
    if (!printer) {
        console.warn('Impressora não está disponível. Resultados não foram impressos.');
        return;
    }

    const zplCommands = results.map(result => `^XA^FO50,50^A0N,50,50^FD${result}^FS^XZ`).join('\n');
    device.open(() => {
        printer
            .raw(zplCommands)  // Envia os comandos ZPL para a impressora
            .cut()
            .close();
    });
}

// Rota para buscar valor no Excel
app.post('/lookup', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const searchValue = req.body.search_value.trim();
    const searchColumn = req.body.search_column.trim();
    const returnColumn = req.body.return_column.trim();

    const results = performLookup(filePath, searchValue, searchColumn, returnColumn);

    // Imprime os resultados
    printLabels(results);

    res.json({ results });
});

// Servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
