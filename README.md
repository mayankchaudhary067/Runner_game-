# Simple Runner Game

A tiny terminal runner game.

## Windows run setup

This project needs the MSYS2 GCC toolchain. The batch file uses the actual MSYS2 bash environment so the compiler is found correctly.

Run:

```bat
run_game.bat
```

## Manual build

```bash
cd "/c/Users/Mykch/Documents/Luckyproject/working"
/mingw64/bin/gcc -std=c11 -O2 runner_game.c -o runner_game.exe
./runner_game.exe
```

## Controls

- Space or W: jump
- Q: quit

This version is intentionally simple and reliable.
