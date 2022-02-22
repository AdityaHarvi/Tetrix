import { TetrominoType } from "common/TetrominoType";
import { BOARD_SIZE } from "common/shared";
import { PlayerPosition } from "common/message";

type Shape = {
    width: number;
    tiles: Array<[number, number]>;
};

export class Tetromino {
    static readonly shapes: {[key in TetrominoType]: Shape} = {
        [TetrominoType.I]: {width: 4, tiles: [[1, 0], [1, 1], [1, 2], [1, 3]]},
        [TetrominoType.J]: {width: 3, tiles: [[0, 0], [1, 0], [1, 1], [1, 2]]},
        [TetrominoType.L]: {width: 3, tiles: [[0, 2], [1, 0], [1, 1], [1, 2]]},
        [TetrominoType.O]: {width: 2, tiles: [[0, 0], [0, 1], [1, 0], [1, 1]]},
        [TetrominoType.S]: {width: 3, tiles: [[0, 1], [0, 2], [1, 0], [1, 1]]},
        [TetrominoType.T]: {width: 3, tiles: [[0, 1], [1, 0], [1, 1], [1, 2]]},
        [TetrominoType.Z]: {width: 3, tiles: [[0, 0], [0, 1], [1, 1], [1, 2]]}
    };

    type: TetrominoType;
    position: [number, number];
    rotation: 0 | 1 | 2 | 3;
    cells: Array<[number, number]>;

    constructor(type: TetrominoType) {
        this.type = type;
        this.cells = Tetromino.shapes[type].tiles;
        this.position = [0, Math.round((BOARD_SIZE - Tetromino.shapes[type].width) / 2)];
        this.rotation = 0; // default (no rotation)
    }

    reportPosition(): PlayerPosition {
        return {
            tetroPosition: this.position,
            rotation: this.rotation,
            tetroType: this.type,
        };
    }
}
