#include <stdio.h>
#include <stdlib.h>

#ifdef _WIN32
#include <conio.h>
#include <windows.h>
#else
#include <fcntl.h>
#include <sys/select.h>
#include <termios.h>
#include <unistd.h>
#endif

static void clear_screen(void) {
#ifdef _WIN32
    system("cls");
#else
    printf("\033[2J\033[H");
    fflush(stdout);
#endif
}

static int key_pressed(void) {
#ifdef _WIN32
    return _kbhit();
#else
    struct timeval tv = {0, 0};
    fd_set readfds;
    FD_ZERO(&readfds);
    FD_SET(STDIN_FILENO, &readfds);
    return select(STDIN_FILENO + 1, &readfds, NULL, NULL, &tv) > 0;
#endif
}

static char read_key(void) {
#ifdef _WIN32
    return (char)_getch();
#else
    char ch = 0;
    read(STDIN_FILENO, &ch, 1);
    return ch;
#endif
}

static void set_raw_mode(int enabled) {
#ifndef _WIN32
    static struct termios original;
    static int initialized = 0;
    struct termios raw;

    if (enabled) {
        if (!initialized) {
            tcgetattr(STDIN_FILENO, &original);
            initialized = 1;
        }
        raw = original;
        raw.c_lflag &= ~(ICANON | ECHO);
        tcsetattr(STDIN_FILENO, TCSANOW, &raw);
    } else if (initialized) {
        tcsetattr(STDIN_FILENO, TCSANOW, &original);
    }
#endif
}

int main(void) {
    int score = 0;
    int player_y = 0;
    int jump_velocity = 0;
    int obstacle_x = 28;
    int running = 1;

    set_raw_mode(1);
    printf("Simple Runner\n");
    printf("Space/W to jump, Q to quit\n\n");

    while (running) {
        if (key_pressed()) {
            char ch = read_key();

            if (ch == 'q' || ch == 'Q') {
                running = 0;
                break;
            }

            if ((ch == ' ' || ch == 'w' || ch == 'W') && player_y == 0) {
                jump_velocity = 4;
            }
        }

        if (player_y > 0 || jump_velocity > 0) {
            player_y += jump_velocity;
            jump_velocity -= 1;

            if (player_y < 0) {
                player_y = 0;
                jump_velocity = 0;
            }
        }

        obstacle_x -= 1;
        if (obstacle_x < 0) {
            obstacle_x = 28;
            score++;
        }

        if (obstacle_x < 8 && obstacle_x > 4 && player_y < 3) {
            clear_screen();
            printf("Game Over! Final score: %d\n", score);
            printf("Press any key to exit...\n");
            set_raw_mode(0);
            if (key_pressed()) {
                read_key();
            }
            return 0;
        }

        clear_screen();
        printf("Score: %d\n\n", score);

        char screen[12][30];
        for (int r = 0; r < 12; ++r) {
            for (int c = 0; c < 30; ++c) {
                screen[r][c] = ' ';
            }
            screen[r][29] = '\0';
        }

        for (int c = 0; c < 30; ++c) {
            screen[10][c] = '=';
        }

        for (int x = obstacle_x; x < obstacle_x + 3 && x >= 0 && x < 30; ++x) {
            screen[9][x] = '#';
            screen[10][x] = '#';
        }

        int player_row = 10 - player_y;
        screen[player_row][6] = 'A';
        screen[player_row - 1][6] = 'A';

        for (int r = 0; r < 12; ++r) {
            puts(screen[r]);
        }

        printf("\nSpace/W = jump   Q = quit\n");

#ifdef _WIN32
        Sleep(80);
#else
        usleep(80000);
#endif
    }

    set_raw_mode(0);
    clear_screen();
    printf("Thanks for playing!\n");
    return 0;
}
