import { Request, Response } from "express";
import Candidate from "server/entities/candidateEntity";
import Skill from "server/entities/skillEntity";
import Position, { PositionLevel } from "server/entities/positionEntity";
import { AppDataSource } from "server/utils/dbConnect";
import { parseResumeToGemini } from "server/utils/getPdfDataFromGeminiApi";
import { candidateFilterSchema, candidateResumeValidator, validateCandidateSchema } from "../../validators/candidateSchemaValidators";

interface MulterRequest extends Request {
    file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    };
}

export const handleCandidateResume = async (req: MulterRequest, res: Response) => {
    try {
        const result = await candidateResumeValidator.safeParseAsync({ resume: req.file });

        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const candidateRepository = AppDataSource.getRepository(Candidate);
        const candidate = candidateRepository.create({}) as unknown as Candidate;
        
        await candidateRepository.save(candidate);
       
        res.status(200).json({ message: "Candidate added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
}

export const handleAddCandidate = async (req: Request, res: Response) => {
    try {       
        const validate = validateCandidateSchema.safeParse(req.body);

        if (!validate.success) {
            return res.status(400).json({ error: validate.error.errors });
        }

        const isUserExist = await AppDataSource.getRepository(Candidate).findOneBy({ email: validate.data.email });
        if (isUserExist) {
            return res.status(400).json({ message: "Candidate with this email already exists" });
        }

        const candidateRepository = AppDataSource.getRepository(Candidate);
        const skillRepository = AppDataSource.getRepository(Skill);
        const positionRepository = AppDataSource.getRepository(Position);
        
        const { skills, appliedPosition, ...candidateData } = validate.data;
        const candidate = candidateRepository.create({
            ...candidateData,
            createdAt: new Date()
        } as any) as unknown as Candidate;
        
        if (skills && skills.length > 0) {
            const candidateSkills = [];
            for (const skillName of skills) {
                let skill = await skillRepository.findOne({ where: { name: skillName } });
                if (!skill) {
                    skill = skillRepository.create({ name: skillName, category: 'General' });
                    await skillRepository.save(skill);
                }
                candidateSkills.push(skill);
            }
            candidate.skills = candidateSkills;
        }
        
        if (appliedPosition && appliedPosition.length > 0) {
            const candidatePositions = [];
            for (const positionName of appliedPosition) {
                let position = await positionRepository.findOne({ where: { name: positionName } });
                if (!position) {
                    position = positionRepository.create({ name: positionName, department: 'General', level: PositionLevel.JUNIOR });
                    await positionRepository.save(position);
                }
                candidatePositions.push(position);
            }
            candidate.appliedPosition = candidatePositions;
        }
        
        await candidateRepository.save(candidate);

        res.status(200).json({ message: "Candidate added successfully" ,candidate });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
}

export const handleUpdateCandidate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validation = validateCandidateSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }

        const candidateRepository = AppDataSource.getRepository(Candidate);
        const skillRepository = AppDataSource.getRepository(Skill);
        const positionRepository = AppDataSource.getRepository(Position);
        
        const candidate = await candidateRepository.findOne({ 
            where: { id: parseInt(id) }, 
            relations: ['skills', 'appliedPosition'] 
        });
        
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        const { skills, appliedPosition, ...candidateData } = validation.data;
        
        Object.assign(candidate, {
            ...candidateData,
            updatedAt: new Date()
        });
        
        if (skills && skills.length > 0) {
            const candidateSkills = [];
            for (const skillName of skills) {
                let skill = await skillRepository.findOne({ where: { name: skillName } });
                if (!skill) {
                    skill = skillRepository.create({ name: skillName, category: 'General' });
                    await skillRepository.save(skill);
                }
                candidateSkills.push(skill);
            }
            candidate.skills = candidateSkills;
        } else {
            candidate.skills = [];
        }
        
        if (appliedPosition && appliedPosition.length > 0) {
            const candidatePositions = [];
            for (const positionName of appliedPosition) {
                let position = await positionRepository.findOne({ where: { name: positionName } });
                if (!position) {
                    position = positionRepository.create({ name: positionName, department: 'General', level: PositionLevel.JUNIOR });
                    await positionRepository.save(position);
                }
                candidatePositions.push(position);
            }
            candidate.appliedPosition = candidatePositions;
        } else {
            candidate.appliedPosition = [];
        }
        
        await candidateRepository.save(candidate);

        res.status(200).json({ message: "Candidate updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
}

export const handleGetCandidateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const candidateRepository = AppDataSource.getRepository(Candidate);
        const candidate = await candidateRepository.findOne({
            where: { id: parseInt(id) },
            relations: ['skills', 'appliedPosition']
        });
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        res.status(200).json({ data : candidate });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
}

export const handleDeleteCandidate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const candidateRepository = AppDataSource.getRepository(Candidate);
        const result = await candidateRepository.delete(parseInt(id));
        if (result.affected === 0) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        res.status(200).json({ message: "Candidate deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
}


export const handleFilterCandidates = async (req: Request, res: Response) => {
  try {
    const {
    search,
    skill,
    position,
    page = 1,
    limit = 10
  } = req.query
  const validate = candidateFilterSchema.safeParse(req.query);
  if (!validate.success) {
    return res.status(400).json({ error: validate.error.errors });
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const query = AppDataSource
    .getRepository(Candidate)
    .createQueryBuilder("candidate")
    .leftJoinAndSelect("candidate.skills", "skill")
    .leftJoinAndSelect("candidate.appliedPosition", "position")
    .leftJoinAndSelect("candidate.interviews", "interviews")
    .skip(skip)
    .take(limitNum);
    

  if (search) {
  query.andWhere(
    `(candidate.fullName LIKE :search OR candidate.email LIKE :search)`,
    { search: `%${search}%` }
  );
}

if (skill) {
  query.andWhere("skill.name IN (:...skills)", {
    skills: skill.toString().split(","),
  });
}

if (position) {
  query.andWhere("position.name IN (:...positions)", {
    positions: position.toString().split(","),
  });
}

  const [candidates, total] = await query.getManyAndCount();

    res.status(200).json({ data: candidates, total: total, nextPage: skip + limitNum < total ? pageNum + 1 : null});
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

export const getPaginateSearchableCanData = async(req:Request,res:Response)=>{
  try {
     const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const search = String(req.query.search || "");

  const skip = (page - 1) * limit;
   const qb = AppDataSource
    .getRepository(Candidate)
    .createQueryBuilder("candidate")
     .leftJoinAndSelect("candidate.skills", "skill")
    .leftJoinAndSelect("candidate.appliedPosition", "position")
    .leftJoinAndSelect("candidate.interviews", "interviews")
    .skip(skip)
    .take(limit);
    
     if (search) {
    qb.where("LOWER(candidate.fullName) LIKE :search", {
      search: `%${search.toLowerCase()}%`,
    });
  }

  const [candidates, total] = await qb.getManyAndCount();

    res.status(200).json({ data: candidates, total: total, nextPage: skip + limit < total ? page + 1 : null});
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
}
