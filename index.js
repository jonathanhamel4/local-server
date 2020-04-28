const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const {getDirectoryListingMarkup} = require('./mustache');
const {argv, ROOT_FOLDER} = require('./argumentParser');

const messagesMap = {
  s404: (file) => `Could not find the following file or directory: ${file}`,
  relative: (file) => `The file path cannot contain '..': ${file}`,
};

const status = (res, status, message, overrides) => {
  res.writeHead(status, {'Content-Type': 'text/html', ...overrides});
  res.write(message);
  res.end();
};

const sendDirectoryListing = (res, filePath, route) => {
  const listing = [];
  fs.readdirSync(filePath).forEach((file) => {
    const stat = fs.lstatSync(path.resolve(filePath, file));
    listing.push({
      isDir: stat.isDirectory(),
      fileName: file,
      filePath: path.join(route, file),
    });
  });

  const content = getDirectoryListingMarkup(listing);
  return status(res, 200, content);
};

const sendFileContent = (res, filePath) => {
  const file = fs.readFileSync(filePath);
  const defaultMime = 'text/html';
  const mimeType = (mime.contentType(path.extname(filePath)) || defaultMime);
  return status(res, 200, file, {
    'Content-Type': argv.mime ? mimeType : defaultMime,
  });
};

const startServer = () => {
  const server = http.createServer((req, res) => {
    if (req.url.includes('..')) {
      return status(res, 401, messagesMap.relative(req.url));
    }

    const filePath = path.resolve(
        ROOT_FOLDER,
        req.url.replace(/^\//, ''),
    );

    if (!fs.existsSync(filePath)) {
      return status(res, 404, messagesMap.s404(req.url));
    }

    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      content = sendDirectoryListing(res, filePath, req.url);
    } else {
      return sendFileContent(res, filePath);
    }
  });

  server.listen(argv.port, argv.hostname, () => {
    console.log(`Server running at http://${argv.hostname}:${argv.port}/ for ${ROOT_FOLDER} using mime: ${argv.mime}`);
  });
};


if (require.main === module) {
  startServer();
}


