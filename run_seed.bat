@echo off
cd /d d:\Project\xenang\server
npx prisma db push
node prisma/seed.js
pause