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
