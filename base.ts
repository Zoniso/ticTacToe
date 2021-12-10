const uuidv4 = require('uuid/v4');
import {TicTacToeValidator} from './validator';

export class TicTacToeBase {
    ticTacToeDAL;
    ticTacToeValidator;
    gameEndedStatuses: number[] = [2, 3, 4];

    constructor(req) {
        this.ticTacToeDAL = req.dal;
        this.ticTacToeValidator = new TicTacToeValidator(req);
    }

    async createGame(): Promise<string> {
        const gameId: string = uuidv4();
        try {
            await this.ticTacToeDAL.saveGameId(gameId);
            return gameId;
        } catch (e) {
            console.log(`failed creating game with error: ${e}`);
            throw e;
        }
    }

    async getGameStatus(gameId): Promise<string | {errorCode: number; errorMessage: string}> {
        try {
            await this.ticTacToeValidator.validateGetStatusData(gameId);
            const status = await this.ticTacToeDAL.getGameStatus(gameId);
            return await this.getStatusName(status);
        } catch (e) {
            console.log(`failed getting game ${gameId} status`);
            throw e;
        }
    }

    async addPlayerToGame(gameId): Promise<string | {errorCode: number; errorMessage: string}> {
        try {
            await this.ticTacToeValidator.addPlayerToGameValidation(gameId);
            const existingPlayers = await this.ticTacToeDAL.getGamePlayers(gameId);
            const playerName = existingPlayers.length ? 'o' : 'x'; // first player is x, second is o
            const playersNamesToIds = await this.ticTacToeDAL.getPlayersIds();
            await this.ticTacToeDAL.addPlayer(gameId, playersNamesToIds[playerName]);
            return playerName;
        } catch (e) {
            console.log(`failed adding player to game with error: ${e}`);
            throw e;
        }
    }

    async makeAMove(gameId: string, player: string, x: number, y: number): Promise<string | {errorCode: number; errorMessage: string}> {
        try {
            //convert player to id - can be moved to formatter
            const playerId = (await this.ticTacToeDAL.getPlayersIds())[player];
            await this.ticTacToeValidator.makeAMoveValidation(gameId, playerId, x, y);
            if (!(await this.ticTacToeDAL.getGameBoard(gameId))) {
                // can be optimized
                await this.ticTacToeDAL.createGameBoard(gameId);
            }
            //if game already ended
            const gameStatus = await this.ticTacToeDAL.getGameStatus(gameId);
            if (this.gameEndedStatuses.includes(gameStatus)) {
                //can be moved to validator
                return {errorCode: 400, errorMessage: `Game has already ended`};
            }
            if (await this.ticTacToeDAL.isBoardCoordinateChecked(gameId, x, y)) {
                //can be moved to validator
                return {errorCode: 400, errorMessage: 'Coordinate is already occupied'};
            }
            await this.ticTacToeDAL.checkBoardCoordinate(gameId, x, y, playerId);
            const status = await this.calculateGameStatus(gameId);
            await this.ticTacToeDAL.updateGameStatus(gameId, status);
            // return await this.getStatusName(status);
        } catch (e) {
            console.log(`failed to make a move, error: ${e}`);
            throw e;
        }
    }

    async calculateGameStatus(gameId: string): Promise<number> {
        try {
            const statusesNameToId = await this.ticTacToeDAL.getStatusesNames(false);
            const numOfPossibleMoves = 9;
            const gameBoardData = await this.ticTacToeDAL.getGameBoard(gameId);
            const xPlayerWon = this.isPlayerWon(gameBoardData['1']);
            const oPlayerWon = xPlayerWon ? false : this.isPlayerWon(gameBoardData['2']);
            const numOfPlayedMoves = gameBoardData['1'].length + gameBoardData['2'].length;
            let status;
            if (xPlayerWon) {
                status = statusesNameToId['X_WINNER'];
            } else if (oPlayerWon) {
                status = statusesNameToId['O_WINNER'];
            } else if (numOfPlayedMoves < numOfPossibleMoves) {
                status = statusesNameToId['PLAYING'];
            } else {
                status = statusesNameToId['TIE'];
            }
            return status;
        } catch (e) {
            console.log(`failed calculating game status, error: ${e}`);
            throw e;
        }
    }

    isPlayerWon(playerMovesData) {
        const winOptions = [
            ['b_11', 'b_12', 'b_13'],
            ['b_21', 'b_22', 'b_23'],
            ['b_31', 'b_32', 'b_33'],
            ['b_11', 'b_21', 'b_31'],
            ['b_12', 'b_22', 'b_32'],
            ['b_13', 'b_23', 'b_33'],
            ['b_11', 'b_22', 'b_33'],
            ['b_13', 'b_22', 'b_31']
        ];
        const res = winOptions.find((opt) => {
            return opt.every((e) => {
                return playerMovesData.includes(e);
            });
        });
        return !!res;
    }

    async getStatusName(statusId: number): Promise<string> {
        try {
            const statuses = await this.ticTacToeDAL.getStatusesNames();
            return statuses[statusId];
        } catch (e) {
            throw e;
        }
    }
}
