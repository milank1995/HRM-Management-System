import { Request, Response } from "express";
import {
  interviewFilterSchema,
  validateInterviewSchema,
} from "../../validators/interviewSchemaValidators";
import { AppDataSource } from "server/utils/dbConnect";
import Interview, { InterviewStatus } from "server/entities/interviewEntity";
import Candidate from "server/entities/candidateEntity";
import Review from "server/entities/reviewEntity";

const convertTo24Hour = (time12: string) => {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return time12;

  let [, hours, minutes, ampm] = match;
  let hour = parseInt(hours);

  if (ampm.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  } else if (ampm.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, "0")}:${minutes}:00`;
};

const convertToAMPM = (time24: string) => {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const addInterviewHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = await validateInterviewSchema.parseAsync(req.body);

    const candidateRepository = AppDataSource.getRepository(Candidate);
    const candidate = await candidateRepository.findOneBy({
      id: validatedData.candidateId,
    });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const interviewRepository = AppDataSource.getRepository(Interview);
    const existingInterview = await interviewRepository.findOne({
      where: {
        candidateId: validatedData.candidateId,
        date: validatedData.date,
        startTime: convertTo24Hour(validatedData.startTime),
        endTime: convertTo24Hour(validatedData.endTime),
      },
    });
    if (existingInterview) {
      return res.status(409).json({ message: "Interview already scheduled" });
    }
    const newInterview = interviewRepository.create({
      interviewer: validatedData.interviewer,
      candidateId: candidate.id,
      candidate: candidate,
      date: validatedData.date,
      startTime: convertTo24Hour(validatedData.startTime),
      endTime: convertTo24Hour(validatedData.endTime),
      interviewRound: validatedData.interviewRound,
      status: validatedData.status as InterviewStatus,
      meetingLink: validatedData.meetingLink
    });


    const savedInterview = await interviewRepository.save(newInterview);

    if (!savedInterview) {
      return res.status(500).json({ message: "Error adding interview" });
    }

    res.status(201).json({ message: "Interview scheduled successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getInterviewHandler = async (req: Request, res: Response) => {
  try {
    const interviewRepository = AppDataSource.getRepository(Interview);
    const interviews = await interviewRepository.find({
      relations: ["candidate", "review"],
      order: { date: "ASC" },
    });

    if (!interviews) {
      return res.status(404).json({ message: "No interviews found" });
    }

    const formattedInterviews = interviews.map((interview) => ({
      ...interview,
      candidate: interview.candidate,
      startTime: convertToAMPM(interview.startTime),
      endTime: convertToAMPM(interview.endTime),
    }));

    res
      .status(200)
      .json({ message: "Get all interviews", interviews: formattedInterviews });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching interviews", error: error.message });
  }
};

export const getInterviewByCandidateId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const interviewRepository = AppDataSource.getRepository(Interview);
    const interviews = await interviewRepository
      .find({
        where: { candidateId: parseInt(id) },
        relations: ["candidate", "review"],
        order: { date: "ASC", startTime: "ASC" },
      });

    if (!interviews || interviews.length === 0) {
      return res
        .status(404)
        .json({ message: `No interviews found for this candidate` });
    }

    const formattedInterviews = interviews.map((interview) => ({
      ...interview,
      candidate: interview.candidate,
      startTime: convertToAMPM(interview.startTime),
      endTime: convertToAMPM(interview.endTime),
    }));

    res.status(200).json(formattedInterviews);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching interviews", error: error.message });
  }
};

export const updateInterviewHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validatedData = await validateInterviewSchema.parseAsync(req.body);

    const candidateRepository = AppDataSource.getRepository(Candidate);
    const candidate = await candidateRepository.findOne({
      where: { id: validatedData.candidateId },
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const interviewRepository = AppDataSource.getRepository(Interview);
    const interview = await interviewRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["review", "candidate"],
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    const reviewRepository = AppDataSource.getRepository(Review);
    
    if (validatedData.review) {
      const { score, feedback } = validatedData.review;
      const newReview = reviewRepository.create({
        score,
        feedback,
        interview,
      });
      await reviewRepository.save(newReview);
      interview.review = newReview;
    }
  
    interview.interviewer = validatedData.interviewer;
    interview.candidate = candidate;
    interview.candidateId = candidate.id;
    interview.date = validatedData.date;
    interview.startTime = convertTo24Hour(validatedData.startTime);
    interview.endTime = convertTo24Hour(validatedData.endTime);
    interview.interviewRound = validatedData.interviewRound;
    interview.status = validatedData.status as InterviewStatus;
    interview.meetingLink = validatedData.meetingLink
    
    await interviewRepository.update(id,interview);

    res.status(200).json({
      message: "Interview updated successfully",
      interview: {
        ...interview,
        candidate: candidate.fullName,
        startTime: convertToAMPM(interview.startTime),
        endTime: convertToAMPM(interview.endTime),
        review: interview.review ? {
          score: interview.review.score,
          feedback: interview.review.feedback,
        } : null,
      },
    });

  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteInterviewHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interviewRepository = AppDataSource.getRepository(Interview);
    const result = await interviewRepository.delete(parseInt(id));

    if (result.affected === 0) {
      return res.status(404).json({ message: `Interview not found` });
    }

    res.status(200).json({ message: `Interview deleted successfully` });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting interview", error: error.message });
  }
};

export const interviewFilterData = async (req: Request, res: Response) => {
  try {
    const filters = await interviewFilterSchema.parseAsync(req.query);
    const { search, status, round, dateRange, startDate, endDate } = filters;

    const repo = AppDataSource.getRepository(Interview);

    const filterQb = repo
      .createQueryBuilder("scheduleInterview")
      .leftJoinAndSelect("scheduleInterview.candidate", "candidates")
      .leftJoinAndSelect("scheduleInterview.review", "review")
      .orderBy("scheduleInterview.date", "ASC")
      .addOrderBy("scheduleInterview.startTime", "ASC");

    if (search) {
      filterQb.andWhere(
        `(candidates.fullName LIKE :search OR candidates.email LIKE :search OR candidates.phone LIKE :search)`,
        { search: `%${search}%` }
      );
    }
    if (status) {
      const statusValues = status.split(",").map((s) => s.trim());
      filterQb.andWhere("scheduleInterview.status IN (:...statusValues)", {
        statusValues,
      });
    }
    if (round) {
      const roundValues = round.split(",").map((r) => r.trim());
      filterQb.andWhere(
        "TRIM(scheduleInterview.interviewRound) IN (:...roundValues)",
        { roundValues },
      );
    }

    if (dateRange) {
      const range = dateRange as "today" | "lw" | "lq" | "lm" | "ly" | "custom";

      let fromDate = new Date();
      let toDate = new Date();

      switch (range) {
        case "today":
          const today = new Date();
          const todayStr = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');

          filterQb.andWhere(`scheduleInterview.date = :today`, { today: todayStr });
          break;

        case "lw":
          fromDate.setDate(fromDate.getDate() - 7);
          break;

        case "lq":
          fromDate.setDate(fromDate.getDate() - 15);
          break;

        case "lm":
          fromDate.setMonth(fromDate.getMonth() - 1);
          break;

        case "ly":
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;

        case "custom":
          if (!startDate || !endDate) throw new Error("Start & end required");
          fromDate = new Date(startDate);
          toDate = new Date(endDate);
          break;

        default:
          return;
      }

      const formatDate = (date: Date) => {
        return date.getFullYear() + '-' +
          String(date.getMonth() + 1).padStart(2, '0') + '-' +
          String(date.getDate()).padStart(2, '0');
      };

      if (range !== "today") {
        filterQb.andWhere(
          `scheduleInterview.date BETWEEN :fromDate AND :toDate`,
          {
            fromDate: formatDate(fromDate),
            toDate: formatDate(toDate),
          }
        );
      }
    }



    const interviews = await filterQb
      .orderBy("scheduleInterview.date", "ASC")
      .addOrderBy("scheduleInterview.startTime", "ASC")
      .getMany();

    if (!interviews.length) {
      return res.status(200).json([]);
    }

    const formattedInterviews = interviews.map((interview) => ({
      ...interview,
      candidate: interview.candidate,
      startTime: convertToAMPM(interview.startTime),
      endTime: convertToAMPM(interview.endTime),
    }));

    return res.status(200).json(formattedInterviews);
  } catch (error: any) {
    return res.status(400).json({
      message: "Invalid filters",
      error: error.message,
    });
  }
};
