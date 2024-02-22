import pool from "./connection";

export const insertData = async (
  query: string,
  values: any[]
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    pool.query(query, values, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
