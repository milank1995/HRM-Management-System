import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import Interview from "./interviewEntity";

@Entity("review")
export default class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 3, scale: 1, nullable: true })
  score?: number;

  @Column({ type: "text", nullable: true })
  feedback?: string;

  @OneToOne(() => Interview, (interview) => interview.review, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "interviewId" })
  interview: Interview;
}
