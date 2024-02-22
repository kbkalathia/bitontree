import mysql from "mysql";

var pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cinema",
});

pool.connect();

export default pool;
