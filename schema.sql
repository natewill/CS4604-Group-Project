-- SQL Schema to initialize our tables and their attributes!

-- Drop Database if it exists
DROP DATABASE IF EXISTS cache_me_if_you_can_db;
CREATE DATABASE cache_me_if_you_can_db;
USE cache_me_if_you_can_db;

-- Create the tables with their attributes

-- Runners, Status & Routes have no foreign keys, so we can create them first
CREATE TABLE runners (
    runner_id       INT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100),
    middle_initial  CHAR(1),
    last_name       VARCHAR(100),
    email           VARCHAR(100),
    is_leader       BOOLEAN DEFAULT FALSE,
    pace_preference VARCHAR(100),
    distance_preference VARCHAR(100)
);

CREATE TABLE status (
    status_id           INT PRIMARY KEY,
    status_description  VARCHAR(100)
);

CREATE TABLE routes (
    route_id            INT AUTO_INCREMENT PRIMARY KEY,
    distance            DECIMAL(6,2)
);

-- Here is where dependencies start, so we have to create Routes before Route_Points
CREATE TABLE route_points (
    route_point_id  INT AUTO_INCREMENT PRIMARY KEY,
    route_id        INT NOT NULL,
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    route_index     INT,
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
);

-- Now we can create Runs and Run_Participation since all their foreign keys exist
CREATE TABLE runs (
    run_id          INT AUTO_INCREMENT PRIMARY KEY,
    leader_id       INT NOT NULL,
    run_route       INT NOT NULL,
    run_status_id   INT NOT NULL,
    name            VARCHAR(50),
    description     VARCHAR(250),
    pace            VARCHAR(20),
    date            DATE,
    start_time      TIME,
    FOREIGN KEY (leader_id) REFERENCES runners(runner_id),
    FOREIGN KEY (run_route) REFERENCES routes(route_id),
    FOREIGN KEY (run_status_id) REFERENCES status(status_id)
);

CREATE TABLE run_participation (
    participation_runner_id INT NOT NULL,
    participation_run_id    INT NOT NULL,
    PRIMARY KEY (participation_runner_id, participation_run_id),
    FOREIGN KEY (participation_runner_id) REFERENCES runners(runner_id),
    FOREIGN KEY (participation_run_id) REFERENCES runs(run_id)
);

-- Now lets populate some data into our tables

-- Runners
INSERT INTO runners(runner_id, first_name, middle_initial, last_name, email, 
    is_leader, pace_preference, distance_preference)
VALUES
(1, 'Jett', 'W', 'Morrow', 'jettmorrow@vt.edu', 1, '8-9', '3-15'),
(2, 'Adam', 'Z', 'Schantz', 'adams03@vt.edu', 1, '7-9', '3-26'),
(3, 'Emily', 'R', 'Nguyen', 'emily.nguyen@vt.edu', 0, '9-10', '2-6'),
(4, 'Liam', 'T', 'Chen', 'liam.chen@vt.edu', 0, '6-7', '5-20'),
(5, 'Sofia', 'M', 'Patel', 'sofia.patel@vt.edu', 1, '7-8', '4-13'),
(6, 'Noah', 'B', 'Johnson', 'noah.johnson@vt.edu', 0, '8-9', '3-10'),
(7, 'Ava', 'K', 'Davis', 'ava.davis@vt.edu', 0, '9-10', '2-5'),
(8, 'Ethan', 'J', 'Wilson', 'ethan.wilson@vt.edu', 1, '6-8', '5-26'),
(9, 'Olivia', 'L', 'Martinez', 'olivia.martinez@vt.edu', 0, '7-8', '3-8'),
(10, 'Mason', 'C', 'Brown', 'mason.brown@vt.edu', 0, '8-9', '4-10'),
(11, 'Isabella', 'P', 'Clark', 'isabella.clark@vt.edu', 0, '9-10', '3-6'),
(12, 'James', 'A', 'Lopez', 'james.lopez@vt.edu', 1, '6-7', '10-26'),
(13, 'Charlotte', 'D', 'Gonzalez', 'charlotte.gonzalez@vt.edu', 0, '8-9', '3-15'),
(14, 'Lucas', 'N', 'Perez', 'lucas.perez@vt.edu', 0, '7-8', '5-13'),
(15, 'Amelia', 'S', 'Hernandez', 'amelia.hernandez@vt.edu', 1, '9-10', '2-8'),
(16, 'Benjamin', 'E', 'Lewis', 'benjamin.lewis@vt.edu', 0, '8-9', '3-12'),
(17, 'Mia', 'F', 'Hall', 'mia.hall@vt.edu', 0, '7-8', '4-9'),
(18, 'Henry', 'G', 'Young', 'henry.young@vt.edu', 1, '6-7', '10-26'),
(19, 'Harper', 'Q', 'Allen', 'harper.allen@vt.edu', 0, '8-9', '3-10'),
(20, 'Alexander', 'V', 'King', 'alex.king@vt.edu', 1, '7-8', '5-20'),
(21, 'Nate', 'D', 'Williams', 'natewilliams@vt.edu', 1, '11-12', '2-3');

-- Status
INSERT INTO status (status_id, status_description)
VALUES
(1, 'Scheduled'),
(2, 'Completed'),
(3, 'Cancelled'),
(4, 'In Progress');

-- Routes
INSERT INTO routes (route_id, distance)
VALUES
(1, 5.0),
(2, 2.6),
(3, 4.6),
(4, 0.3),
(5, 2.1),
(6, 3.4),
(7, 1.3);

-- Route Points
INSERT INTO route_points (route_point_id, route_id, latitude, longitude, route_index)
VALUES
(1, 1, 37.235524, -80.422459, 0),
(2, 1, 37.229329, -80.413987, 1),
(3, 1, 37.217361, -80.419206, 2),
(4, 1, 37.231532, -80.428855, 3),
(5, 1, 37.233363, -80.425063, 4),
(6, 1, 37.235524, -80.422459, 5),

(7, 2, 37.224943, -80.413677, 0),
(8, 2, 37.217354, -80.419161, 1),
(9, 2, 37.209545, -80.423656, 2),
(10, 2, 37.207156, -80.418926, 3),

(11, 3, 37.224943, -80.413677, 0),
(12, 3, 37.217354, -80.419161, 1),
(13, 3, 37.209545, -80.423656, 2),
(14, 3, 37.214996, -80.428814, 3),
(15, 3, 37.213620, -80.442088, 4),
(16, 3, 37.214316, -80.442643, 5),
(17, 3, 37.214154, -80.443026, 6),
(18, 3, 37.214177, -80.444300, 7),
(19, 3, 37.216314, -80.449690, 8),
(20, 3, 37.217063, -80.450893, 9),
(21, 3, 37.216975, -80.451591, 10),
(22, 3, 37.216202, -80.451976, 11),

(23, 4, 37.223110, -80.412971, 0),
(24, 4, 37.222780, -80.412852, 1),
(25, 4, 37.222610, -80.412793, 2),
(26, 4, 37.222570, -80.412784, 3),
(27, 4, 37.222430, -80.412725, 4),
(28, 4, 37.222220, -80.412646, 5),
(29, 4, 37.221920, -80.412545, 6),
(30, 4, 37.221870, -80.412524, 7),
(31, 4, 37.221840, -80.412513, 8),
(32, 4, 37.221360, -80.412344, 9),
(33, 4, 37.221020, -80.412235, 10),
(34, 4, 37.220850, -80.412174, 11),
(35, 4, 37.220550, -80.412083, 12),
(36, 4, 37.220580, -80.412004, 13),

(37, 5, 37.238050, -80.430320, 0),
(38, 5, 37.238060, -80.430290, 1),
(39, 5, 37.238110, -80.430140, 2),
(40, 5, 37.238130, -80.430080, 3),
(41, 5, 37.238260, -80.429680, 4),
(42, 5, 37.238600, -80.429680, 5),
(43, 5, 37.238780, -80.429690, 6),
(44, 5, 37.239230, -80.429690, 7),
(45, 5, 37.239320, -80.429680, 8),
(46, 5, 37.239370, -80.429680, 9),

(47, 6, 37.222010, -80.423100, 0),
(48, 6, 37.221990, -80.423110, 1),
(49, 6, 37.221940, -80.423130, 2),
(50, 6, 37.221890, -80.423170, 3),
(51, 6, 37.221840, -80.423210, 4),
(52, 6, 37.222160, -80.423360, 5),
(53, 6, 37.222370, -80.423450, 6),
(54, 6, 37.222450, -80.423490, 7),
(55, 6, 37.222610, -80.423560, 8),
(56, 6, 37.222730, -80.423620, 9),
(57, 6, 37.222800, -80.423660, 10),
(58, 6, 37.222930, -80.423680, 11),
(59, 6, 37.223120, -80.423770, 12),

(60, 7, 37.226220, -80.416500, 0), 
(61, 7, 37.225930, -80.417320, 1),
(62, 7, 37.225830, -80.418310, 2),
(63, 7, 37.225970, -80.418490, 3),
(64, 7, 37.226200, -80.419090, 4),
(65, 7, 37.227030, -80.420300, 5),
(66, 7, 37.227270, -80.420760, 6),
(67, 7, 37.227850, -80.421500, 7),
(68, 7, 37.228400, -80.422180, 8),
(69, 7, 37.228640, -80.422180, 9);

-- Runs
INSERT INTO runs (run_id, leader_id, run_route, run_status_id, name, description, pace, date, start_time)
VALUES
(1, 1, 1, 1, 'Morning Easy Run Loop', 'A relaxed run to start the day', '09:00', '2026-01-01', '06:30:00'),
(2, 1, 2, 1, 'Interval Training', 'High-intensity intervals for speed', '07:00', '2025-12-02', '18:00:00'),
(3, 1, 3, 2, 'Long Distance Run', 'Endurance building long run', '08:15', '2024-07-03', '07:00:00'),
(4, 21, 4, 1, 'First Run in Weeks', 'Slow tempo run on Huckle Berry', '11:00', '2025-10-25', '07:15:00'),
(5, 8, 5, 2, 'Endurance Run', 'Climbing hills on a trail', '08:30', '2025-09-07', '08:00:00'),
(6, 12, 6, 4, 'Rain Run', 'Short run, so wet, wow such a wet run', '09:15', '2025-10-20', '18:30:00'),
(7, 21, 7, 3, 'Sprint Run', 'Sprinted to class.', '07:45', '2025-10-20', '13:00:00');

-- Run Participation
INSERT INTO run_participation (participation_runner_id, participation_run_id)
VALUES
(1, 1), (2, 1), (3, 1), (4, 1),
(1, 2), (5, 2), (6, 2),
(1, 3), (8, 3), (9, 3),
(21, 4), (20, 4),
(8, 5), (11, 5), (12, 5),
(12, 6),
(21, 7);
