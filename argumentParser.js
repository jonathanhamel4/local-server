const Yargs = require('yargs');
const path = require('path');
const fs = require('fs');

let ROOT_FOLDER = '';
const argv = Yargs
    .usage('$0 --port [3000] --folder [./] --hostname [127.0.0.1]')
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
      'hostname': {
        alias: 'h',
        describe: 'Server hostname',
        type: 'string',
        default: '127.0.0.1',
      },
      'mime': {
        describe: 'Use mime-type instead of text/html [--no-mime]',
        type: 'boolean',
        default: true,
      },
    })
    .check((argv) => {
      ROOT_FOLDER = path.resolve(argv.folder);
      if (!fs.existsSync(ROOT_FOLDER)) {
        throw new Error(
            'The root folder does not exist. ' +
            `Path: ${ROOT_FOLDER}`,
        );
      }
      const stat = fs.lstatSync(ROOT_FOLDER);
      if (!stat.isDirectory()) {
        throw new Error(`The root must be a folder.Path: ${ROOT_FOLDER}`);
      }
      return true;
    })
    .argv;

module.exports = {argv, ROOT_FOLDER};
