import {MysqlUtil} from './mysql-util';
const gameStatusTable = 'main.tic_tac_toe_game_status';

export class TicTacToeDal {
    mysqlUtil;

    constructor() {
        this.mysqlUtil = new MysqlUtil();
    }

    async initDB(): Promise<void> {
        try {
            await this.mysqlUtil.initConnection();
        } catch (e) {
            throw e;
        }
    }

    async saveGameId(id: string): Promise<void | any> {
        try {
            const query = `insert into ${gameStatusTable} (id) value ('${id}')`;
            await this.mysqlUtil.executeQuery(query);
        } catch (e) {
            console.log(`failed creating game with error: ${e}`);
            await this.mysqlUtil.releaseConnection();
            throw e;
        }
    }

    async getGameStatus(id): Promise<string | any> {
        try {
            const query = `select status from ${gameStatusTable} where id = '${id}'`;
            const res = await this.mysqlUtil.executeQuery(query);
            return res[0] ? res[0].status : null;
        } catch (e) {
            console.log(`failed getting game ${id} status with error: ${e}`);
            await this.mysqlUtil.releaseConnection();
            throw e;
        }
    }

    async getStatusesNames(byId = true) {
        try {
            const query = `select * from main.tic_tac_toe_statuses`;
            const res = await this.mysqlUtil.executeQuery(query);
            return res.reduce((acc, curr) => {
                byId ? (acc[curr.id] = curr['status_display_name']) : (acc[curr.name] = curr.id);
                return acc;
            }, {});
        } catch (e) {
            console.log(`failed getting statuses from DB. error: ${e}`);
            throw e;
        }
    }

    async getGamePlayers(gameId) {
        try {
            const query = `select * from main.tic_tac_toe_game_players where game_id = '${gameId}'`;
            const res = await this.mysqlUtil.executeQuery(query);
            return res;
        } catch (e) {
            console.log(`failed getting game players, error: ${e}`);
            throw e;
        }
    }

    async getPlayersIds() {
        try {
            const query = `select * from main.tic_tac_toe_players;`;
            const res = await this.mysqlUtil.executeQuery(query);
            return res.reduce((acc, curr) => {
                acc[curr['player_display_name']] = curr.id;
                return acc;
            }, {});
        } catch (e) {
            console.log(`failed getting players configuration, error: ${e}`);
            throw e;
        }
    }

    async addPlayer(gameId: string, playerId: number): Promise<any> {
        try {
            const query = `insert into main.tic_tac_toe_game_players (game_id, player) values ('${gameId}', ${playerId})`;
            await this.mysqlUtil.executeQuery(query);
        } catch (e) {
            console.log(`failed joining player to game: ${gameId}, error: ${e}`);
            throw e;
        }
    }

    async getGameBoard(gameId): Promise<any> {
        try {
            const query = `select * from main.tic_tac_toe_game_board where game_id = '${gameId}'`;
            const res = await this.mysqlUtil.executeQuery(query);
            if (res.length) {
                const data = {...res[0]};
                delete data['game_id'];
                return Object.keys(data).reduce(
                    (acc, curr) => {
                        data[curr] ? acc[data[curr]].push(curr) : null;
                        return acc;
                    },
                    {1: [], 2: []}
                );
            } else {
                return null;
            }
        } catch (e) {
            console.log(`failed getting game board, error: ${e}`);
            throw e;
        }
    }

    async createGameBoard(gameId): Promise<any> {
        try {
            const query = `insert into main.tic_tac_toe_game_board (game_id) values ('${gameId}')`;
            return await this.mysqlUtil.executeQuery(query);
        } catch (e) {
            console.log(`failed creating game board, error: ${e}`);
            throw e;
        }
    }

    async isBoardCoordinateChecked(gameId: string, x: number, y: number): Promise<boolean> {
        try {
            const columnName = `b_${x}${y}`;
            const query = `select ${columnName} from main.tic_tac_toe_game_board where game_id = '${gameId}'`;
            const res = await this.mysqlUtil.executeQuery(query);
            return !!res[0][columnName];
        } catch (e) {
            console.log(`failed getting board data from db, error: ${e}`);
            throw e;
        }
    }

    async checkBoardCoordinate(gameId: string, x: number, y: number, playerId: number): Promise<any> {
        try {
            const columnName = `b_${x}${y}`;
            const query = `update main.tic_tac_toe_game_board set ${columnName} = ${playerId} where game_id = '${gameId}'`;
            await this.mysqlUtil.executeQuery(query);
        } catch (e) {
            console.log(`failed updating board data, error: ${e}`);
            throw e;
        }
    }

    async updateGameStatus(gameId, status) {
        try {
            const query = `update main.tic_tac_toe_game_status set status = ${status} where id = '${gameId}'`;
            await this.mysqlUtil.executeQuery(query);
        } catch (e) {
            console.log(`failed updating game status, error: ${e}`);
            throw e;
        }
    }
}
