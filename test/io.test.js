const sinon = require('sinon');
const mockFs = require('mock-fs');
const path = require('path');
const expect = require('chai').expect;

const {getDirectoryListing, getFileContent} = require('../io');

const sandbox = sinon.createSandbox();
const localFolder = path.resolve('.');

describe('IO', () => {
  beforeEach(() => {
    mockFs({
      [localFolder]: {
        abcd: 'Test',
        test: {},
      },
    }, {
      createCwd: false,
      createTmp: false,
    });
  });

  afterEach(() => {
    sandbox.restore();
    mockFs.restore();
  });

  it('should get directory listing', async () => {
    const folders = await getDirectoryListing(localFolder, 'qwerty');
    expect(folders).to.be.ok;

    sinon.assert.match(folders[0], {isDir: false, fileName: 'abcd', filePath: 'qwerty/abcd'});
    sinon.assert.match(folders[1], {isDir: true, fileName: 'test', filePath: 'qwerty/test'});
  });

  it('should empty get directory listing', async () => {
    mockFs.restore();
    mockFs({});
    const folders = await getDirectoryListing(localFolder, 'qwerty');

    sinon.assert.match(folders, []);
  });

  it('should get the file content', async () => {
    const fileContent = await getFileContent(`${localFolder}/abcd`);

    sinon.assert.match(fileContent, 'Test');
  });
});
