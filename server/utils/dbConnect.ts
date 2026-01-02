import "reflect-metadata";
import { DataSource } from "typeorm";
import User from "../entities/userEntity.ts";
import Candidate from "../entities/candidateEntity.ts";
import Skill from "../entities/skillEntity.ts";
import Position from "../entities/positionEntity.ts";
import InterviewRound from "../entities/interviewRoundEntity.ts";
import Interview from "../entities/interviewEntity.ts";
import Review from "server/entities/reviewEntity.ts";

export const AppDataSource = new DataSource({
    type: "mysql",
    url: process.env.DATABASE_URL,
    synchronize: process.env.NODE_ENV === "development",
    logging: false,
    entities: [User, Candidate, Skill, Position, InterviewRound, Interview, Review],
    
    migrations: [],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false
    },
    extra: {
        connectionLimit: 10,
        reconnect: true,
        idleTimeout: 300000
    },
    poolSize: 10,
    maxQueryExecutionTime: 30000
})