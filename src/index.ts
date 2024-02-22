import express from "express";
import { createTheatre } from "./controllers/cinemaController";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/create-theatre", createTheatre);

app.listen(PORT);
