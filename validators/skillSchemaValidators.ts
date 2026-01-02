import { z } from "zod";

export const validateSkillSchema = z.object({
  name: z.string().min(2,"Name must be at least 2 characters"),
  category: z.string().min(2,"Category must be at least 2 characters"),
});