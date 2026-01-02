import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import Candidate from "./candidateEntity";
import Review from "./reviewEntity";
import { C } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";

export enum InterviewStatus {
  PENDING = "pending",
  PASSED = "passed",
  FAILED = "failed",
}

@Entity("schedule-interview")
export default class Interview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  interviewer: string;

  // FK column
  @Column({ type: "int" })
  candidateId: number;

  @ManyToOne(() => Candidate, (candidate) => candidate.interviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidateId" })
  candidate: Candidate;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "time" })
  startTime: string;

  @Column({ type: "time" })
  endTime: string;

  @Column({ type: "varchar", length: 2048, nullable: true })
  meetingLink: string;

  @Column({
    type: "enum",
    enum: InterviewStatus,
    default: InterviewStatus.PENDING,
  })
  status: InterviewStatus;

  @Column({ type: "varchar", length: 100 })
  interviewRound: string;

  @OneToOne(() => Review, (review) => review.interview, {
    cascade: true,
  })
  @JoinColumn({ name: "review" })
  review: Review;
}
