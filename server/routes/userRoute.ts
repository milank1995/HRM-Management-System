import express from 'express';
import { handleLogin, createUser,getUserProfile, getPaginateSearchableUserData, updateUser, deleteUser } from '../controller/userController';

const userRouter = express.Router();

userRouter.post('/create-user',createUser);
userRouter.post('/login',handleLogin);
userRouter.get('/profile',getUserProfile);
userRouter.get('/get-user', getPaginateSearchableUserData);
userRouter.put('/update-user/:id',updateUser);
userRouter.delete('/delete-user/:id', deleteUser);

export default userRouter;