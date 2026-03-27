import { config } from "dotenv";

config({ path: `.env` });

export const { PORT = 3000, NODE_ENV = "development", CLIENT_URL = "http://localhost:5173" } =
  process.env;
