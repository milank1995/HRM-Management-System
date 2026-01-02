import express from 'express';
import { addInterviewRoundHandler, deleteInterviewRoundHandler, getInterviewRoundByIdHandler, getInterviewRoundHandler, updateInterviewRoundHandler } from 'server/controller/interviewRoundController';


const interviewRouter = express.Router();

interviewRouter.post('/add-interview-round',addInterviewRoundHandler);
interviewRouter.get('/get-interview-round',getInterviewRoundHandler);
interviewRouter.get('/get-interview-round-by-id/:id',getInterviewRoundByIdHandler)
interviewRouter.put('/update-interview-round/:id',updateInterviewRoundHandler)
interviewRouter.delete('/delete-interview-round/:id',deleteInterviewRoundHandler)


export default interviewRouter;