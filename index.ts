import {Router, Request, Response} from 'express';
import {TicTacToeBase} from './base';
import {TicTacToeDal} from './dal';
const router = Router();

const beforeEachAction = async function (req, res, next): Promise<void> {
    try {
        req.dal = new TicTacToeDal();
        req.base = new TicTacToeBase(req);
        await req.dal.initDB();
        next();
    } catch (e) {
        console.log(`Failed initiating tic tac toe service with error: ${e}`);
        throw e;
    }
};

router.use(beforeEachAction);

router.get('/status/:id', async (req: Request & any, res: Response) => {
    try {
        const id = req.params.id;
        const status = await req.base.getGameStatus(id);
        if (typeof status === 'string') {
            res.status(200);
            res.send({status});
        } else {
            res.status(status.errorCode);
            res.send(status);
        }
    } catch (e) {
        res.status(e.status ? e.status : 500);
        res.send(e.message ? {...e, message: e.message} : e);
    }
});

//create game
router.post('/', async (req: Request & any, res: Response) => {
    try {
        const gameId = await req.base.createGame();
        res.status(200);
        res.send({id: gameId});
    } catch (e) {
        res.status(e.status ? e.status : 500);
        res.send(e);
    }
});

router.post('/join/:gameId', async (req: Request & any, res: Response) => {
    try {
        const playerName = await req.base.addPlayerToGame(req.params.gameId);
        if (playerName.hasOwnProperty('errorMessage')) {
            //this if else can be removed after moving this check to validator
            res.status(playerName.errorCode);
            res.send({errorMessage: playerName.errorMessage, errorCode: playerName.errorCode});
        } else {
            res.status(200);
            res.send({player: playerName});
        }
    } catch (e) {
        res.status(e.status ? e.status : 500);
        res.send(e.message ? {...e, message: e.message} : e);
    }
});

router.put('/makeAMove/:gameId/:player', async (req: Request & any, res: Response) => {
    try {
        const moveRes = await req.base.makeAMove(req.params.gameId, req.params.player, req.body.x, req.body.y);
        if (typeof moveRes === 'object') {
            res.status(moveRes.errorCode);
            res.send({errorMessage: moveRes.errorMessage, errorCode: moveRes.errorCode});
        } else {
            res.status(200);
            res.send({status: moveRes});
        }
    } catch (e) {
        res.status(e.status ? e.status : 500);
        res.send(e.message ? {...e, message: e.message} : e);
    }
});

module.exports = router;
