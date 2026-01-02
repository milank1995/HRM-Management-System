import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";


@Entity("interview-round")
@Unique(["name","description"])
export default class interviewRound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 55, unique: true })
  name?: string;

  @Column({ type: "varchar", length: 75 })
  description?: string;
 
}
