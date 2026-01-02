import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("users")
@Unique(["email"])
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 11, nullable: true })
  phone: string;

  @Column({ unique: true, type: "varchar", length: 150 })
  email: string;

  @Column({ type: "varchar", length: 200 })
  password: string;

  @Column({ type: "varchar", length: 50, default: "admin" })
  role: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
