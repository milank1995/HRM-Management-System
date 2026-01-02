import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Unique } from "typeorm";
import Candidate from "./candidateEntity";

@Entity("skill")
@Unique(["name", "category"])
export default class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 55 })
  name?: string;

  @Column({ type: "varchar", length: 55 })
  category?: string;

  @ManyToMany(() => Candidate, (candidate) => candidate.skills)
  candidates: Candidate[];
 
}
