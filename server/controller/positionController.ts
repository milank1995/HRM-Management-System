import { Request, Response } from "express";
import Position, { PositionLevel } from "../entities/positionEntity";
import { AppDataSource } from "../utils/dbConnect";
import { validatePositionSchema } from "../../validators/positionSchemaValidators";

export const addPositionHandler = async(req:Request,res: Response) => {
    try {
        const validatedData = await validatePositionSchema.parseAsync(req.body);
        const { name, department, level } = validatedData;

        const positionRepository = AppDataSource.getRepository(Position);

        const position = positionRepository.create({ 
            name, 
            department, 
            level: level as PositionLevel 
        });
        await positionRepository.save(position);
        res.status(201).json({ message: "Position created successfully", position });
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const getPositionHandler = async(req:Request,res: Response) => {
    try {
        const positionRepository = AppDataSource.getRepository(Position);
        const positions = await positionRepository.find();
        if (!positions) {
            return res.status(404).json({ message: "No positions found" })
        }
        res.status(200).json({ message: "Positions retrieved successfully", positions })
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const getPositionByIdHandler = async(req:Request,res: Response) => {
    try {
        const positionRepository = AppDataSource.getRepository(Position);
        const position = await positionRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!position) {
            return res.status(404).json({ message: "Position not found" })
        }
        res.status(200).json({ message: "Position retrieved successfully", position })
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const updatePositionHandler = async(req:Request,res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = await validatePositionSchema.parseAsync(req.body);
        const positionRepository = AppDataSource.getRepository(Position);
        const result = await positionRepository.update(parseInt(id), validatedData as any);
        
        if (result.affected === 0) {
            return res.status(404).json({ message: "Position not found" });
        }
        
        res.status(200).json({ message: "Position updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}

export const deletePositionHandler = async(req:Request,res: Response) => {
    try {
        const { id } = req.params;
        const positionRepository = AppDataSource.getRepository(Position);
        const result = await positionRepository.delete(parseInt(id));

        if (result.affected === 0) {
            return res.status(404).json({ message: "Position not found" });
        }

        res.status(200).json({ message: "Position deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}