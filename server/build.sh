#!/bin/bash

rm -rf ./dist/

GOOS=linux GOARCH=amd64 go build -o ./dist/bootstrap ./cmd/lambda/main.go

zip -j ./dist/lambda-package.zip ./dist/bootstrap
