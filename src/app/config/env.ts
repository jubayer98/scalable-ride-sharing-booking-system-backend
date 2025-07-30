import dotenv from 'dotenv';

// calling dotenv config
dotenv.config();

// create interface for environment variables
interface EnvVariables {
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development" | "production";
    FRONTEND_URL: string;
    BCRYPT_SALT_ROUNDS: string;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRATION: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRATION: string;
    INITIAL_ADMIN_EMAIL: string;
    INITIAL_ADMIN_PASSWORD: string;
    EMAIL_SENDER: {
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_PORT: string;
        SMTP_HOST: string;
        SMTP_FROM: string;
    };
}

// loading environment variables in an array for further use case
const loadEnvVariables = (): EnvVariables => {

    const requiredEnvVariables: string[] = ['PORT', 'DB_URL', 'NODE_ENV', "FRONTEND_URL", "BCRYPT_SALT_ROUNDS", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRATION", "JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRATION", "INITIAL_ADMIN_EMAIL", "INITIAL_ADMIN_PASSWORD", "SMTP_USER", "SMTP_PASS", "SMTP_PORT", "SMTP_HOST", "SMTP_FROM"];

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Environment variable ${key} is not defined`);
        }
    })

    return {
        PORT: process.env.PORT as string,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_URL: process.env.DB_URL!,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,
        INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL as string,
        INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD as string,
        EMAIL_SENDER: {
            SMTP_USER: process.env.SMTP_USER as string,
            SMTP_PASS: process.env.SMTP_PASS as string,
            SMTP_PORT: process.env.SMTP_PORT as string,
            SMTP_HOST: process.env.SMTP_HOST as string,
            SMTP_FROM: process.env.SMTP_FROM as string
        }
    }
}

export const envVariables = loadEnvVariables();