#! /bin/sh

dirs='constants lib src types'
files='bookshelf.js config.js knexfile.js'

for dir in $dirs; do
  NODE_ENV=production node_modules/.bin/babel --presets=babili $dir -d dist/$dir/
done

for file in $files; do
  NODE_ENV=production node_modules/.bin/babel --presets=babili $file -o dist/$file
done

cp ./webpack.config.js ./dist/
