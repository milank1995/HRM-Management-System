import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";
import Skill from "./skillEntity";
import Position from "./positionEntity";
import Interview from "./interviewEntity";
import { C } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";

@Entity("candidates")
export default class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 600, nullable: true })
  resume: File;

  @Column({ type: "varchar", length: 55 })
  fullName?: string;

  @Column({ type: "varchar", length: 55, unique: true })
  email?: string;

  @Column({ type: "varchar", length: 10 })
  phone?: string;

  @Column({ type: "int" })
  totalExperience?: number;

  @Column({ type: "json", nullable: true })
  education?: string[];

  @Column({ type: "varchar", length: 50, nullable: true })
  previousCompanies?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  availability?: string;

  @Column({ type: "int" })
  currentSalary?: number;

  @Column({ type: "int" })
  expectedSalary?: number;

  @Column({ type: "varchar", length: 1000, nullable: true })
  notes?: string;

  @Column({ type: "varchar", length: 50 })
  addBy?: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ManyToMany(() => Skill, (skill) => skill.candidates)
  @JoinTable({ name: "candidate_skills" })
  skills?: Skill[];

  @ManyToMany(() => Position, (position) => position.candidates)
  @JoinTable({ name: "candidate_positions" })
  appliedPosition?: Position[];

  @OneToMany(() => Interview, (interview) => interview.candidate)
  interviews: Interview[];
}
