import express from 'express';
import { addSkillHandler, deleteSkillHandler, getSkillByIdHandler, getSkillHandler, updateSkillHandler } from '../controller/skillController';

const skillRouter = express.Router();

skillRouter.post('/add-skill', addSkillHandler);
skillRouter.get('/get-skill', getSkillHandler);
skillRouter.get('/get-skills-by-id/:id', getSkillByIdHandler)
skillRouter.put('/update-skill/:id', updateSkillHandler)
skillRouter.delete('/delete-skill/:id', deleteSkillHandler)


export default skillRouter;