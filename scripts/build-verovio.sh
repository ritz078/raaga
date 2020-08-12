#!/bin/bash

set -x

BASEDIR=$(dirname $0)
cd "${BASEDIR}/../node_modules/verovio/tools"
cmake ../cmake
make
sudo make install
cd ../../../
