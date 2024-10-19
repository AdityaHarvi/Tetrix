<p align="center">
    <img width="578" alt="Tetrix" src="https://github.com/user-attachments/assets/3a9796e3-f823-4c4a-b294-1d60fcc8ef2b">
</p>

# Tetrix
Tetrix is a novel multiplayer take on the classic Tetris game in which block stacking is done by 4 players working in 4 different directions.
Like traditional Tetris, the goal is to complete and clear lines to avoid filling the board as the game speeds up.
Points are awarded on line clears and the game ends when a players stack reaches the end of their game board.
The twist is that you must now think multi-directionally, all while attacking or helping your peers, coordinating trades and enduring spectator voted effects.
The game is designed to be played both cooperatively and competetively. You can try for the highest team score by strategizing, trading and clearing together, or your can sabotage your enemies by blocking them off, stealing their lines and colliding with them directly.

## Gameplay Video
Please note that this video only captures one real player in the game. Tetrix supports up to 4 active players and many more can join to become "spectators" and vote on special events in the arena.

[![Tetrix Gamepaly Video](https://img.youtube.com/vi/zcKcfV9rwMs/0.jpg)](https://www.youtube.com/watch?v=zcKcfV9rwMs)

## Running Instructions
Ensure you have [NodeJS](https://nodejs.org/en/download/) and [npm](https://docs.npmjs.com/cli/v7/configuring-npm/install) installed before continuing.
- in the root directory, run `npm i`
- in `/server` run `npm run build` to build the server

### Starting the server
- Run `export PORT=3001` to let the server run on port 3001. Change this to another port (other than port 3000) if it is already taken.
- From the root directory, run `cd server && npm run dev`

### Starting the client
This will need to be done in a separate terminal.
- From the root directory, run `cd client && npm run dev`
- Navigate to `localhost:3000` to view the game on your browser. Use multiple browser tabs to simulate multiple clients.


## Environment Variables
| Component | Name | Type | Default | Function |
| --------- | ---- | ---- | ------- | -------- |
| Client | `VITE_BACKEND_URL` | String | `http://localhost:3001/` | URL of the Tetrix backend server (not to be confused with the client Vite server) |
| Client & Server | `VITE_DISABLE_WAITING_ROOM` | Boolean | `false` | Skips the game's initial player waiting room |
| Server | `PORT` | Integer | `80` | The port used by the server |


## Build
- `npm run build` in the monorepo root
    > `npm run build` is ran on heroku deployment which should work locally, too.
