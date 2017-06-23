#!/usr/bin/env bash

if [[ $RUN_RECIPES = "1" ]]; then
  yarn run gulp-example;
else
  npm run build &&
  if [[ $(node -v) =~ ^v([7-9]|\d\d+).* ]]; then
    ./node_modules/.bin/mocha --require test/setup/common.js
  fi
fi

