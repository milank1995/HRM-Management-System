import { Request, Response } from "express";
import interviewRound from "../entities/interviewRoundEntity";
import { AppDataSource } from "../utils/dbConnect";
import { validateInterviewRoundSchema } from "../../validators/interviewRoundSchemaValidators";

export const addInterviewRoundHandler = async(req:Request,res: Response) => {
    try {
        const validatedData = await validateInterviewRoundSchema.parseAsync(req.body);
        const { name, description } = validatedData;

        const interviewRoundRepository = AppDataSource.getRepository(interviewRound);
        const newInterviewRound = interviewRoundRepository.create({ name, description });
        await interviewRoundRepository.save(newInterviewRound);
        res.status(201).json({ message: "interviewRound created successfully", interviewRound: newInterviewRound });
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const getInterviewRoundHandler = async(req:Request,res: Response) => {
    try {
        const interviewRoundRepository = AppDataSource.getRepository(interviewRound);
        const interviewRounds = await interviewRoundRepository.find();
        if (!interviewRounds) {
            return res.status(404).json({ message: "No interviewRounds found" })
        }
        res.status(200).json({ message: "interviewRounds retrieved successfully", interviewRounds })
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const getInterviewRoundByIdHandler = async(req:Request,res: Response) => {
    try {
        const interviewRoundRepository = AppDataSource.getRepository(interviewRound);
        const foundInterviewRound = await interviewRoundRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!foundInterviewRound) {
            return res.status(404).json({ message: "interviewRound not found" })
        }
        res.status(200).json({ message: "interviewRound retrieved successfully", interviewRound: foundInterviewRound })
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const updateInterviewRoundHandler = async(req:Request,res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = await validateInterviewRoundSchema.parseAsync(req.body);
        const interviewRoundRepository = AppDataSource.getRepository(interviewRound);
        const result = await interviewRoundRepository.update(parseInt(id), validatedData as any);
        
        if (result.affected === 0) {
            return res.status(404).json({ message: "interviewRound not found" });
        }
        
        res.status(200).json({ message: "interviewRound updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const deleteInterviewRoundHandler = async(req:Request,res: Response) => {
    try {
        const { id } = req.params;
        const interviewRoundRepository = AppDataSource.getRepository(interviewRound);
        const result = await interviewRoundRepository.delete(parseInt(id));

        if (result.affected === 0) {
            return res.status(404).json({ message: "interviewRound not found" });
        }

        res.status(200).json({ message: "interviewRound deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}