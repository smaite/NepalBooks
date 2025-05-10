const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/functions/updates.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'functions.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}; 