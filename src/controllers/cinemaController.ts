import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Cinema } from "../schemas/Cinema";
import { insertData, selectData, updateData } from "../util";

const cinemas: Cinema[] = [];
const locks: Record<string, boolean> = {};

export const createTheatre = async (req: Request, res: Response) => {
  const { seats } = req.body;
  const id = uuidv4();

  const query = "INSERT INTO theatre (id, number_of_seats) VALUES (?, ?)";
  const values = [id, seats];

  try {
    if (seats <= 0) {
      res
        .status(500)
        .json({ error: `Theatre cannot be create with ${seats} seats.` });
      return;
    }

    await insertData(query, values);
    console.log("Theatre created:", { id, number_of_seats: seats });
    res.status(201).json({
      message: "Theatre created successfully",
      data: { id, number_of_seats: seats },
    });
  } catch (error) {
    console.error("Error creating theatre:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const purchaseSeat = async (req: Request, res: Response) => {
  const theatreId = req.params.id;
  const seatNumber = parseInt(req.params.seatNumber);

  const theatreQuery = "SELECT * FROM theatre WHERE id = ?";
  const theatreQueryValues = [theatreId];

  const seatsQuery = "SELECT * from seats where theatre_id = ?";
  const seatsQueryValues = [theatreId];

  try {
    const [theatre] = await selectData(theatreQuery, theatreQueryValues);

    if (!theatre) {
      return res.status(404).json({ error: "Cinema not found" });
    }

    if (theatre.isFull == 1) {
      return res.status(400).json({ error: "Theatre is full" });
    }

    if (seatNumber > theatre.number_of_seats) {
      return res.status(500).json({
        message: `Maximum capacity of theatre is ${theatre.number_of_seats}`,
      });
    }

    const [seatsData] = await selectData(seatsQuery, seatsQueryValues);
    let seatsArr: number[] = [];

    if (seatsData) {
      seatsArr = JSON.parse(seatsData.occupied_seats);

      if (seatsArr.includes(seatNumber)) {
        return res.status(500).json({
          message: `${seatNumber} in ${theatre.id} is already purchased`,
        });
      }
    }

    seatsArr.push(seatNumber);

    const updateQuery =
      "INSERT INTO seats (theatre_id, occupied_seats) VALUES (?, ?) ON DUPLICATE KEY UPDATE occupied_seats = ?";
    const updateValues = [
      theatre.id,
      JSON.stringify(seatsArr),
      JSON.stringify(seatsArr),
    ];

    await updateData(updateQuery, updateValues);

    if (seatsArr.length == theatre.number_of_seats) {
      await updateData("UPDATE theatre SET isFull = ? WHERE id = ?", [
        1,
        theatre.id,
      ]);
    }

    return res
      .status(201)
      .json({ message: `${seatNumber} in ${theatre.id} is booked` });
  } catch (error) {
    console.error("Error purchasing seat:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const purchaseConsecutiveSeats = async (req: Request, res: Response) => {
  const theatreId = req.params.id;
  const { seats } = req.body;

  try {
    await acquireLock(theatreId);

    const theatreQuery = "SELECT * FROM theatre WHERE id = ?";
    const theatreQueryValues = [theatreId];
    const [theatre] = await selectData(theatreQuery, theatreQueryValues);

    if (!theatre) {
      return res.status(404).json({ error: "Theatre not found" });
    }

    if (theatre.isFull) {
      return res.status(400).json({ error: "Theatre is full" });
    }

    const seatsQuery = "SELECT * FROM seats WHERE theatre_id = ?";
    const seatsQueryValues = [theatreId];
    const [seatsData] = await selectData(seatsQuery, seatsQueryValues);

    if (!seatsData) {
      const insertQuery =
        "INSERT INTO seats (theatre_id, occupied_seats) VALUES (?, ?)";
      const insertValues = [theatreId, JSON.stringify([])];
      await insertData(insertQuery, insertValues);
    }

    const occupiedSeats = JSON.parse(seatsData.occupied_seats);

    for (const seat of seats) {
      if (occupiedSeats.includes(seat)) {
        return res
          .status(400)
          .json({ error: `Seat ${seat} is already booked` });
      }
    }

    // All consecutive seats are available, book them
    for (const seat of seats) {
      occupiedSeats.push(seat);
    }

    const updateQuery =
      "UPDATE seats SET occupied_seats = ? WHERE theatre_id = ?";
    const updateValues = [JSON.stringify(occupiedSeats), theatreId];
    await updateData(updateQuery, updateValues);

    return res.json({ message: "Seats booked successfully", seats });
  } catch (error) {
    console.error("Error purchasing consecutive seats:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    releaseLock(theatreId);
  }
};

const updateTwoConsecutiveSeats = async (
  theatreId: string
): Promise<number[] | null> => {
  const seatsQuery = "SELECT * FROM seats WHERE cinema_id = ?";
  const seatsQueryValues = [theatreId];
  const [seatsData] = await selectData(seatsQuery, seatsQueryValues);

  if (!seatsData) {
    return null;
  }

  const seats = JSON.parse(seatsData.occupied_seats);

  for (let i = 0; i < seats.length - 1; i++) {
    if (!seats.includes(i) && !seats.includes(i + 1)) {
      seats.push(i, i + 1);

      const updateQuery =
        "UPDATE seats SET occupied_seats = ? WHERE cinema_id = ?";
      const updateValues = [JSON.stringify(seats), theatreId];
      await updateData(updateQuery, updateValues);

      return [i + 1, i + 2];
    }
  }

  return null;
};

const acquireLock = async (theatreId: string): Promise<void> => {
  while (locks[theatreId]) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  locks[theatreId] = true;
};

const releaseLock = (theatreId: string): void => {
  locks[theatreId] = false;
};
