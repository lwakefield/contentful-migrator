var path = require('path')
var webpack = require('webpack')

module.exports = {
    entry: ['babel-polyfill', './src/cli.js'],
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'cli.js',
        library: 'Migrator',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {test: /\.js$/, loader: 'babel-loader'}
        ]
    },
    resolve: {
        alias: {
            'contentful-management$': path.resolve(
                __dirname,
                'node_modules/contentful-management/dist/contentful-management.js'
            )
        }
    },
    devtool: 'cheap-module-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '\'build\''
            }
        })
    ]
}
