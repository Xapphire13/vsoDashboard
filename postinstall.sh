#!/bin/bash

echo "Compiling TypeScript files"
node ./node_modules/typescript/bin/tsc -p shared
node ./node_modules/typescript/bin/tsc -p client
node ./node_modules/typescript/bin/tsc -p server
