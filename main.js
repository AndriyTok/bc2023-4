const http = require('http');
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const server = http.createServer((req, res) => {
  try {
    const xmlData = fs.readFileSync('data.xml', 'utf8');

    if (!xmlData) {
      throw new Error('XML файл порожній або не знайдений.');
    }

    const options = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
    };

    const xmlParser = new XMLParser(options);
    const obj = xmlParser.parse(xmlData, options);

    if (obj && obj.indicators && Array.isArray(obj.indicators.basindbank)) {
      const data = obj.indicators.basindbank;
      const filteredData = data
        .filter((item) => item.parent === 'BS3_BanksLiab')
        .map((item) => ({
          txt: item.txten,
          value: item.value,
        }));

      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.write('<data>\n');

      filteredData.forEach((item) => {
        res.write('  <indicators>\n');
        res.write('    <txt>' + item.txt + '</txt>\n');
        res.write('    <value>' + item.value + '</value>\n');
        res.write('  </indicators>\n');
      });

      res.write('</data>');
      res.end();
    }
  } catch (error) {
    console.error('Помилка:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Помилка: ' + error.message);
  }
});

const port = 8000;

server.listen(port, () => {
  console.log(`Сервер запущено на localhost:${port}`);
});
