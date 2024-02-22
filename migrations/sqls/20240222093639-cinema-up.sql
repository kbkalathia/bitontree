CREATE TABLE IF NOT EXISTS seats (
  id int(11) NOT NULL AUTO_INCREMENT,
  theatre_id varchar(255) NOT NULL,
  occupied_seats longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(occupied_seats)),
  created_date datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY cinema_id (theatre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS theatre (
  id varchar(255) NOT NULL,
  number_of_seats int(11) NOT NULL,
  isFull tinyint(1) NOT NULL DEFAULT 0,
  created_date datetime NOT NULL DEFAULT current_timestamp(),
  KEY id (id),
  KEY numer_of_seats (number_of_seats),
  KEY isFull (isFull),
  KEY created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
