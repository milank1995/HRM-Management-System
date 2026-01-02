import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Unique } from "typeorm";
import Candidate from "./candidateEntity";

export enum PositionLevel {
  JUNIOR = "Junior",
  MID = "Mid",
  SENIOR = "Senior",
  MANAGER = "Manager",
}

@Entity("position")
@Unique(["name", "department"])
export default class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 55 })
  name?: string;

  @Column({ type: "varchar", length: 55 })
  department?: string;

  @Column({ type: "enum", enum: PositionLevel })
  level: PositionLevel;

  @ManyToMany(() => Candidate, (candidate) => candidate.appliedPosition)
  candidates: Candidate[];
 
}
