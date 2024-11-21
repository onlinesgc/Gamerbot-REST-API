declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URL: string;
      LOG_LEVEL: string;
    }
  }
}

export {};
