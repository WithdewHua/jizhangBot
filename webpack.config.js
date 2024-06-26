const path = require('path');

module.exports = {
    entry: './app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'myzf.js',
    },
    target: 'node',
    optimization: {
        minimize: false
    }
};