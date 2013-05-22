#!/bin/sh

rm js/sketch.min.js
rm js/sketch.min.js.gz

uglifyjs js/sketch.js -cmo js/sketch.min.js
gzip js/sketch.min.js -c > js/sketch.min.js.gz