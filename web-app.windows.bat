@echo off
echo Running npm ci...
npm ci

echo Running npm start...
npm run serve-http

pause
