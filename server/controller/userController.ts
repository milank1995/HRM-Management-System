import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import User from "../entities/userEntity";
import { loginSchema, createUserSchema } from "../../validators/userSchemaValidators";
import { AppDataSource } from "../utils/dbConnect";

export const createUser = async (req: Request, res: Response) => {
  try {
    await createUserSchema.parseAsync(req.body);

    const { name, email, password, phone, role } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userRepository.create({ 
      name,
      phone,
      email, 
      password: hashedPassword, 
      role: role || "hr",
      createdAt: new Date()
    });
    await userRepository.save(user);

    res.status(201).json({ message: "User created successfully",user});
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const validatedData = await loginSchema.parseAsync(req.body);

    const { email, password } = validatedData;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const tokenPayload = { userId: user.id, email, role: user.role, name: `${user.name} ` };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.status(200).json({ decoded });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

export const getPaginateSearchableUserData = async(req:Request,res:Response)=>{
  try {
     const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const search = String(req.query.search || "");

  const skip = (page - 1) * limit;
   const qb = AppDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .skip(skip)
    .take(limit);
    
     if (search) {
    qb.where("LOWER(user.name) LIKE :search", {
      search: `%${search.toLowerCase()}%`,
    });
  }

  const [user, total] = await qb.getManyAndCount();

    res.status(200).json({ data: user, total: total, nextPage: skip + limit < total ? page + 1 : null});
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    await userRepository.update(Number(id), { name, email, phone, role });
    
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRepository.delete(Number(id));
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};