#!/bin/bash

set -x

ROOT_DIR="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
cd "${ROOT_DIR}node_modules/verovio/tools" || exit
yum install cmake gcc gcc-c++ make || apt-get install build-essential
cmake ../cmake || rm "${ROOT_DIR}node_modules/verovio/tools/CMakeCache.txt" && cmake ../cmake
make
make install
rm -rf "${ROOT_DIR}public/bin"
npx recursive-copy-cli ./verovio "${ROOT_DIR}public/bin/verovio/verovio" -w
npx recursive-copy-cli '/usr/local/share/verovio/' "${ROOT_DIR}public/bin/verovio/" -w
cd "${ROOT_DIR}" || exit
