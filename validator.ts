import {throws} from 'assert';

const isvalid = require('isvalid');

class ValidationError extends Error {
    status: number;

    constructor(message, errorCode = 400) {
        super(message);
        this.name = this.constructor.name;
        this.status = errorCode;
    }
}

export class TicTacToeValidator {
    ticTacToeDAL;

    constructor(req) {
        this.ticTacToeDAL = req.dal;
    }

    async validateGetStatusData(gameId: string): Promise<any>{
        try {
            const gameExist = await this.ticTacToeDAL.getGameStatus(gameId);
            if (!!!gameExist) {
                throw new ValidationError(`game ${gameId} does not exist`);
            }
        } catch (e) {
            throw e;
        }
    }

    async addPlayerToGameValidation(gameId: string): Promise<any> {
        try {
            const existingPlayers = await this.ticTacToeDAL.getGamePlayers(gameId);
            if (existingPlayers.length === 2) {
                throw new ValidationError(`no option to add more players`);
            }
        } catch (e) {
            throw e;
        }
    }

    async makeAMoveValidation(gameId: string, playerId: number, x: number, y: number): Promise<any>{
        try {
            //this can be split into separated validations
            const requiredNumOfPlayers = 2;
            const existingPlayers = await this.ticTacToeDAL.getGamePlayers(gameId);
            // validate 2 players had joined
            if (existingPlayers.length < requiredNumOfPlayers) {
                throw new ValidationError(`game has less than ${requiredNumOfPlayers} players`);
            }
            // validate it's player's turn
            const boardData = await this.ticTacToeDAL.getGameBoard(gameId);
            const numOfMovedForPlayerX = boardData ? boardData['1'].length : 0;
            const numOfMovedForPlayerO = boardData ? boardData['2'].length : 0;
            if (numOfMovedForPlayerX === 0 && numOfMovedForPlayerO === 0 && playerId !== 1) {
                throw new ValidationError(`first move can be done by player x only`);
            }
            if (numOfMovedForPlayerX === numOfMovedForPlayerO && playerId !== 1) {
                throw new ValidationError(`player x turn`);
            }
            if (numOfMovedForPlayerX > numOfMovedForPlayerO && playerId === 1) {
                throw new ValidationError(`player o turn`);
            }
        } catch (e) {
            throw e;
        }
        try {
            await this.isValidCoordinates({x, y});
        } catch (e) {
            throw new ValidationError(`invalid coordinates - ${e.message}`);
        }
    }

    async isValidCoordinates(coordinates): Promise<any> {
        return new Promise((resolve, reject) => {
            const validationType = {type: Number, required: true, range: '1-3'};
            isvalid(
                coordinates,
                {
                    x: validationType,
                    y: validationType
                },
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }
}
