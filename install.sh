#!/bin/bash

echo "Installing bower packages"
bower install

echo "Installing typings"
node ./node_modules/typings/dist/bin.js install
