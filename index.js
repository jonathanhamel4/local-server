const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const fastify = require('fastify')({logger: true});
const util = require('util');

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);
const readFile = util.promisify(fs.readFile);

const {getDirectoryListingMarkup} = require('./mustache');
const {argv, ROOT_FOLDER} = require('./argumentParser');

const sendDirectoryListing = async (res, filePath, route) => {
  try {
    const listing = [];
    const files = await readdir(filePath);

    for (const file of files) {
      const stat = await lstat(path.resolve(filePath, file));
      listing.push({
        isDir: stat.isDirectory(),
        fileName: file,
        filePath: path.join(route, file),
      });
    }

    const content = getDirectoryListingMarkup(listing, filePath);
    res.headers({'Content-Type': 'text/html'}).send(content);
  } catch (err) {
    fastify.log.error(err);
    res.code(500).send();
  }
};

const sendFileContent = async (res, filePath, withMime) => {
  try {
    const data = await readFile(filePath);
    const headers = {
      'Content-Type': withMime &&
        mime.contentType(path.extname(filePath)) ||
        'text/html',
    };

    res.headers(headers).send(data.toString());
  } catch (err) {
    fastify.log.error(err);
    res.code(500).send();
  }
};

const startServer = async () => {
  fastify.get('*', async (req, res) => {
    const resource = req.params['*'];

    if (resource.includes('..')) {
      res.code(401).send(`The file path cannot contain '..': ${resource}`);
      return;
    }

    const filePath = path.resolve(
        ROOT_FOLDER,
        resource.replace(/^\//, ''),
    );

    if (!fs.existsSync(filePath)) {
      res.code(404)
          .send(`Could not find the following file or directory: ${resource}`);
      return;
    }

    if (!filePath.startsWith(ROOT_FOLDER)) {
      res.code(401)
          .send(`Resolved path is outside of defined root folder: ${filePath}`);
      return;
    }

    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      await sendDirectoryListing(res, filePath, resource);
    } else {
      await sendFileContent(res, filePath, argv.mime);
    }
  });

  try {
    await fastify.listen(argv.port);
    fastify.log.info(`Serving ${ROOT_FOLDER}`);
    fastify.log.info(`Using mime: ${argv.mime}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};


if (require.main === module) {
  startServer();
}


