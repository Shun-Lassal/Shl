import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { defineConfig, env } from 'prisma/config';
import 'dotenv/config'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

export default defineConfig({
    // the main entry for your schema
    schema: 'prisma/schema.prisma',
    // where migrations should be generated
    // what script to run for "prisma db seed"
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx shared/seeDefaultUser.ts',
    },
    // The database URL 
    datasource: {
        // Type Safe env() helper 
        // Does not replace the need for dotenv
        url: env('DATABASE_URL'),
    },
})