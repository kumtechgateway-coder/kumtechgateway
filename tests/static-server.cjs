const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
    ['.html', 'text/html; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.xml', 'application/xml; charset=utf-8'],
    ['.svg', 'image/svg+xml'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.webp', 'image/webp'],
    ['.gif', 'image/gif'],
    ['.ico', 'image/x-icon'],
    ['.mp3', 'audio/mpeg'],
    ['.woff', 'font/woff'],
    ['.woff2', 'font/woff2'],
    ['.txt', 'text/plain; charset=utf-8']
]);

function resolvePath(urlPathname) {
    const cleanPath = decodeURIComponent(urlPathname.split('?')[0]);
    const relativePath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');

    const directPath = path.join(root, relativePath);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
        return directPath;
    }

    const indexPath = path.join(root, relativePath, 'index.html');
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
        return indexPath;
    }

    return null;
}

const server = http.createServer((request, response) => {
    const filePath = resolvePath(request.url || '/');

    if (!filePath) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = contentTypes.get(extension) || 'application/octet-stream';

    response.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
    process.stdout.write(`Static server listening at http://${host}:${port}\n`);
});

function shutdown() {
    server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
