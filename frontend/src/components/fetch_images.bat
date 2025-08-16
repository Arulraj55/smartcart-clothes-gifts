@echo off
echo.
echo ========================================
echo  SmartCart Image Fetcher
echo ========================================
echo.
echo This will fetch 1500 real images from Pixabay:
echo - 1000 clothing images
echo - 500 gift images
echo.
echo Make sure you have your Pixabay API key ready!
echo You can get one free at: https://pixabay.com/api/docs/
echo.
pause
echo.
node run_image_fetch.js
echo.
pause
