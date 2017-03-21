#!/usr/bin/env bash

if [[ $RUN_RECIPES = "1" ]]; then
  yarn run gulp-example;
else
  npm run build &&
  if [[ $(node -v) =~ ^v7.* ]]; then
    ./node_modules/.bin/mocha --require test/setup/common.js
  fi
fi

