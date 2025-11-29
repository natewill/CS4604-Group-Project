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
    is_admin        BOOLEAN DEFAULT FALSE,
    min_pace        INT, -- in seconds, easier for calculations
    max_pace        INT, -- in seconds, easier for calculations
    min_dist_pref   INT,
    max_dist_pref   INT
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
    name            VARCHAR(50),
    description     VARCHAR(250),
    pace            INT,
    date            DATE,
    start_time      TIME,
    FOREIGN KEY (leader_id) REFERENCES runners(runner_id),
    FOREIGN KEY (run_route) REFERENCES routes(route_id)
);

CREATE TABLE run_participation (
    participation_runner_id INT NOT NULL,
    participation_run_id    INT NOT NULL,
    PRIMARY KEY (participation_runner_id, participation_run_id),
    FOREIGN KEY (participation_runner_id) REFERENCES runners(runner_id),
    FOREIGN KEY (participation_run_id) REFERENCES runs(run_id)
);

CREATE TABLE saved_routes (
    runner_id INT NOT NULL,
    route_id  INT NOT NULL,
    PRIMARY KEY (runner_id, route_id),
    FOREIGN KEY (runner_id) REFERENCES runners(runner_id)
        ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
        ON DELETE CASCADE
);


-- Now lets populate some data into our tables

-- Runners
INSERT INTO runners (runner_id, first_name, middle_initial, last_name, email, user_password,
   is_leader, is_admin, min_pace, max_pace, min_dist_pref, max_dist_pref)
VALUES
(1, 'test', 't', 'test', 'test@test.com', '$argon2id$v=19$m=65536,t=2,p=1$J0EccGqYCUH1b1Q5sJPwcg$apQph3Am1eekXrnlfXEWgYP+bJ/xfqr+eb2imBYJP78', 1, 1, 100, 1000, 0, 12), -- test
(2, 'Jett', 'W', 'Morrow', 'jettmorrow@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$q+7h87Qi5iB8m1gNPBROGQ', 1, 0, 480, 540, 1, 12), -- purpleGiraffe21! (8:00, 9:00)
(3, 'Adam', 'Z', 'Schantz', 'adams03@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$US/trwyeAJ7z+3gp+DCwXw', 1, 0, 420, 540, 1, 12), -- coffee_and_code (7:00, 9:00)
(4, 'Emily', 'R', 'Nguyen', 'emily.nguyen@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$n/+K3wxq+LF4qhbKt/Gxyw', 0, 0, 540, 600, 0, 2), -- Sunny-day-1987 (9:00, 10:00)
(5, 'Liam', 'T', 'Chen', 'liam.chen@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$daWsC5sHSLEuFIzgmUz4tA', 0, 0, 360, 420, 0, 1), -- iliketacos4eva (6:00, 7:00)
(6, 'Sofia', 'M', 'Patel', 'sofia.patel@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$GS6at2s7w3YozsnCr5nsuA', 1, 0, 420, 480, 0, 2), -- MoonlightDrive77 (7:00, 8:00)
(7, 'Noah', 'B', 'Johnson', 'noah.johnson@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$ZvM7CvkdLLqGrBWrGiynWA', 0, 0, 480, 540, 0, 2), -- blue.skies&88 (8:00, 9:00)
(8, 'Ava', 'K', 'Davis', 'ava.davis@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$rc6CwixWsUoaJWLucsOgEg', 0, 0, 540, 600, 0, 1), -- green-hat7 (9:00, 10:00)
(9, 'Ethan', 'J', 'Wilson', 'ethan.wilson@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$NAf+nJiZkxxF68OxXqnnrw', 1, 0, 360, 480, 1, 12), -- RedPineapple#5 (6:00, 8:00)
(10, 'Olivia', 'L', 'Martinez', 'olivia.martinez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$Tp1/qPncWZSNJ7G9GLJ7yA', 0, 0, 420, 480, 0, 2), -- chocolate.monday9 (7:00, 8:00)
(11, 'Mason', 'C', 'Brown', 'mason.brown@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$e5kxpX1D0hDL/fQC6vBkNA', 0, 0, 480, 540, 0, 2), -- dogeatdogworld12 (8:00, 9:00)
(12, 'Isabella', 'P', 'Clark', 'isabella.clark@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8Bndt/gryd5p4eOTO9YC8A', 0, 0, 540, 600, 0, 1), -- walkthedog2nite! (9:00, 10:00)
(13, 'James', 'A', 'Lopez', 'james.lopez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$+8vZg9uAlQxN3TyZxzcclA', 1, 0, 360, 420, 1, 12), -- slowCoffee_42 (6:00, 7:00)
(14, 'Charlotte', 'D', 'Gonzalez', 'charlotte.gonzalez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$yBT2S2O7qEJyNJX0ArBTng', 0, 0, 480, 540, 0, 2), -- ticketToMars23 (8:00, 9:00)
(15, 'Lucas', 'N', 'Perez', 'lucas.perez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$dr92IHJxPDfQrWPNOGPUEg', 0, 0, 420, 480, 0, 2), -- lazyRiver_1984 (7:00, 8:00)
(16, 'Amelia', 'S', 'Hernandez', 'amelia.hernandez@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$CNNyOPZ+WE7wHAO7b64NMA', 1, 0, 540, 600, 0, 2), -- bronze-rocket11 (9:00, 10:00)
(17, 'Benjamin', 'E', 'Lewis', 'benjamin.lewis@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$SvgerouohOb6xd+ScEMGfA', 0, 0, 480, 540, 0, 2), -- quiet+library7 (8:00, 9:00)
(18, 'Mia', 'F', 'Hall', 'mia.hall@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$GOY0tgX0obhooyw40m6f+Q', 0, 0, 420, 480, 0, 2), -- sk8boarder_1995 (7:00, 8:00)
(19, 'Henry', 'G', 'Young', 'henry.young@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$OdhJBdhfCBjrht2zjiyvZA', 1, 0, 360, 420, 1, 12), -- paperclips&dreams (6:00, 7:00)
(20, 'Harper', 'Q', 'Allen', 'harper.allen@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$29Ppdbdu8sLo1mi8Ya+/vw', 0, 0, 480, 540, 0, 2), -- fuzzyBlanket#3 (8:00, 9:00)
(21, 'Alexander', 'V', 'King', 'alex.king@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$3cPUrQ+yTPNG7Q6u7bJy3w', 1, 0, 420, 480, 1, 12), -- city-lights_9pm (7:00, 8:00)
(22, 'Nate', 'D', 'Williams', 'natewilliams@vt.edu', '$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8ifrTk+98PBcbldrTtgjhA', 1, 0, 660, 720, 0, 1), -- trainspotter_06 (11:00, 12:00)
(23, 'Alex', 'R', 'Shaw', 'ashaw4@vt.edu', '$argon2id$v=19$m=65536,t=2,p=1$zizQWPgquPuhcbaKSpyIdA$vvSvw/Y1Ac9XBXM95dUTcKsUjI5bcsOLeiM0n4yRDME', 1, 0, 360, 540, 0, 12); -- BottomlandBucks25! (6:00, 9:00)

-- Routes
INSERT INTO routes (route_id, start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance)
VALUES
(1, 37.22096136175444, -80.41767133859247, 37.21705118732746, -80.42387260583492, NULL, NULL, "_vdbFlqyiN??DbD@xA?b@l@Rj@LCV@@l@D\\?@f@j@C^Ej@O`@QPIl@Qh@Ef@?xBLz@Iv@SBRJr@d@pD^rCJRl@tEBx@E`AM`AQx@Wl@IPEE", 0.625099419390758),
(2, 37.22259368164011, -80.41462698623396, 37.235332283333776, -80.4339833586467, "508 Center St, Blacksburg, VA 24060, USA", "880 University City Blvd, Blacksburg, VA 24060, USA", "e`ebFl~xiNLG[iBq@RoAnAoBqCU_@i@h@G@IKYe@uAvAaBfBr@lAs@x@[\\wB|Bu@v@HNX\\\\^Db@TbE@XFf@APAHSFKBDLDTBRk@z@aA|AoBdDk@|@AJAPk@v@?PG^c@fCWrBIfA@b@@H[\\QTY`@EpBNVOP^n@q@`AQVVvAJr@IJSXE@CHGPa@h@a@j@AFJHRXx@rAc@XcE|Cm@d@DFcAt@SVQ^INSHo@@UJeAz@ILIb@?j@BxBEhAKxAQjDI`B@`@IJAP?REA?No@??Eu@I{D_@WCUBy@\\gAb@gEbBcBp@BH", 1.8578998647896285),
(3, 37.21504039814764, -80.57772250021522, 37.25258121247644, -80.40926037204012, NULL, "1700 October Glory Ct, Blacksburg, VA 24060, USA", "_qcbFvyxjNN?M_M@QImACk@Ik@O}@aAqD[eAQ_AGWG{@AoBFaAFk@Lk@l@mBJBh@u@b@u@nGwK|@cBf@gAl@aBd@mBb@_C\\iC|BcTvB_SpAwLn@gGFw@TkBXgCPs@\\kA^w@r@aAzBiB`BwAPUZm@Vi@X_ATaA~AaI\\gBNeAHsA@yACqAMwAgAqIwCqTKoA?[By@Fg@T{@n@yBVmAFs@D_AEqAm@iF_@}B_@qAg@yAKm@Ec@?oAJaFPmIB}BEuAOiBO_Aa@qCe@{DQmDCyEDwCBmAJiAr@sDH{@?gAOuB[qAQa@g@o@y@}@[_@Ua@[o@UeAMiAAeAHgARq@Tg@NWz@o@\\WzAeAxAiAVYJQXm@Nk@Hi@Da@Ay@K}@sAsFgAuCc@oA[cBCs@?cBP{H?wAIqAQqBAmAFsAh@cCNcABw@Ao@OmBI_AIsACy@FoBNqBVwBb@wDVoDPuD@URuBz@qEP_AICB_CBeC@eBFuAFOZa@_@{@w@eCe@}B]uCIcAUsAIa@Um@m@cBgBuEYk@k@uAmAkCo@mAeA}Bg@_BAe@[yASwAKWIm@G{@SgCSwC]aDUiC@YE_@Mk@OuAG_@Iu@SqCMcCBgA@CBABSAEIMECOw@CK@YYqEG_@Aq@[sC[_ByAeHoBiJkB_JyAsGaBeGQaBAWBU?m@AuB@m@McCMyAYyFB[IkBK{@Am@AcGF]AuAGq@I_BGk@Mq@aB{HA[YsAMUmAqFYkAMe@eBoFyBoGc@y@a@k@m@o@iAu@}@]w@OqAK{@Qw@[w@i@aEeDmAeA{@iAmDqJqCyGDICIISI@}@aCOe@]wA[yB?YUaBMW_@sCOiAi@}C{@cDa@iAm@sAm@_AiAuAwAqA[WBK_Ak@c@[kA{@mAmAs@aA}@gBuCoFiCaF_@}@a@gBMaAC{@C_A@aAAe@JsBXmGBGQA[EFsADe@AwAGgAWcB[oAaAaC}AeEk@uAi@mAy@yBUi@C@EMGUBAQs@_@qDUgBaAaF[oAi@mAe@{@[YQII@KDK@OEw@C[Nc@L{@LM_@c@Bo@?y@Ie@Oi@QE?DCUMEDy@a@qAk@_A]{@]{Au@w@]cAo@{@e@{AaA{BuAmIoFkJcGoD_CWWsA}@o@_@UQcBaA{A{@qD}B{AcAcGyDc@WQQUMcCoAe@SMGEBeA[e@UuAUeAOw@Ie@?yBM{@CAQIwAMeCCg@V@@a@F?zBHnDL?G", 11.27353754076195),
(4, 37.12016601477111, -80.41534425533752, 37.12489325093288, -80.40506903427126, "900 2nd St, Christiansburg, VA 24073, USA", NULL, "a`qaFzbyiN@BSHM?i@m@eCgDyAgBcB{BuAgBw@y@_@j@i@y@}@wAk@s@{C{C{AiBk@u@wAyAk@m@q@}@}BqCgEgF_AgASW@Cz@kA~AyBfBaC|@aABADDZ^TVRJL@|DDr@??C", 1.0414181181897717),
(5, 37.22346292172574, -80.4111172851437, 37.22641066454011, -80.41483486769808, "700 Preston Ave, Blacksburg, VA 24060, USA", "210 Otey St NW, Blacksburg, VA 24060, USA", "seebFnhxiNAAyHxIg@l@MTG?g@OQEOKAIOCSRSQQUk@}@_AbAGt@ELCJTb@?HINDT?LCFQPERKTbAfBVb@ED??", 0.42004692595243776),
(6, 37.22503356353592, -80.43909966945648, 37.228628772761354, -80.42666188095093, "2965 Oak Ln, Blacksburg, VA 24061, USA", NULL, "moebFjw}iNQk@h@W@IAMSKOQOe@EU?WB[LW\\_@FQBICCA??AACACAG@GDKJED?LaBO@?O?oABqC?{ABwAJiAXiAJWXk@xA}BtBgDJ_@Ba@C_@K[e@g@o@i@{BoB]o@K_@QBY?]OYUyA_Bq@a@u@[UQ]g@[s@OS[UYIgASk@Wk@e@SYQg@Gy@?IKBW@QC[OIICBSa@i@w@HM", 0.9587757496222062),
(7, 37.22392789435463, -80.41417497015748, 37.22968085352038, -80.42493787437438, "400 Houston St, Blacksburg, VA 24060, USA", "Burke Johnston Student Center, 922 W Campus Dr, Blacksburg, VA 24061, USA", "qhebFp{xiNCE^g@OUU_@i@h@G@CC_@m@mCpCi@l@r@lAs@x@[\\qAtA{A~Ab@l@\\^Db@TbEHv@AZAHKBGBKBDLDTBRmBxCoBdDk@|@AJAPk@v@{BzCaC~Cm@r@e@l@LP}@fAm@r@HLe@l@d@r@_@d@^l@FP?DONGK", 0.9320567883560009);
-- Runs
INSERT INTO runs (run_id, leader_id, run_route, name, description, pace, date, start_time)
VALUES
(1, 2, 1, 'Morning Easy Run Loop', 'A relaxed run to start the day', 540, '2026-01-01', '06:30:00'),
(2, 2, 2, 'Interval Training', 'High-intensity intervals for speed', 420, '2025-12-02', '18:00:00'),
(3, 2, 3, 'Long Distance Run', 'Endurance building long run', 495, '2024-07-03', '07:00:00'),
(4, 22, 4, 'First Run in Weeks', 'Slow tempo run on Huckle Berry', 660, '2025-10-25', '07:15:00'),
(5, 9, 5, 'Endurance Run', 'Climbing hills on a trail', 510, '2025-09-07', '08:00:00'),
(6, 13, 6, 'Rain Run', 'Short run, so wet, wow such a wet run', 555, '2025-10-20', '18:30:00'),
(7, 22, 7, 'Sprint Run', 'Sprinted to class.', 465, '2025-10-20', '13:00:00'),
(8, 1, 1, 'Morning Easy Run Loop', 'A relaxed run to start the day', 540, '2024-01-01', '06:30:00'),
(9, 1, 1, 'Night Run', 'running at night wooo', 540, '2025-01-01', '06:30:00'),
(10, 3, 2, 'Weekend Long Run', 'Saturday morning long distance training', 480, '2025-12-14', '07:00:00'),
(11, 6, 1, 'Sunrise Run', 'Early morning run to catch the sunrise', 510, '2025-12-18', '06:00:00'),
(12, 9, 3, 'Trail Adventure', 'Exploring scenic trails around campus', 540, '2025-12-21', '08:30:00'),
(13, 13, 5, 'Tempo Tuesday', 'Moderate pace tempo run', 450, '2025-12-23', '17:00:00'),
(14, 16, 4, 'Holiday Run', 'Stay active during the holidays', 600, '2025-12-25', '09:00:00'),
(15, 19, 6, 'New Year Prep', 'Getting ready for the new year', 495, '2025-12-28', '07:30:00'),
(16, 21, 2, 'Evening Group Run', 'Social run with the group', 540, '2025-12-30', '18:00:00'),
(17, 22, 7, 'New Year Run', 'Start the year right with a run', 660, '2026-01-02', '08:00:00'),
(18, 23, 1, 'Morning Recovery Run', 'Easy pace recovery after hard training', 600, '2026-01-05', '06:45:00'),
(19, 2, 3, 'Weekend Warrior', 'Long weekend training session', 480, '2026-01-11', '07:15:00');


INSERT INTO saved_routes (runner_id, route_id)
VALUES
(2, 1),
(2, 2),
(2, 3),
(22, 4),
(9, 5),
(13, 6),
(22, 7);

-- Run Participation
INSERT INTO run_participation (participation_runner_id, participation_run_id)
VALUES
-- Run 1: Morning Easy Run Loop (leader: 2) - 16 participants
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (10, 1), (11, 1), (12, 1), (14, 1), (15, 1), (17, 1), (18, 1), (20, 1),
-- Run 2: Interval Training (leader: 2) - 13 participants
(1, 2), (2, 2), (3, 2), (5, 2), (6, 2), (7, 2), (9, 2), (11, 2), (13, 2), (15, 2), (17, 2), (19, 2), (21, 2),
-- Run 3: Long Distance Run (leader: 2) - 11 participants
(1, 3), (2, 3), (3, 3), (5, 3), (9, 3), (10, 3), (13, 3), (15, 3), (17, 3), (19, 3), (21, 3),
-- Run 4: First Run in Weeks (leader: 22) - 9 participants
(1, 4), (22, 4), (21, 4), (20, 4), (19, 4), (18, 4), (17, 4), (16, 4), (15, 4),
-- Run 5: Endurance Run (leader: 9) - 12 participants
(1, 5), (9, 5), (3, 5), (5, 5), (6, 5), (10, 5), (12, 5), (13, 5), (15, 5), (17, 5), (19, 5), (21, 5),
-- Run 6: Rain Run (leader: 13) - 10 participants
(1, 6), (13, 6), (14, 6), (15, 6), (16, 6), (17, 6), (18, 6), (19, 6), (20, 6), (21, 6),
-- Run 7: Sprint Run (leader: 22) - 14 participants
(1, 7), (22, 7), (2, 7), (3, 7), (5, 7), (6, 7), (7, 7), (9, 7), (11, 7), (13, 7), (15, 7), (17, 7), (19, 7), (21, 7),
-- Run 8: Morning Easy Run Loop (leader: 1) - 15 participants
(1, 8), (2, 8), (3, 8), (4, 8), (5, 8), (6, 8), (7, 8), (9, 8), (10, 8), (11, 8), (12, 8), (13, 8), (14, 8), (15, 8),
-- Run 9: Night Run (leader: 1) - 14 participants
(1, 9), (2, 9), (3, 9), (4, 9), (5, 9), (6, 9), (7, 9), (8, 9), (10, 9), (11, 9), (12, 9), (13, 9), (14, 9),
-- Run 10: Weekend Long Run (leader: 3) - 12 participants
(1, 10), (3, 10), (2, 10), (5, 10), (9, 10), (13, 10), (19, 10), (21, 10), (6, 10), (7, 10), (11, 10), (15, 10),
-- Run 11: Sunrise Run (leader: 6) - 14 participants
(1, 11), (6, 11), (2, 11), (3, 11), (4, 11), (5, 11), (7, 11), (8, 11), (10, 11), (11, 11), (12, 11), (14, 11), (15, 11), (17, 11),
-- Run 12: Trail Adventure (leader: 9) - 10 participants
(1, 12), (9, 12), (2, 12), (3, 12), (5, 12), (13, 12), (19, 12), (21, 12), (23, 12), (6, 12),
-- Run 13: Tempo Tuesday (leader: 13) - 11 participants
(1, 13), (13, 13), (2, 13), (3, 13), (5, 13), (6, 13), (9, 13), (11, 13), (15, 13), (19, 13), (21, 13),
-- Run 14: Holiday Run (leader: 16) - 15 participants
(1, 14), (16, 14), (2, 14), (3, 14), (4, 14), (5, 14), (6, 14), (7, 14), (8, 14), (10, 14), (11, 14), (12, 14), (14, 14), (15, 14), (17, 14),
-- Run 15: New Year Prep (leader: 19) - 13 participants
(1, 15), (19, 15), (2, 15), (3, 15), (5, 15), (6, 15), (9, 15), (13, 15), (15, 15), (17, 15), (21, 15), (23, 15), (7, 15),
-- Run 16: Evening Group Run (leader: 21) - 16 participants
(1, 16), (21, 16), (2, 16), (3, 16), (4, 16), (5, 16), (6, 16), (7, 16), (9, 16), (10, 16), (11, 16), (12, 16), (14, 16), (15, 16), (17, 16), (18, 16),
-- Run 17: New Year Run (leader: 22) - 12 participants
(1, 17), (22, 17), (2, 17), (3, 17), (4, 17), (5, 17), (6, 17), (7, 17), (8, 17), (10, 17), (11, 17), (12, 17),
-- Run 18: Morning Recovery Run (leader: 23) - 13 participants
(1, 18), (23, 18), (2, 18), (3, 18), (4, 18), (5, 18), (6, 18), (7, 18), (8, 18), (10, 18), (11, 18), (12, 18), (14, 18),
-- Run 19: Weekend Warrior (leader: 2) - 11 participants
(1, 19), (2, 19), (3, 19), (5, 19), (9, 19), (13, 19), (19, 19), (21, 19), (23, 19), (6, 19), (15, 19);
