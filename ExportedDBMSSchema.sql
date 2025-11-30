-- MySQL dump 10.13  Distrib 9.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: cache_me_if_you_can_db
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `route_id` int NOT NULL AUTO_INCREMENT,
  `start_lat` decimal(9,6) DEFAULT NULL,
  `start_lng` decimal(9,6) DEFAULT NULL,
  `end_lat` decimal(9,6) DEFAULT NULL,
  `end_lng` decimal(9,6) DEFAULT NULL,
  `start_address` text,
  `end_address` text,
  `polyline` text,
  `distance` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`route_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (1,37.220961,-80.417671,37.217051,-80.423873,NULL,NULL,'_vdbFlqyiN??DbD@xA?b@l@Rj@LCV@@l@D\\?@f@j@C^Ej@O`@QPIl@Qh@Ef@?xBLz@Iv@SBRJr@d@pD^rCJRl@tEBx@E`AM`AQx@Wl@IPEE',0.63),(2,37.222594,-80.414627,37.235332,-80.433983,'508 Center St, Blacksburg, VA 24060, USA','880 University City Blvd, Blacksburg, VA 24060, USA','e`ebFl~xiNLG[iBq@RoAnAoBqCU_@i@h@G@IKYe@uAvAaBfBr@lAs@x@[\\wB|Bu@v@HNX\\\\^Db@TbE@XFf@APAHSFKBDLDTBRk@z@aA|AoBdDk@|@AJAPk@v@?PG^c@fCWrBIfA@b@@H[\\QTY`@EpBNVOP^n@q@`AQVVvAJr@IJSXE@CHGPa@h@a@j@AFJHRXx@rAc@XcE|Cm@d@DFcAt@SVQ^INSHo@@UJeAz@ILIb@?j@BxBEhAKxAQjDI`B@`@IJAP?REA?No@??Eu@I{D_@WCUBy@\\gAb@gEbBcBp@BH',1.86),(3,37.215040,-80.577723,37.252581,-80.409260,NULL,'1700 October Glory Ct, Blacksburg, VA 24060, USA','_qcbFvyxjNN?M_M@QImACk@Ik@O}@aAqD[eAQ_AGWG{@AoBFaAFk@Lk@l@mBJBh@u@b@u@nGwK|@cBf@gAl@aBd@mBb@_C\\iC|BcTvB_SpAwLn@gGFw@TkBXgCPs@\\kA^w@r@aAzBiB`BwAPUZm@Vi@X_ATaA~AaI\\gBNeAHsA@yACqAMwAgAqIwCqTKoA?[By@Fg@T{@n@yBVmAFs@D_AEqAm@iF_@}B_@qAg@yAKm@Ec@?oAJaFPmIB}BEuAOiBO_Aa@qCe@{DQmDCyEDwCBmAJiAr@sDH{@?gAOuB[qAQa@g@o@y@}@[_@Ua@[o@UeAMiAAeAHgARq@Tg@NWz@o@\\WzAeAxAiAVYJQXm@Nk@Hi@Da@Ay@K}@sAsFgAuCc@oA[cBCs@?cBP{H?wAIqAQqBAmAFsAh@cCNcABw@Ao@OmBI_AIsACy@FoBNqBVwBb@wDVoDPuD@URuBz@qEP_AICB_CBeC@eBFuAFOZa@_@{@w@eCe@}B]uCIcAUsAIa@Um@m@cBgBuEYk@k@uAmAkCo@mAeA}Bg@_BAe@[yASwAKWIm@G{@SgCSwC]aDUiC@YE_@Mk@OuAG_@Iu@SqCMcCBgA@CBABSAEIMECOw@CK@YYqEG_@Aq@[sC[_ByAeHoBiJkB_JyAsGaBeGQaBAWBU?m@AuB@m@McCMyAYyFB[IkBK{@Am@AcGF]AuAGq@I_BGk@Mq@aB{HA[YsAMUmAqFYkAMe@eBoFyBoGc@y@a@k@m@o@iAu@}@]w@OqAK{@Qw@[w@i@aEeDmAeA{@iAmDqJqCyGDICIISI@}@aCOe@]wA[yB?YUaBMW_@sCOiAi@}C{@cDa@iAm@sAm@_AiAuAwAqA[WBK_Ak@c@[kA{@mAmAs@aA}@gBuCoFiCaF_@}@a@gBMaAC{@C_A@aAAe@JsBXmGBGQA[EFsADe@AwAGgAWcB[oAaAaC}AeEk@uAi@mAy@yBUi@C@EMGUBAQs@_@qDUgBaAaF[oAi@mAe@{@[YQII@KDK@OEw@C[Nc@L{@LM_@c@Bo@?y@Ie@Oi@QE?DCUMEDy@a@qAk@_A]{@]{Au@w@]cAo@{@e@{AaA{BuAmIoFkJcGoD_CWWsA}@o@_@UQcBaA{A{@qD}B{AcAcGyDc@WQQUMcCoAe@SMGEBeA[e@UuAUeAOw@Ie@?yBM{@CAQIwAMeCCg@V@@a@F?zBHnDL?G',11.27),(4,37.120166,-80.415344,37.124893,-80.405069,'900 2nd St, Christiansburg, VA 24073, USA',NULL,'a`qaFzbyiN@BSHM?i@m@eCgDyAgBcB{BuAgBw@y@_@j@i@y@}@wAk@s@{C{C{AiBk@u@wAyAk@m@q@}@}BqCgEgF_AgASW@Cz@kA~AyBfBaC|@aABADDZ^TVRJL@|DDr@??C',1.04),(5,37.223463,-80.411117,37.226411,-80.414835,'700 Preston Ave, Blacksburg, VA 24060, USA','210 Otey St NW, Blacksburg, VA 24060, USA','seebFnhxiNAAyHxIg@l@MTG?g@OQEOKAIOCSRSQQUk@}@_AbAGt@ELCJTb@?HINDT?LCFQPERKTbAfBVb@ED??',0.42),(6,37.225034,-80.439100,37.228629,-80.426662,'2965 Oak Ln, Blacksburg, VA 24061, USA',NULL,'moebFjw}iNQk@h@W@IAMSKOQOe@EU?WB[LW\\_@FQBICCA??AACACAG@GDKJED?LaBO@?O?oABqC?{ABwAJiAXiAJWXk@xA}BtBgDJ_@Ba@C_@K[e@g@o@i@{BoB]o@K_@QBY?]OYUyA_Bq@a@u@[UQ]g@[s@OS[UYIgASk@Wk@e@SYQg@Gy@?IKBW@QC[OIICBSa@i@w@HM',0.96),(7,37.223928,-80.414175,37.229681,-80.424938,'400 Houston St, Blacksburg, VA 24060, USA','Burke Johnston Student Center, 922 W Campus Dr, Blacksburg, VA 24061, USA','qhebFp{xiNCE^g@OUU_@i@h@G@CC_@m@mCpCi@l@r@lAs@x@[\\qAtA{A~Ab@l@\\^Db@TbEHv@AZAHKBGBKBDLDTBRmBxCoBdDk@|@AJAPk@v@{BzCaC~Cm@r@e@l@LP}@fAm@r@HLe@l@d@r@_@d@^l@FP?DONGK',0.93);
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `run_participation`
--

DROP TABLE IF EXISTS `run_participation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `run_participation` (
  `participation_runner_id` int NOT NULL,
  `participation_run_id` int NOT NULL,
  PRIMARY KEY (`participation_runner_id`,`participation_run_id`),
  KEY `participation_run_id` (`participation_run_id`),
  CONSTRAINT `run_participation_ibfk_1` FOREIGN KEY (`participation_runner_id`) REFERENCES `runners` (`runner_id`),
  CONSTRAINT `run_participation_ibfk_2` FOREIGN KEY (`participation_run_id`) REFERENCES `runs` (`run_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `run_participation`
--

LOCK TABLES `run_participation` WRITE;
/*!40000 ALTER TABLE `run_participation` DISABLE KEYS */;
INSERT INTO `run_participation` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(10,1),(11,1),(12,1),(14,1),(15,1),(17,1),(18,1),(20,1),(1,2),(2,2),(3,2),(5,2),(6,2),(7,2),(9,2),(11,2),(13,2),(15,2),(17,2),(19,2),(21,2),(1,3),(2,3),(3,3),(5,3),(9,3),(10,3),(13,3),(15,3),(17,3),(19,3),(21,3),(1,4),(15,4),(16,4),(17,4),(18,4),(19,4),(20,4),(21,4),(22,4),(1,5),(3,5),(5,5),(6,5),(9,5),(10,5),(12,5),(13,5),(15,5),(17,5),(19,5),(21,5),(1,6),(13,6),(14,6),(15,6),(16,6),(17,6),(18,6),(19,6),(20,6),(21,6),(1,7),(2,7),(3,7),(5,7),(6,7),(7,7),(9,7),(11,7),(13,7),(15,7),(17,7),(19,7),(21,7),(22,7),(1,8),(2,8),(3,8),(4,8),(5,8),(6,8),(7,8),(9,8),(10,8),(11,8),(12,8),(13,8),(14,8),(15,8),(1,9),(2,9),(3,9),(4,9),(5,9),(6,9),(7,9),(8,9),(10,9),(11,9),(12,9),(13,9),(14,9),(1,10),(2,10),(3,10),(5,10),(6,10),(7,10),(9,10),(11,10),(13,10),(15,10),(19,10),(21,10),(1,11),(2,11),(3,11),(4,11),(5,11),(6,11),(7,11),(8,11),(10,11),(11,11),(12,11),(14,11),(15,11),(17,11),(1,12),(2,12),(3,12),(5,12),(6,12),(9,12),(13,12),(19,12),(21,12),(23,12),(1,13),(2,13),(3,13),(5,13),(6,13),(9,13),(11,13),(13,13),(15,13),(19,13),(21,13),(1,14),(2,14),(3,14),(4,14),(5,14),(6,14),(7,14),(8,14),(10,14),(11,14),(12,14),(14,14),(15,14),(16,14),(17,14),(1,15),(2,15),(3,15),(5,15),(6,15),(7,15),(9,15),(13,15),(15,15),(17,15),(19,15),(21,15),(23,15),(1,16),(2,16),(3,16),(4,16),(5,16),(6,16),(7,16),(9,16),(10,16),(11,16),(12,16),(14,16),(15,16),(17,16),(18,16),(21,16),(1,17),(2,17),(3,17),(4,17),(5,17),(6,17),(7,17),(8,17),(10,17),(11,17),(12,17),(22,17),(1,18),(2,18),(3,18),(4,18),(5,18),(6,18),(7,18),(8,18),(10,18),(11,18),(12,18),(14,18),(23,18),(1,19),(2,19),(3,19),(5,19),(6,19),(9,19),(13,19),(15,19),(19,19),(21,19),(23,19);
/*!40000 ALTER TABLE `run_participation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `runners`
--

DROP TABLE IF EXISTS `runners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `runners` (
  `runner_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_initial` char(1) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `user_password` varchar(200) DEFAULT NULL,
  `is_leader` tinyint(1) DEFAULT '0',
  `is_admin` tinyint(1) DEFAULT '0',
  `min_pace` int DEFAULT NULL,
  `max_pace` int DEFAULT NULL,
  `min_dist_pref` int DEFAULT NULL,
  `max_dist_pref` int DEFAULT NULL,
  PRIMARY KEY (`runner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `runners`
--

LOCK TABLES `runners` WRITE;
/*!40000 ALTER TABLE `runners` DISABLE KEYS */;
INSERT INTO `runners` VALUES (1,'test','t','test','test@test.com','$argon2id$v=19$m=65536,t=2,p=1$J0EccGqYCUH1b1Q5sJPwcg$apQph3Am1eekXrnlfXEWgYP+bJ/xfqr+eb2imBYJP78',1,1,100,1000,0,12),(2,'Jett','W','Morrow','jettmorrow@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$q+7h87Qi5iB8m1gNPBROGQ',1,0,480,540,1,12),(3,'Adam','Z','Schantz','adams03@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$US/trwyeAJ7z+3gp+DCwXw',1,0,420,540,1,12),(4,'Emily','R','Nguyen','emily.nguyen@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$n/+K3wxq+LF4qhbKt/Gxyw',0,0,540,600,0,2),(5,'Liam','T','Chen','liam.chen@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$daWsC5sHSLEuFIzgmUz4tA',0,0,360,420,0,1),(6,'Sofia','M','Patel','sofia.patel@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$GS6at2s7w3YozsnCr5nsuA',1,0,420,480,0,2),(7,'Noah','B','Johnson','noah.johnson@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$ZvM7CvkdLLqGrBWrGiynWA',0,0,480,540,0,2),(8,'Ava','K','Davis','ava.davis@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$rc6CwixWsUoaJWLucsOgEg',0,0,540,600,0,1),(9,'Ethan','J','Wilson','ethan.wilson@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$NAf+nJiZkxxF68OxXqnnrw',1,0,360,480,1,12),(10,'Olivia','L','Martinez','olivia.martinez@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$Tp1/qPncWZSNJ7G9GLJ7yA',0,0,420,480,0,2),(11,'Mason','C','Brown','mason.brown@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$e5kxpX1D0hDL/fQC6vBkNA',0,0,480,540,0,2),(12,'Isabella','P','Clark','isabella.clark@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8Bndt/gryd5p4eOTO9YC8A',0,0,540,600,0,1),(13,'James','A','Lopez','james.lopez@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$+8vZg9uAlQxN3TyZxzcclA',1,0,360,420,1,12),(14,'Charlotte','D','Gonzalez','charlotte.gonzalez@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$yBT2S2O7qEJyNJX0ArBTng',0,0,480,540,0,2),(15,'Lucas','N','Perez','lucas.perez@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$dr92IHJxPDfQrWPNOGPUEg',0,0,420,480,0,2),(16,'Amelia','S','Hernandez','amelia.hernandez@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$CNNyOPZ+WE7wHAO7b64NMA',1,0,540,600,0,2),(17,'Benjamin','E','Lewis','benjamin.lewis@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$SvgerouohOb6xd+ScEMGfA',0,0,480,540,0,2),(18,'Mia','F','Hall','mia.hall@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$GOY0tgX0obhooyw40m6f+Q',0,0,420,480,0,2),(19,'Henry','G','Young','henry.young@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$OdhJBdhfCBjrht2zjiyvZA',1,0,360,420,1,12),(20,'Harper','Q','Allen','harper.allen@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$29Ppdbdu8sLo1mi8Ya+/vw',0,0,480,540,0,2),(21,'Alexander','V','King','alex.king@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$3cPUrQ+yTPNG7Q6u7bJy3w',1,0,420,480,1,12),(22,'Nate','D','Williams','natewilliams@vt.edu','$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8ifrTk+98PBcbldrTtgjhA',1,0,660,720,0,1),(23,'Alex','R','Shaw','ashaw4@vt.edu','$argon2id$v=19$m=65536,t=2,p=1$zizQWPgquPuhcbaKSpyIdA$vvSvw/Y1Ac9XBXM95dUTcKsUjI5bcsOLeiM0n4yRDME',1,0,360,540,0,12);
/*!40000 ALTER TABLE `runners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `runs`
--

DROP TABLE IF EXISTS `runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `runs` (
  `run_id` int NOT NULL AUTO_INCREMENT,
  `leader_id` int NOT NULL,
  `run_route` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `pace` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  PRIMARY KEY (`run_id`),
  KEY `leader_id` (`leader_id`),
  KEY `run_route` (`run_route`),
  CONSTRAINT `runs_ibfk_1` FOREIGN KEY (`leader_id`) REFERENCES `runners` (`runner_id`),
  CONSTRAINT `runs_ibfk_2` FOREIGN KEY (`run_route`) REFERENCES `routes` (`route_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `runs`
--

LOCK TABLES `runs` WRITE;
/*!40000 ALTER TABLE `runs` DISABLE KEYS */;
INSERT INTO `runs` VALUES (1,2,1,'Morning Easy Run Loop','A relaxed run to start the day',540,'2026-01-01','06:30:00'),(2,2,2,'Interval Training','High-intensity intervals for speed',420,'2025-12-02','18:00:00'),(3,2,3,'Long Distance Run','Endurance building long run',495,'2024-07-03','07:00:00'),(4,22,4,'First Run in Weeks','Slow tempo run on Huckle Berry',660,'2025-10-25','07:15:00'),(5,9,5,'Endurance Run','Climbing hills on a trail',510,'2025-09-07','08:00:00'),(6,13,6,'Rain Run','Short run, so wet, wow such a wet run',555,'2025-10-20','18:30:00'),(7,22,7,'Sprint Run','Sprinted to class.',465,'2025-10-20','13:00:00'),(8,1,1,'Morning Easy Run Loop','A relaxed run to start the day',540,'2024-01-01','06:30:00'),(9,1,1,'Night Run','running at night wooo',540,'2025-01-01','06:30:00'),(10,3,2,'Weekend Long Run','Saturday morning long distance training',480,'2025-12-14','07:00:00'),(11,6,1,'Sunrise Run','Early morning run to catch the sunrise',510,'2025-12-18','06:00:00'),(12,9,3,'Trail Adventure','Exploring scenic trails around campus',540,'2025-12-21','08:30:00'),(13,13,5,'Tempo Tuesday','Moderate pace tempo run',450,'2025-12-23','17:00:00'),(14,16,4,'Holiday Run','Stay active during the holidays',600,'2025-12-25','09:00:00'),(15,19,6,'New Year Prep','Getting ready for the new year',495,'2025-12-28','07:30:00'),(16,21,2,'Evening Group Run','Social run with the group',540,'2025-12-30','18:00:00'),(17,22,7,'New Year Run','Start the year right with a run',660,'2026-01-02','08:00:00'),(18,23,1,'Morning Recovery Run','Easy pace recovery after hard training',600,'2026-01-05','06:45:00'),(19,2,3,'Weekend Warrior','Long weekend training session',480,'2026-01-11','07:15:00');
/*!40000 ALTER TABLE `runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_routes`
--

DROP TABLE IF EXISTS `saved_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_routes` (
  `runner_id` int NOT NULL,
  `route_id` int NOT NULL,
  PRIMARY KEY (`runner_id`,`route_id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `saved_routes_ibfk_1` FOREIGN KEY (`runner_id`) REFERENCES `runners` (`runner_id`) ON DELETE CASCADE,
  CONSTRAINT `saved_routes_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`route_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_routes`
--

LOCK TABLES `saved_routes` WRITE;
/*!40000 ALTER TABLE `saved_routes` DISABLE KEYS */;
INSERT INTO `saved_routes` VALUES (2,1),(2,2),(2,3),(22,4),(9,5),(13,6),(22,7);
/*!40000 ALTER TABLE `saved_routes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-30 17:30:23
