#!/bin/bash

echo "========================================="
echo "Starting Render Build Process"
echo "========================================="

echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "Cleaning old builds..."
rm -rf dist
rm -rf node_modules/.vite

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Build complete. Checking dist folder..."
ls -la dist/

echo "Checking dist/index.html content:"
cat dist/index.html | head -20

echo "========================================="
echo "Build process finished"
echo "========================================="
