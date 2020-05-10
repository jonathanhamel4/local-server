const Yargs = require('yargs');
const path = require('path');
const fs = require('fs');

const parseArguments = (content, failCb) => {
  const argv = new Yargs(content || process.argv)
      .usage('$0 --port [3000] --folder [./] [--mime]')
      .options({
        'port': {
          alias: 'p',
          describe: 'The server port',
          type: 'number',
          default: 3000,
        },
        'folder': {
          alias: 'f',
          describe: 'Root folder for the server',
          type: 'string',
          default: './',
        },
        'mime': {
          describe: 'Use mime-type instead of text/html [--no-mime]',
          type: 'boolean',
          default: true,
        },
      })
      .coerce('folder', (folder) => {
        const rootFolder = path.resolve(folder);
        if (!fs.existsSync(rootFolder)) {
          throw new Error(
              'The root folder does not exist. ' +
          `Path: ${rootFolder}`,
          );
        }
        const stat = fs.lstatSync(rootFolder);
        if (!stat.isDirectory()) {
          throw new Error(`The root must be a folder.Path: ${rootFolder}`);
        }
        return rootFolder;
      })
      .coerce('port', (port) => {
        if (isNaN(port)) throw new Error(`The port number must be a base-10 number. Passed: ${port}`);

        if (port <= 1024) throw new Error(`The port number must be greater than 1024. Pased: ${port}`);

        return port;
      });

  if (failCb && typeof failCb === 'function') {
    argv.fail(failCb);
  }

  return argv.parse();
};

module.exports = {parseArguments};
