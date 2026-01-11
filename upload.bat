@echo off
git add .
git commit -m "Auto update: %date% %time%"
git pull --rebase origin main
git push