'use strict';

const file = require('file');

// Our helper function
const scan = dir => {
    const arr = [];

    file.walkSync(dir, (dirPath, dirs, files) => {
        files.forEach(handle => {
            const base = dirPath.replace(dir, '');
            arr.push(`${base}/${handle}`);
        });
    });

    return arr;
};

module.exports = scan;
