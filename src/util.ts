import pool from "./connection";

export const selectData = async (
  query: string,
  values: any[]
): Promise<any[]> => {
  return new Promise<any[]>((resolve, reject) => {
    pool.query(query, values, (err, results) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

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

export const updateData = async (
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
