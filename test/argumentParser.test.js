const path = require('path');
const expect = require('chai').expect;
const sinon = require('sinon');

const mockFs = require('mock-fs');

const {parseArguments} = require('../argumentParser');

const sandbox = sinon.createSandbox();

describe('Argument Parser', () => {
  beforeEach(() => {
    const localFolder = path.resolve('.');
    mockFs({
      [localFolder]: {
        abcd: 'Test',
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

  it('should validate mime', () => {
    const {mime} = parseArguments(`--mime`);
    expect(mime).to.be.ok;
  });

  it('should validate mime using negative', () => {
    const {mime} = parseArguments(`--no-mime`);
    expect(mime).to.be.false;
  });

  it('should validate folder existing', () => {
    const {folder} = parseArguments(`--folder .`);

    expect(folder).to.equal(path.resolve('.'));
  });

  it('should validate folder if not existing', () => {
    const failCb = sandbox.spy();
    const folder = path.resolve(`./non-existing.abcd`);

    parseArguments(`--folder ./non-existing.abcd`, failCb);

    expect(failCb.calledWith(sandbox.match('The root folder does not exist'))).to.be.ok;
    expect(failCb.calledWith(sandbox.match(folder))).to.be.ok;
  });

  it('should refuse folder if folder is a file', () => {
    const failCb = sandbox.spy();
    const folder = path.resolve(`./abcd`);

    parseArguments(`--folder ${folder}`, failCb);

    expect(failCb.calledWith(sandbox.match('The root must be a folder'))).to.be.ok;
    expect(failCb.calledWith(sandbox.match(folder))).to.be.ok;
  });

  it('should refuse port if port if not a number', () => {
    const failCb = sandbox.spy();
    parseArguments(`--port abcde`, failCb);

    expect(failCb.calledWith(sandbox.match('The port number must be a base-10 number'))).to.be.ok;
  });

  it('should accept port if port is a number', () => {
    const {port} = parseArguments(`--port 1234`);

    expect(port).to.equal(1234);
  });

  it('should refuse port if port is lower than 1024', () => {
    const failCb = sandbox.spy();
    parseArguments(`--port 1023`, failCb);

    expect(failCb.calledWith(sandbox.match('The port number must be greater than 1024'))).to.be.ok;
  });

  it('should set default port if port is not provided', () => {
    const failCb = sandbox.spy();
    const {port} = parseArguments('', failCb);

    expect(port).to.equal(3000);
  });

  it('should set default folder if folder is not provided', () => {
    const failCb = sandbox.spy();
    const {folder} = parseArguments('', failCb);

    expect(folder).to.equal(path.resolve('./'));
  });

  it('should set default mime if mime is not provided', () => {
    const failCb = sandbox.spy();
    const {mime} = parseArguments('', failCb);

    expect(mime).to.be.ok;
  });
});
