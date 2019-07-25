#!/bin/bash
build_dir="build"

files=("dist"
       "lib"
       "node_modules"
       "package.json"
)

./version.sh

if [ ! -d "$build_dir" ]; then
    mkdir $build_dir
fi

for file in "${files[@]}"
do
    cp -r "$file" "$build_dir"
done
