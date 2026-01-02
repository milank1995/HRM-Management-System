import { z } from "zod";

export const candidateResumeValidator = z.object({
  resume: z
    .any()
    .refine((file) => file && file.mimetype, "Resume file is required"),
});

export const validateCandidateSchema = z.object({
  addBy: z.string(),
  fullName: z.string().min(2,"Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(10,"Phone number should not above 10 characters"),
  totalExperience: z.number().min(0,"Experience cannot be negative").max(30,"Experience seems too high"),
  skills: z.array(z.string()).min(1, "At least one skill must be selected"),
  education: z.array(z.string()).optional(),
  previousCompanies: z.string().min(2,"Current company name must be at least 2 characters").optional(),
  appliedPosition: z.array(z.string()).min(1, "At least one position must be selected"),
  availability: z.string().optional(),
  currentSalary: z.number().min(0,"Current salary cannot be negative").optional(),
  expectedSalary: z.number().min(0,"Expected salary cannot be negative").optional(),
  notes: z.string().max(1000,"Notes should not exceed 1000 characters").optional(),
});

export const candidateFilterSchema = z.object({
  search: z.string().optional(),
  skills: z.string().optional(),
  position: z.string().optional(),
  status: z.string().optional(),
});
