import express from 'express';
import { getPaginateSearchableCanData, handleAddCandidate, handleCandidateResume, handleDeleteCandidate, handleFilterCandidates, handleGetCandidateById, handleUpdateCandidate } from 'server/controller/candidateController';
import upload from 'server/utils/fileHandler';

const candidateRouter = express.Router();


candidateRouter.post('/add-candidate',upload.single('resume'),handleCandidateResume);
candidateRouter.post('/add-details',handleAddCandidate);
candidateRouter.put('/update-candidate/:id',handleUpdateCandidate);
candidateRouter.get('/get-candidate/:id',handleGetCandidateById);
candidateRouter.delete('/delete-candidate/:id',handleDeleteCandidate);
candidateRouter.get('/filter', handleFilterCandidates);
candidateRouter.get('/paginate-searchable',getPaginateSearchableCanData);

export default candidateRouter;