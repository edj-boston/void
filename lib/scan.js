// External dependancies
var file = require('file');

// Our helper function
var scan = function( dir ) {

    var path = process.cwd() + dir;
    var arr = [];

    file.walkSync(dir, function(dirPath, dirs, files) {
        files.forEach(function(file) {
            arr.push(dirPath.replace(dir, '') + '/' + file);
        });
    });

    return arr;
}

module.exports = scan;