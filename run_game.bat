@echo off
setlocal
set "MSYS2=C:\msys64"
set "BASH=%MSYS2%\usr\bin\bash.exe"

if not exist "%BASH%" (
    echo MSYS2 was not found at %MSYS2%.
    echo Install MSYS2 and then run this script again.
    exit /b 1
)

"%BASH%" -lc "cd '/c/Users/Mykch/Documents/Luckyproject/working' && /mingw64/bin/gcc -std=c11 -O2 runner_game.c -o runner_game.exe && ./runner_game.exe"
exit /b %ERRORLEVEL%
