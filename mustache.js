const Mustache = require('mustache');

const directoryTemplate = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <h3>Folder: {{folder}}</h3>
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


const getDirectoryListingMarkup = (files, folder) => {
  return Mustache.render(directoryTemplate, {files, folder});
};

module.exports = {getDirectoryListingMarkup};
