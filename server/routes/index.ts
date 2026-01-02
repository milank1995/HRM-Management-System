import express from 'express';
import userRouter from './userRoute';
import candidateRouter from './candidateRoute';
import skillRouter from './skillRoute';
import positionRouter from './positionRoute';
import interviewRound from './interviewRoundRoute';
import interviewRouter from './interviewRoutes';

const router = express.Router();

router.use('/user', userRouter);
router.use('/candidate', candidateRouter);
router.use('/skills',skillRouter)
router.use('/positions',positionRouter)
router.use('/interview-round',interviewRound)
router.use('/interview',interviewRouter)                                               


export default router;