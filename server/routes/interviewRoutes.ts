import express from 'express';
import { addInterviewHandler, deleteInterviewHandler, getInterviewByCandidateId, getInterviewHandler, interviewFilterData, updateInterviewHandler } from '../controller/interviewController';

const interviewRouter = express.Router();

interviewRouter.post('/add-interview', addInterviewHandler);
interviewRouter.get('/get-interview', getInterviewHandler);
interviewRouter.get('/get-interview-by-candidate-id/:id', getInterviewByCandidateId)
interviewRouter.put('/update-interview/:id', updateInterviewHandler)
interviewRouter.delete('/delete-interview/:id', deleteInterviewHandler)
interviewRouter.get('/interview-filter', interviewFilterData)


export default interviewRouter;