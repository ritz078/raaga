#!/bin/bash

set -x

ROOT_DIR="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
cd "${ROOT_DIR}node_modules/verovio/tools"
yum install cmake gcc gcc-c++ make
cmake ../cmake
make
make install
echo
rm -rf "${ROOT_DIR}public/bin"
npx recursive-copy-cli ./verovio "${ROOT_DIR}public/bin/verovio/verovio" -w
npx recursive-copy-cli '/usr/local/share/verovio/' "${ROOT_DIR}public/bin/verovio/resources/" -w
cd ../../../
