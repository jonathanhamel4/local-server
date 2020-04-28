const Mustache = require('mustache');

const directoryTemplate = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        {{#files}}
        <p>
            {{#isDir}}
            🗂️
            {{/isDir}}
            {{^isDir}}
            📄
            {{/isDir}}
            <a href="{{filePath}}">{{fileName}}</a>
        </p>
        {{/files}}
    </body>
</html>
`;


const getDirectoryListingMarkup = (files) => {
  return Mustache.render(directoryTemplate, {files});
};

module.exports = {getDirectoryListingMarkup};
