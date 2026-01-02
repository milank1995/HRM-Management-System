import { Request, Response } from "express";
import Skill from "../entities/skillEntity";
import { AppDataSource } from "../utils/dbConnect";
import { validateSkillSchema } from "../../validators/skillSchemaValidators";


export const addSkillHandler = async(req:Request,res: Response) => {
    try {
        const validatedData = await validateSkillSchema.parseAsync(req.body);
        const { name, category } = validatedData;

        const skillRepository = AppDataSource.getRepository(Skill);
        
        // Check if skill with same name already exists (case-insensitive)
        const allSkills = await skillRepository.find();
        
        const existingSkill = allSkills.find(skill => {
            const exists = skill.name.toLowerCase() === name.toLowerCase();
            return exists;
        });
            
        if (existingSkill) {
            return res.status(400).json({ message: "Skill with this name already exists" });
        }

        const skill = skillRepository.create({ name, category });
        await skillRepository.save(skill);
        res.status(201).json({ message: "Skill created successfully", skill });
    } catch (error) {
        console.error('Error in addSkillHandler:', error);
        res.status(500).json({ message: error.message, error })
    }
}



export const getSkillHandler = async(req:Request,res: Response) => {
    try {
        const skillRepository = AppDataSource.getRepository(Skill);
        const skills = await skillRepository.find();
        if (!skills) {
            return res.status(404).json({ message: "No skills found" })
        }
        res.status(200).json({ message: "Skills retrieved successfully", skills })
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}



export const getSkillByIdHandler = async(req:Request,res: Response) => {
    try {
        const skillRepository = AppDataSource.getRepository(Skill);
        const skill = await skillRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" })
        }
        res.status(200).json({ message: "Skill retrieved successfully", skill })
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}



export const updateSkillHandler = async(req:Request,res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = await validateSkillSchema.parseAsync(req.body);
        const { name } = validatedData;
        const skillRepository = AppDataSource.getRepository(Skill);
        
        // Check if another skill with same name exists (case-insensitive)
        const allSkills = await skillRepository.find();
        const existingSkill = allSkills.find(skill => 
            skill.name.toLowerCase() === name.toLowerCase() && skill.id !== parseInt(id)
        );
            
        if (existingSkill) {
            return res.status(400).json({ message: "Skill with this name already exists" });
        }
        
        const result = await skillRepository.update(parseInt(id), validatedData as any);
        
        if (result.affected === 0) {
            return res.status(404).json({ message: "Skill not found" });
        }
        
        res.status(200).json({ message: "Skill updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}



export const deleteSkillHandler = async(req:Request,res: Response) => {
    try {
        const { id } = req.params;
        const skillRepository = AppDataSource.getRepository(Skill);
        const result = await skillRepository.delete(parseInt(id));

        if (result.affected === 0) {
            return res.status(404).json({ message: "Skill not found" });
        }

        res.status(200).json({ message: "Skill deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ message: error.message, error })
    }
}