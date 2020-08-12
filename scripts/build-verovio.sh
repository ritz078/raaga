#!/bin/bash

set -x

BASEDIR=$(dirname $0)
cd "${BASEDIR}/../node_modules/verovio/tools"
apt-get install build-essential cmake
cmake ../cmake
make
make install
cd ../../../
