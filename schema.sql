-- SQL Schema to initialize our tables and their attributes!

-- Drop Database if it exists
DROP DATABASE IF EXISTS cache_me_if_you_can_db;
CREATE DATABASE cache_me_if_you_can_db;
USE cache_me_if_you_can_db;

-- Create the tables with their attributes
CREATE TABLE Runners (
    Runner_ID       INT AUTO_INCREMENT PRIMARY KEY,
    First_Name      VARCHAR(100),
    Middle_Initial  CHAR(1),
    Last_Name       VARCHAR(100),
    Email           VARCHAR(100),
    Is_Leader       BOOLEAN DEFAULT FALSE,
    Pace_Preference VARCHAR(100),
    Distance_Preference VARCHAR(100)
);

CREATE TABLE Runs (
    Run_ID          INT AUTO_INCREMENT PRIMARY KEY,
    Leader_ID       INT NOT NULL,
    Run_Route       INT NOT NULL,
    Run_Status_ID   INT NOT NULL,
    Name            VARCHAR(50),
    Description     VARCHAR(250),
    Pace            VARCHAR(20),
    Date            DATE,
    Start_Time      TIME,
    FOREIGN KEY (Leader_ID) REFERENCES Runner(Runner_ID),
    FOREIGN KEY (Run_Route) REFERENCES Route(Route_ID),
    FOREIGN KEY (Run_Status_ID) REFERENCES Status(Status_ID)
);

CREATE TABLE Run_Participation (
    Participation_Runner_ID INT NOT NULL,
    Participation_Run_ID    INT NOT NULL,
    PRIMARY KEY (Participation_Runner_ID, Participation_Run_ID),
    FOREIGN KEY (Participation_Runner_ID) REFERENCES Runner(Runner_ID),
    FOREIGN KEY (Participation_Run_ID) REFERENCES Run(Run_ID)
);

CREATE TABLE Locations (
    Location_ID     INT AUTO_INCREMENT PRIMARY KEY,
    Street_Addr     VARCHAR(100),
    City            VARCHAR(100),
    State           VARCHAR(100),
    Zip_Code        VARCHAR(10)
);

CREATE TABLE Routes (
    Route_ID            INT AUTO_INCREMENT PRIMARY KEY,
    Starting_Location   INT NOT NULL,
    Ending_Location     INT NOT NULL,
    Distance            DECIMAL(6,2),
    FOREIGN KEY (Starting_Location) REFERENCES Location(Location_ID),
    FOREIGN KEY (Ending_Location) REFERENCES Location(Location_ID)
);

CREATE TABLE Route_Points (
    Route_Point_ID  INT AUTO_INCREMENT PRIMARY KEY,
    Route_ID        INT NOT NULL,
    Latitude        DECIMAL(9,6),
    Longitude       DECIMAL(9,6),
    FOREIGN KEY (Route_ID) REFERENCES ROUTE(ROUTE_ID)
);

CREATE TABLE Status (
    Status_ID           INT PRIMARY KEY,
    Status_Description  VARCHAR(100)
);

-- Now lets populate some data into our tables

-- Runners
INSERT INTO RUNNERS(Runner_ID, First_Name, Middle_Initial, Last_Name, Email, 
    Is_Leader, Pace_Preference, Distance_Preference)
VALUES
(1, 'Jett', 'W', 'Morrow', 'jettmorrow@vt.edu', 1, '8-9 min/mile', '3-15 miles'),
(2, 'Adam', 'Z', 'Schantz', 'adams03@vt.edu', 1, '7-9 min/mile', '3-26 miles'),
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
(20, 'Alexander', 'V', 'King', 'alex.king@vt.edu', 1, '7-8', '5-20');

-- Runs
INSERT INTO Runs (Run_ID, Leader_ID, Run_Route, Run_Status_ID, Name, Description, Pace, Date, Start_Time)
VALUES

-- Run Participation
INSERT INTO Run_Participation (Participation_Runner_ID, Participation_Run_ID)
VALUES

-- Locations
INSERT INTO Locations (Location_ID, Street_Addr, City, State, Zip_Code)
VALUES


-- Routes
INSERT INTO Routes (Route_ID, Starting_Location, Ending_Location, Distance)
VALUES

-- Route Points
INSERT INTO Route_Points (Route_Point_ID, Route_ID, Latitude, Longitude)
VALUES

-- Status
INSERT INTO Status (Status_ID, Status_Description)
VALUES
(1, 'Scheduled'),
(2, 'Completed'),
(3, 'Cancelled'),