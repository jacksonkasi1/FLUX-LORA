const path = require('path');

module.exports = {
  entry: './server/functions',
  target: 'node',
  mode: 'production',
  optimization: {
    minimize: false,
  },
  performance: {
    hints: false,
  },
  devtool: 'source-map',
  externals: [
    'aws-sdk',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-s3',
    '@aws-sdk/client-cognito-identity-provider',
    '@aws-sdk/lib-dynamodb'
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.lambda.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@server': path.resolve(__dirname, 'server'),
      '@server/config': path.resolve(__dirname, 'server/config'),
      '@server/lib': path.resolve(__dirname, 'server/lib'),
      '@server/types': path.resolve(__dirname, 'server/types'),
      '@server/utils': path.resolve(__dirname, 'server/utils'),
      '@server/services': path.resolve(__dirname, 'server/services'),
      // Keep client aliases for shared types
      '@': path.resolve(__dirname, 'src'),
      '@/types': path.resolve(__dirname, 'src/types'),
    },
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js',
  },
};
