
import { z } from "zod";

export const DATE_PRESETS = [
  "today",
  "7-d",
  "15-d",
  "1-m",
  "1-y",
  "custom",
] as const;
export type DatePreset = typeof DATE_PRESETS[number];



export const validateInterviewSchema = z.object({
  interviewer: z.string().min(2, "Interviewer name must be at least 2 characters"),
  candidateId: z.number().positive("Please select a valid candidate"),
  date: z.string().min(1, "Please select an interview date"),
  startTime: z.string().regex(/^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/, "Please select a valid start time"),
  endTime: z.string().regex(/^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/, "Please select a valid end time"),
  status: z.enum(["pending", "passed", "failed"]).default("pending"),
  interviewRound: z.string().min(1, "Please select an interview round"),
  candidate: z.string().optional(),
  meetingLink: z.string().optional(),
  review: z.object({
    score: z.number().min(0, "Score must be at least 0").max(10, "Score must be at most 10").optional(),
    feedback: z.string().optional(),
  }).optional(),
});

export const interviewFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  round: z.string().optional(),
  dateRange: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})