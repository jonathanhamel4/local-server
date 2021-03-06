const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);
const readFile = util.promisify(fs.readFile);

const getDirectoryListing = async (filePath, route) => {
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
  return listing;
};

const getFileContent = async (filePath) => {
  const data = await readFile(filePath);
  return data.toString();
};

module.exports = {getDirectoryListing, getFileContent};
