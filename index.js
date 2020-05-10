const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const Fastify = require('fastify');
const util = require('util');

const {getDirectoryListingMarkup} = require('./mustache');
const {parseArguments} = require('./argumentParser');
const {getDirectoryListing, getFileContent} = require('./io');

const lstat = util.promisify(fs.lstat);
const exists = util.promisify(fs.exists);

const sendDirectoryListing = async (res, filePath, route, errorLog) => {
  try {
    const listing = await getDirectoryListing(filePath, route);
    const content = getDirectoryListingMarkup(listing, filePath);
    res.headers({'Content-Type': 'text/html'}).send(content);
  } catch (err) {
    errorLog(err);
    res.code(500).send();
  }
};

const sendFileContent = async (res, filePath, withMime, errorLog) => {
  try {
    const data = await getFileContent(filePath);
    const headers = {
      'Content-Type': withMime &&
        mime.contentType(path.extname(filePath)) ||
        'text/html',
    };

    res.headers(headers).send(data.toString());
  } catch (err) {
    errorLog(err);
    res.code(500).send();
  }
};

const runFastify = async (fastify, port, rootFolder, mime) => {
  try {
    await fastify.listen(port);
    fastify.log.info(`Serving ${rootFolder}`);
    fastify.log.info(`Using mime: ${mime}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const buildServer = (rootFolder, mime) => {
  const fastify = new Fastify({logger: true});
  fastify.get('*', async (req, res) => {
    const resource = req.params['*'];

    console.log(resource);
    if (resource.includes('..')) {
      res.code(401).send(`The file path cannot contain '..': ${resource}`);
      return;
    }

    const filePath = path.resolve(
        rootFolder,
        resource.replace(/^\//, ''),
    );

    const fileExists = await exists(filePath);
    if (!fileExists) {
      res.code(404)
          .send(`Could not find the following file or directory: ${resource}`);
      return;
    }

    if (!filePath.startsWith(rootFolder)) {
      res.code(401)
          .send(`Resolved path is outside of defined root folder: ${filePath}`);
      return;
    }

    const stat = await lstat(filePath);
    if (stat.isDirectory()) {
      await sendDirectoryListing(res, filePath, resource, fastify.log.error);
    } else {
      await sendFileContent(res, filePath, mime, fastify.log.error);
    }
  });
  return fastify;
};


if (require.main === module) {
  const {port, mime, folder} = parseArguments();
  const fastify = buildServer(folder, mime);
  runFastify(fastify, port, folder, mime);
}

module.exports = {buildServer};
