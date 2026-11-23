import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const REACT_PROJECT_COMMAND = process.env.REACT_PROJECT_COMMAND || 'npx --yes create-vite@latest sandbox --template react';
export const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/projectidx';
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_projectidx_2026_secure';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
