import { z } from "zod";

export const validatePositionSchema = z.object({
  name: z.string().min(2,"Name must be at least 2 characters"),
  department: z.string().min(2,"Department must be at least 2 characters"),
  level: z.enum(["Junior", "Mid", "Senior","Manager"], { errorMap: () => ({ message: "Invalid position level" }) }),
});