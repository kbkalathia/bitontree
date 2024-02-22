import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Cinema } from "../schemas/Cinema";
import { insertData } from "../util";

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
