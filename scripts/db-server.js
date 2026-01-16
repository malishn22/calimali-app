const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, '..', 'db_exports');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/upload-db') {
    const filename = `calimali_export.db`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    req.on('end', () => {
      console.log(`Database saved to ${filePath}`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Database uploaded successfully');
    });

    req.on('error', (err) => {
      console.error('Error uploading database:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error uploading database');
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`DB Receiver Server running on http://localhost:${PORT}`);
  console.log(`Make sure your device is on the same network.`);
});
