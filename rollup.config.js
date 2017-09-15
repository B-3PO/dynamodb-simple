import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import cleanup from 'rollup-plugin-cleanup';
import uglify from 'rollup-plugin-uglify';


export default {
  input: 'lib/index.js',
  output: {
    name: 'dynamodbSimple',
    file: 'dist/dynamodb-simple.min.js',
    format: 'iife'
  },
  sourcemap: true,
  // sourceMap: 'inline',
  plugins: [
    nodeResolve(),
    buble(),
    cleanup(),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
};
