import express from "express";
import {
  createTheatre,
  purchaseConsecutiveSeats,
  purchaseSeat,
} from "./controllers/cinemaController";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/create-theatre", createTheatre);
app.post("/api/theatre/:id/seat/:seatNumber", purchaseSeat);
app.post("/api/cinemas/:id/consecutive-seats", purchaseConsecutiveSeats);

app.listen(PORT);
