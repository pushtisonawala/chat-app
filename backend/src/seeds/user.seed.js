import { config } from "dotenv";
import bcrypt from 'bcryptjs';

import { connectDB } from "../lib/db.js";
import User from '../models/user.model.js';
config();

const seedUsers = [
    {
        email: "neha.sharma@example.com",
        fullName: "Neha Sharma",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
        email: "arun.singh@example.com",
        fullName: "Arun Singh",
        password: "password456",
        profilePic: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
        email: "divya.sharma@example.com",
        fullName: "Divya Sharma",
        password: "password789",
        profilePic: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
        email: "rahul.verma@example.com",
        fullName: "Rahul Verma",
        password: "password101112",
        profilePic: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
        email: "priya.jain@example.com",
        fullName: "Priya Jain",
        password: "password131415",
        profilePic: "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
        email: "ravi.shah@example.com",
        fullName: "Ravi Shah",
        password: "password161718",
        profilePic: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    {
        email: "komal.mishra@example.com",
        fullName: "Komal Mishra",
        password: "password192021",
        profilePic: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
        email: "vikas.yadav@example.com",
        fullName: "Vikas Yadav",
        password: "password222324",
        profilePic: "https://randomuser.me/api/portraits/men/4.jpg"
    },
    {
        email: "sneha.agarwal@example.com",
        fullName: "Sneha Agarwal",
        password: "password252627",
        profilePic: "https://randomuser.me/api/portraits/women/5.jpg"
    },
    {
        email: "anil.patel@example.com",
        fullName: "Anil Patel",
        password: "password282930",
        profilePic: "https://randomuser.me/api/portraits/men/5.jpg"
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();
        // Hash passwords before saving
        const hashedUsers = await Promise.all(seedUsers.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the password
            return { ...user, password: hashedPassword }; // Return user with hashed password
        }));
        await User.insertMany(hashedUsers);
        console.log("Seeded successfully");
    } catch (error) {
        console.log("Error seeding", error);
    }
};
seedDatabase();
