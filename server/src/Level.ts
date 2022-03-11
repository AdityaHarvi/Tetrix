import { ToServerEvents, ToClientEvents } from "common/messages/sceneGameArena";
import { broadcastFallRate } from "../index";
import { Socket } from "socket.io";

type SocketLevel = Socket<ToServerEvents, ToClientEvents>;

export class Level {
    private _currentLevel: number;
    private currentFallRate: number;

    constructor() {
        this._currentLevel = 1;
        this.currentFallRate = 1000;
    }

    get currentLevel(): number {
        return this._currentLevel;
    }

    /**
     * Setup listeners for the current client socket.
     * @param socket The client's socket.
     */
    public initSocketListeners(socket: SocketLevel) {
        socket.on("requestFallRate", () => {
            socket.emit("updateFallRate", this.currentFallRate);
        });
    }

    /**
     * Check if its possible to update the game's level based off the given score. Max level is 15.
     * @param score The total score the players have accumulated.
     * @returns Whether the level was incremented.
     */
    public checkUpdateLevel(score: number) {
        if (score >= this._currentLevel * 20 && this._currentLevel < 15) {
            this._currentLevel++;
            this.updateFallRate();
            return true;
        }
        return false;
    }

    /**
     * Increase the fall rate due to spectator voting.
     */
    public spectatorIncreaseFallRate() {
        this.increaseFallRate();
        setTimeout(() => {
            this.updateFallRate();
        }, 20000);
    }

    /**
     * Decrease the fall rate due to spectator voting.
     */
    public spectatorDecreaseFallRate() {
        this.decreaseFallRate();
        setTimeout(() => {
            this.updateFallRate();
        }, 20000);
    }

    /**
     * Update the fall rate according to the current level.
     */
    private updateFallRate() {
        this.currentFallRate =
            1000 *
            (0.8 * ((this._currentLevel - 1) * 0.007)) **
                (this._currentLevel - 1);
        broadcastFallRate(this.currentFallRate);
    }

    /**
     * Increase the fall rate to be the next-level's equivalent.
     */
    private increaseFallRate() {
        this.currentFallRate =
            1000 * (0.8 * (this._currentLevel * 0.007)) ** this._currentLevel;
        broadcastFallRate(this.currentFallRate);
    }

    /**
     * Decrease the fall rate to be the previous level's equivalent.
     */
    private decreaseFallRate() {
        this.currentFallRate =
            1000 *
            (0.8 * ((this._currentLevel - 2) * 0.007)) **
                (this._currentLevel - 2);
        broadcastFallRate(this.currentFallRate);
    }

    /**
     * Reset the values of the fallrate & level. Used upon restarting the game.
     */
    public resetLevel() {
        this.currentFallRate = 1000;
        this._currentLevel = 1;
    }

    /**
     * Notify the client of the current fallrate.
     * @param socket The client requesting data.
     */
    public getFallRate(socket: SocketLevel) {
        socket.emit("updateFallRate", this.currentFallRate);
    }
}
