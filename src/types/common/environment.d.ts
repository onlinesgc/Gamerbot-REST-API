/* eslint-disable @typescript-eslint/naming-convention */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URL: string;
            LOG_LEVEL: string;
            MONGO_URL_TESTDATABASE: string;
            PORT: string;
            DEBUG: string;
        }
    }
}

export {};
