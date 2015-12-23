#!/bin/bash

set -e

# Start in website/ even if run from root directory
cd "$(dirname "$0")"

# 1. build static website with *.md files
cd website
node server/generate.js
# 2. cleanup root directory
cd ../../
rm -rf `ls | egrep -v engine`
# 3. copy building result to root
cd engine
cp -R website/build/flux/* ../
# 4. cleanup building cache
rm -Rf website/build/
# 5. push to github
cd ../
git add --all
git commit -m "update website"
git push origin master