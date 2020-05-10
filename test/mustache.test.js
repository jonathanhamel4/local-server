const expect = require('chai').expect;

const {getDirectoryListingMarkup} = require('../mustache');


const getMarkupWithoutSpace = (listing, path) => {
  const markup = getDirectoryListingMarkup(listing, path);
  return markup.replace(/\s\s+|\n/g, '');
};

describe('Directory Template', () => {
  it('should see the folder as a header', () => {
    const markupNoSpace = getMarkupWithoutSpace(
        [{isDir: false, fileName: 'abcd', filePath: 'qwerty/abcd'}],
        'my/test/path',
    );
    expect(markupNoSpace).to.contain('<h3>Folder: my/test/path</h3>');
  });

  it('should show file with icon', () => {
    const markupNoSpace = getMarkupWithoutSpace(
        [{isDir: false, fileName: 'abcd', filePath: 'qwerty/abcd'}],
        'my/test/path',
    );
    expect(markupNoSpace).to.contain('<p>📄<a href="qwerty/abcd">abcd</a></p>');
  });

  it('should show folder with icon', () => {
    const markupNoSpace = getMarkupWithoutSpace(
        [{isDir: true, fileName: 'abcd', filePath: 'qwerty/abcd'}],
        'my/test/path',
    );
    expect(markupNoSpace).to.contain('<p>🗂️<a href="qwerty/abcd">abcd</a></p>');
  });

  it('should show both folder and file with icon', () => {
    const markupNoSpace = getMarkupWithoutSpace(
        [
          {isDir: false, fileName: 'abcd', filePath: 'qwerty/abcd'},
          {isDir: true, fileName: 'abcd', filePath: 'qwerty/abcd'},
        ], 'my/test/path',
    );
    expect(markupNoSpace).to.equal(
        '<!DOCTYPE html><html lang="en">' +
        '<head><meta charset="utf-8"></head><body>' +
        '<h3>Folder: my/test/path</h3>' +
        '<p>📄<a href="qwerty/abcd">abcd</a></p>' +
        '<p>🗂️<a href="qwerty/abcd">abcd</a></p>' +
        '</body></html>');
  });
});
