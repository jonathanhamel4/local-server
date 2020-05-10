const sinon = require('sinon');
// const mockFs = require('mock-fs');
const expect = require('chai').expect;
const path = require('path');

const {buildServer} = require('../index');

describe('e2e', () => {
  afterEach(() => {
    // mockFs.restore();
  });

  it('should return 200', async () => {
    const fastify = buildServer(path.resolve('./test/fixtures'), true);
    const response = await fastify.inject({
      method: 'get',
      url: '/',
    });
    expect(response.statusCode).to.equal(200);
    expect(sinon.match(
        response.payload,
        `<h3>Folder: ${path.resolve('./test/fixtures')}</h3>`,
    ));

    expect(sinon.match(
        response.payload,
        `<a href="/fake-folder1">fake-folder1</a>`,
    ));

    expect(sinon.match(
        response.payload,
        `<a href="/fake-file2">fake-file2</a>`,
    ));
  });

  it('should return file content', async () => {
    const fastify = buildServer(
        path.resolve('./test/fixtures'),
        true,
    );
    const response = await fastify.inject({
      method: 'get',
      url: '/fake-file1',
    });
    expect(response.statusCode).to.equal(200);
    expect(response.payload).to.equal('fake-file1');
  });

  it('should return 404 when file or folder is not found', async () => {
    const fastify = buildServer(
        path.resolve('./test/fixtures'),
        true,
    );
    const response = await fastify.inject({
      method: 'get',
      url: '/rwar',
    });
    expect(response.statusCode).to.equal(404);
  });
});
