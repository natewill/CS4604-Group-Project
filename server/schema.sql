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
    user_password   VARCHAR(200),
    is_leader       BOOLEAN DEFAULT FALSE,
    min_pace        INT, -- in seconds, easier for calculations
    max_pace       INT, -- in seconds, easier for calculations
    min_dist_pref INT,
    max_dist_pref INT
);

CREATE TABLE status (
    status_id           INT PRIMARY KEY,
    status_description  VARCHAR(100)
);

CREATE TABLE routes (
    route_id            INT AUTO_INCREMENT PRIMARY KEY,
    start_lat           DECIMAL(9,6),
    start_lng           DECIMAL(9,6),
    end_lat             DECIMAL(9,6),
    end_lng             DECIMAL(9,6),
    start_address       TEXT,
    end_address         TEXT,
    polyline            TEXT,
    distance            DECIMAL(6,2)
);

-- Now we can create Runs and Run_Participation since all their foreign keys exist
CREATE TABLE runs (
    run_id          INT AUTO_INCREMENT PRIMARY KEY,
    leader_id       INT NOT NULL,
    run_route       INT NOT NULL,
    run_status_id   INT NOT NULL,
    name            VARCHAR(50),
    description     VARCHAR(250),
    pace            INT,
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
INSERT INTO runners (runner_id, first_name, middle_initial, last_name, email, user_password,
   is_leader, min_pace, max_pace, min_dist_pref, max_dist_pref)
VALUES
(1, 'test', 't', 'test', 'test@test.com', '$argon2id$v=19$m=65536,t=2,p=1$J0EccGqYCUH1b1Q5sJPwcg$apQph3Am1eekXrnlfXEWgYP+bJ/xfqr+eb2imBYJP78', 0, 0, 0, 0, 0), -- test
(2, 'Jett', 'W', 'Morrow', 'jettmorrow@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$q+7h87Qi5iB8m1gNPBROGQ', 1, 480, 540, 3, 15), -- purpleGiraffe21! (8:00, 9:00)
(3, 'Adam', 'Z', 'Schantz', 'adams03@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$US/trwyeAJ7z+3gp+DCwXw', 1, 420, 540, 3, 26), -- coffee_and_code (7:00, 9:00)
(4, 'Emily', 'R', 'Nguyen', 'emily.nguyen@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$n/+K3wxq+LF4qhbKt/Gxyw,', 0, 540, 600, 2, 6), -- Sunny-day-1987 (9:00, 10:00)
(5, 'Liam', 'T', 'Chen', 'liam.chen@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$daWsC5sHSLEuFIzgmUz4tA', 0, 360, 420, 5, 20), -- iliketacos4eva (6:00, 7:00)
(6, 'Sofia', 'M', 'Patel', 'sofia.patel@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$GS6at2s7w3YozsnCr5nsuA', 1, 420, 480, 4, 13), -- MoonlightDrive77 (7:00, 8:00)
(7, 'Noah', 'B', 'Johnson', 'noah.johnson@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$ZvM7CvkdLLqGrBWrGiynWA', 0, 480, 540, 3, 10), -- blue.skies&88 (8:00, 9:00)
(8, 'Ava', 'K', 'Davis', 'ava.davis@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$rc6CwixWsUoaJWLucsOgEg', 0, 540, 600, 2, 5), -- green-hat7 (9:00, 10:00)
(9, 'Ethan', 'J', 'Wilson', 'ethan.wilson@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$NAf+nJiZkxxF68OxXqnnrw', 1, 360, 480, 5, 26), -- RedPineapple#5 (6:00, 8:00)
(10, 'Olivia', 'L', 'Martinez', 'olivia.martinez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$Tp1/qPncWZSNJ7G9GLJ7yA', 0, 420, 480, 3, 8), -- chocolate.monday9 (7:00, 8:00)
(11, 'Mason', 'C', 'Brown', 'mason.brown@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$e5kxpX1D0hDL/fQC6vBkNA', 0, 480, 540, 4, 10), -- dogeatdogworld12 (8:00, 9:00)
(12, 'Isabella', 'P', 'Clark', 'isabella.clark@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8Bndt/gryd5p4eOTO9YC8A', 0, 540, 600, 3, 6), -- walkthedog2nite! (9:00, 10:00)
(13, 'James', 'A', 'Lopez', 'james.lopez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$+8vZg9uAlQxN3TyZxzcclA', 1, 360, 420, 10, 26), -- slowCoffee_42 (6:00, 7:00)
(14, 'Charlotte', 'D', 'Gonzalez', 'charlotte.gonzalez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$yBT2S2O7qEJyNJX0ArBTng', 0, 480, 540, 3, 15), -- ticketToMars23 (8:00, 9:00)
(15, 'Lucas', 'N', 'Perez', 'lucas.perez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$dr92IHJxPDfQrWPNOGPUEg', 0, 420, 480, 5, 13), -- lazyRiver_1984 (7:00, 8:00)
(16, 'Amelia', 'S', 'Hernandez', 'amelia.hernandez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$CNNyOPZ+WE7wHAO7b64NMA', 1, 540, 600, 2, 8), -- bronze-rocket11 (9:00, 10:00)
(17, 'Benjamin', 'E', 'Lewis', 'benjamin.lewis@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$SvgerouohOb6xd+ScEMGfA', 0, 480, 540, 3, 12), -- quiet+library7 (8:00, 9:00)
(18, 'Mia', 'F', 'Hall', 'mia.hall@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$GOY0tgX0obhooyw40m6f+Q', 0, 420, 480, 4, 9), -- sk8boarder_1995 (7:00, 8:00)
(19, 'Henry', 'G', 'Young', 'henry.young@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$OdhJBdhfCBjrht2zjiyvZA', 1, 360, 420, 10, 26), -- paperclips&dreams (6:00, 7:00)
(20, 'Harper', 'Q', 'Allen', 'harper.allen@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$29Ppdbdu8sLo1mi8Ya+/vw', 0, 480, 540, 3, 10), -- fuzzyBlanket#3 (8:00, 9:00)
(21, 'Alexander', 'V', 'King', 'alex.king@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$3cPUrQ+yTPNG7Q6u7bJy3w', 1, 420, 480, 5, 20), -- city-lights_9pm (7:00, 8:00)
(22, 'Nate', 'D', 'Williams', 'natewilliams@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8ifrTk+98PBcbldrTtgjhA', 1, 660, 720, 2, 3); -- trainspotter_06 (11:00, 12:00)

-- Status
INSERT INTO status (status_id, status_description)
VALUES
(1, 'Scheduled'),
(2, 'Completed'),
(3, 'Cancelled'),
(4, 'In Progress');

-- Routes
INSERT INTO routes (route_id, start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance)
VALUES
(1, 37.2571436, -80.45672929999999, 37.2413297, -80.4123084, "3022 Edison Ln, Blacksburg, VA 24060", "920 Turner St, Blacksburg, VA 24060" ,"okhbFftajNJ@XJHAHETu@LKPD`@TRRFKLGXDbAn@\\VLh@P`BJVBBFQNi@BUGk@?k@T}@HyBP}ALo@d@wAp@_ELy@P]DEJ?HFBHFt@@JFDB?@KJqALqANaAJa@T_AHk@DgHBmG?_C@i@L_BT{AViBJk@XiAPm@Jc@F[AYD}@@}@AcAMgAKe@Y_AQkAG_AAaD?{ICaJBmBNmAZeARk@v@aDx@mDHu@FuBFmC@k@E_AEQBALEzCoApB{@vAi@lAe@bBq@G]z@]DAFG?KEu@LA?iBEACm@D?Du@HaBBa@H[HuAHgAC]D}@Fq@?aACaASiBOy@o@kB_B_Eg@sAPMNKM[Mg@m@aBo@{AU]Wy@Sq@WiCSgBAEHCLGHO`@_C`AqFfAcGNy@`@qA@KLSXm@B]ESq@cAo@cAq@oACEHOMQKL]a@_@e@oA_BcBiBsBeC{EaGbAyABKIeCc@kLCoAe@e@{@o@SQUc@Uy@AU?WDQtBsBb@m@DI][s@o@eCqBcAiAm@eAu@iBy@sB_A}BiDuIcHiQs@_Bo@y@yAcAu@o@o@o@U[e@y@c@sAOi@Ee@GaAIoE?yA@mDIkDOq@GMeAgAgAeAaAgAYYs@a@m@Qa@GYAM@]B?TFx@CRIPs@^a@Pm@HeBK{@Iq@Q[USc@_AyBk@kAq@m@m@]c@EqBD", 4.165672472759087),
(2, 37.2397738, -80.4309147, 37.220263, -80.4065775, "Broce Drive at Elizabeth Drive", "1002 Draper Road, Blacksburg, VA 24060" ,"qkhbFdd|iNQ?c@K[UQa@M{@KmAg@{Es@eHLCEUpBQz@MxEcAc@sBi@}BQk@U[Y]][OMJYJYPWj@g@pC_ChIyGzCcCLM?MAWFc@ZCJCn@UbAc@DIFMHKLEXWR_@R]NI^o@Ze@TWpAkBNRLSn@}@bAwArEwGPQ^k@^a@\SlAy@JIREtAeATm@n@q@pB{BxEaF~BiC`@_@R\l@dAFBRMPZv@}@h@a@b@URIn@Ud@WTUv@{@jBwBxDiEbH{HhCwCpD}Dv@{@VY\a@p@`AHJ", 2.2816750178954903),
(3, 37.1980533, -80.3877827, 37.2235723, -80.43721060000001, "1401 Cedar Run Road, Blacksburg, VA 24060", "3190 Oak Lane, Blacksburg, VA 24060" ,"yf`bFrvsiNKp@Ed@HdCCp@Mx@Sj@MPQNm@XoA`@o@f@Yd@Sn@ObA_@hF_B~Hm@jDUfAWr@g@z@e@b@g@b@e@XSNkB|@o@TgCb@sCf@kABoA@qAA_AOq@SwAk@e@Ge@Bc@JqAl@iAd@kBv@o@h@OXWZSLUVa@`@kAfAg@h@ITAT@^FAAn@?ZBv@Ah@Mn@M\QX[Zg@^UX]~@Ej@ARDf@X`Bt@nDb@bBx@hC`@zA?ZMTQFu@Gq@C}ADcAPsBl@eB|@uB~AoEzCkDhCc@\g@Xm@Xk@LeAJy@Dw@ByADoDJ?TM??ZA`@AHQpAKx@e@|F]dFInAEp@AbADjADt@PbA`@pAt@pBb@tAFXFn@@j@Cl@StAa@dB]|AKbA?~@Al@Hr@XpBp@dF^rCJRl@tEBx@Cj@Gx@O|@Up@Yj@Yb@W^]VaAr@_C~AsErCwCjBQJGTCJOVWTUZ]l@Wf@?JgAn@k@ZIBSAYNmCxBI^IFQIICM@k@Pa@Ne@FYJ]RMPCR@NJJLJw@bBiAfC`BvAfA~@T^F\?^G`@O\uD|Fk@fAYt@SlAEfBA~@AjAA`D?t@^A`AARJh@f@VBTJLTBHTKD?@?", 4.199226517139903);
-- Runs
INSERT INTO runs (run_id, leader_id, run_route, run_status_id, name, description, pace, date, start_time)
VALUES
(1, 2, 1, 1, 'Morning Easy Run Loop', 'A relaxed run to start the day', 540, '2026-01-01', '06:30:00'), -- 9:00 = 540 seconds (leader_id 2 = Jett, shifted from 1)
(2, 2, 2, 1, 'Interval Training', 'High-intensity intervals for speed', 420, '2025-12-02', '18:00:00'), -- 7:00 = 420 seconds (leader_id 2 = Jett)
(3, 2, 3, 2, 'Long Distance Run', 'Endurance building long run', 495, '2024-07-03', '07:00:00'), -- 8:15 = 495 seconds (leader_id 2 = Jett)
(4, 22, 1, 1, 'First Run in Weeks', 'Slow tempo run on Huckle Berry', 660, '2025-10-25', '07:15:00'), -- 11:00 = 660 seconds (leader_id 22 = Nate, shifted from 21)
(5, 9, 2, 2, 'Endurance Run', 'Climbing hills on a trail', 510, '2025-09-07', '08:00:00'), -- 8:30 = 510 seconds (leader_id 9 = Ethan, shifted from 8)
(6, 13, 3, 4, 'Rain Run', 'Short run, so wet, wow such a wet run', 555, '2025-10-20', '18:30:00'), -- 9:15 = 555 seconds (leader_id 13 = James, shifted from 12)
(7, 22, 1, 3, 'Sprint Run', 'Sprinted to class.', 465, '2025-10-20', '13:00:00'); -- 7:45 = 465 seconds (leader_id 22 = Nate)

-- Run Participation
INSERT INTO run_participation (participation_runner_id, participation_run_id)
VALUES
(2, 1), (3, 1), (4, 1), (5, 1), -- shifted from (1,1), (2,1), (3,1), (4,1)
(2, 2), (6, 2), (7, 2), -- shifted from (1,2), (5,2), (6,2)
(2, 3), (9, 3), (10, 3), -- shifted from (1,3), (8,3), (9,3)
(22, 4), (21, 4), -- shifted from (21,4), (20,4)
(9, 5), (12, 5), (13, 5), -- shifted from (8,5), (11,5), (12,5)
(13, 6), -- shifted from (12,6)
(22, 7); -- shifted from (21,7)