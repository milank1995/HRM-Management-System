import express from 'express';
import { addPositionHandler, deletePositionHandler, getPositionByIdHandler, getPositionHandler, updatePositionHandler } from 'server/controller/positionController';

const positionRouter = express.Router();

positionRouter.post('/add-position', addPositionHandler);
positionRouter.get('/get-position', getPositionHandler);
positionRouter.get('/get-positions-by-id/:id', getPositionByIdHandler)
positionRouter.put('/update-position/:id', updatePositionHandler)
positionRouter.delete('/delete-position/:id', deletePositionHandler)

export default positionRouter;