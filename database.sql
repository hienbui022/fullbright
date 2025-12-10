-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: english_fullbright
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `userId` int NOT NULL,
  `forumPostId` int DEFAULT NULL,
  `lessonId` int DEFAULT NULL,
  `parentId` int DEFAULT NULL,
  `likeCount` int DEFAULT '0',
  `isAccepted` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `forumPostId` (`forumPostId`),
  KEY `lessonId` (`lessonId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`forumPostId`) REFERENCES `forum_posts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_4` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'test',5,1,NULL,NULL,0,0,'2025-06-19 12:13:35','2025-06-19 12:13:35'),(3,'tôi ăn rồi 1',5,1,NULL,NULL,0,0,'2025-06-19 12:13:51','2025-06-19 12:13:51'),(4,'dfgdfgd',5,1,NULL,NULL,0,0,'2025-06-19 12:16:42','2025-06-19 12:16:42');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `level` enum('beginner','intermediate','advanced') NOT NULL,
  `skills` varchar(255) NOT NULL COMMENT 'Array of skills: listening, speaking, reading, writing, grammar, vocabulary, pronunciation, communication',
  `topics` varchar(255) NOT NULL COMMENT 'Array of topics: travel, business, academic, daily_communication',
  `thumbnail` varchar(255) DEFAULT NULL,
  `duration` int NOT NULL COMMENT 'Duration in minutes',
  `price` float DEFAULT '0',
  `isPublished` tinyint(1) DEFAULT '0',
  `publishedAt` datetime DEFAULT NULL,
  `createdBy` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (2,'GRAMMAR COURSE','GRAMMAR COURSE','beginner','[\"speaking\"]','[\"travel\"]','https://cdn-icons-png.flaticon.com/512/1903/1903172.png',80,0,1,'2025-06-19 20:25:47',1,'2025-06-19 20:25:47','2025-06-19 21:17:10'),(3,'SPEAKING COURSE','SPEAKING COURSE','beginner','[\"speaking\"]','[\"travel\"]','https://cdn-icons-png.flaticon.com/512/3898/3898082.png',80,0,1,'2025-06-19 20:25:47',1,'2025-06-19 20:25:47','2025-06-19 21:17:10'),(4,'WRITING COURSE','WRITING COURSE','beginner','[\"speaking\"]','[\"travel\"]','https://cdn-icons-png.flaticon.com/512/2919/2919592.png',80,0,1,'2025-06-19 20:25:47',1,'2025-06-19 20:25:47','2025-06-19 21:17:10'),(5,'READING COURSE','READING COURSE','beginner','[\"speaking\"]','[\"travel\"]','https://cdn-icons-png.flaticon.com/512/3655/3655544.png',80,0,1,'2025-06-19 20:25:47',1,'2025-06-19 20:25:47','2025-06-19 21:17:10');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `courseId` int NOT NULL,
  `status` enum('pending','active','completed','cancelled') DEFAULT 'pending',
  `progress` int DEFAULT '0',
  `enrolledAt` datetime DEFAULT NULL,
  `completedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollments_user_id_course_id` (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,5,2,'active',0,'2025-06-19 10:31:03',NULL,'2025-06-19 10:31:03','2025-06-19 10:31:03'),(2,5,3,'active',0,'2025-06-19 10:34:28',NULL,'2025-06-19 10:34:28','2025-06-19 10:34:28');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercises`
--

DROP TABLE IF EXISTS `exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'multiple_choice',
  `difficulty` varchar(255) NOT NULL DEFAULT 'easy',
  `timeLimit` int DEFAULT NULL,
  `passingScore` int DEFAULT NULL,
  `isPublished` tinyint(1) NOT NULL DEFAULT '0',
  `createdBy` int NOT NULL,
  `lessonId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  KEY `lessonId` (`lessonId`),
  CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `exercises_ibfk_2` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercises`
--

LOCK TABLES `exercises` WRITE;
/*!40000 ALTER TABLE `exercises` DISABLE KEYS */;
INSERT INTO `exercises` VALUES (1,'test','test','multiple_choice','medium',2,100,0,1,3,'2025-06-19 01:54:54','2025-06-19 01:54:54',NULL);
/*!40000 ALTER TABLE `exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcards`
--

DROP TABLE IF EXISTS `flashcards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `term` varchar(255) NOT NULL,
  `definition` text NOT NULL,
  `example` text,
  `imageUrl` varchar(255) DEFAULT NULL,
  `audioUrl` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `difficulty` enum('easy','medium','hard') DEFAULT NULL,
  `courseId` int DEFAULT NULL,
  `lessonId` int DEFAULT NULL,
  `createdBy` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courseId` (`courseId`),
  KEY `lessonId` (`lessonId`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `flashcards_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `flashcards_ibfk_2` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `flashcards_ibfk_3` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcards`
--

LOCK TABLES `flashcards` WRITE;
/*!40000 ALTER TABLE `flashcards` DISABLE KEYS */;
INSERT INTO `flashcards` VALUES (2,'test','test','test','https://firebasestorage.googleapis.com/v0/b/zalo-app-66612.appspot.com/o/flashcard-images%2Fnew%2F1745693454917-20200110_0VQJNbkpdGU2xAWRTyUbrMWM.png?alt=media&token=012b311c-3238-45a2-a100-b3e6219ba0f5',NULL,'test','easy',3,3,1,'2025-06-19 18:50:56','2025-06-19 18:50:56');
/*!40000 ALTER TABLE `flashcards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_posts`
--

DROP TABLE IF EXISTS `forum_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `authorId` int NOT NULL,
  `viewCount` int DEFAULT '0',
  `likeCount` int DEFAULT '0',
  `commentCount` int DEFAULT '0',
  `isResolved` tinyint(1) DEFAULT '0',
  `resolvedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authorId` (`authorId`),
  CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_posts`
--

LOCK TABLES `forum_posts` WRITE;
/*!40000 ALTER TABLE `forum_posts` DISABLE KEYS */;
INSERT INTO `forum_posts` VALUES (1,'ăn cơm chưa','ăn cơm chưa','question','[]',5,10,4,3,0,NULL,'2025-06-19 11:57:20','2025-06-19 12:26:54');
/*!40000 ALTER TABLE `forum_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_paths`
--

DROP TABLE IF EXISTS `learning_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_paths` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `level` enum('beginner','intermediate','advanced','all') NOT NULL,
  `targetAudience` varchar(255) DEFAULT NULL,
  `estimatedDuration` int DEFAULT NULL COMMENT 'Duration in days',
  `courses` text NOT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `isPublished` tinyint(1) DEFAULT '0',
  `createdBy` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `learning_paths_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_paths`
--

LOCK TABLES `learning_paths` WRITE;
/*!40000 ALTER TABLE `learning_paths` DISABLE KEYS */;
INSERT INTO `learning_paths` VALUES (2,'Lộ trình khóa học phát ẩm','Buổi 1 học về cơ bản, Buổi 2 học về,...\n\n','beginner',NULL,10,'[]','https://firebasestorage.googleapis.com/v0/b/zalo-app-66612.appspot.com/o/learning-paths%2F2%2F231244-600x600.jpg?alt=media&token=96a1d08f-6db2-4237-a01a-dde5ea52f0a8',1,1,'2025-06-19 20:29:41','2025-06-19 21:05:44');
/*!40000 ALTER TABLE `learning_paths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_tools`
--

DROP TABLE IF EXISTS `learning_tools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_tools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` varchar(255) NOT NULL COMMENT 'Type of tool: quiz, flashcard, game, exercise, etc.',
  `category` varchar(255) NOT NULL COMMENT 'Category: vocabulary, grammar, listening, speaking, etc.',
  `content` text COMMENT 'JSON content of the tool (questions, answers, etc.)',
  `instructions` text,
  `difficulty` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
  `estimatedTime` int DEFAULT NULL COMMENT 'Estimated time to complete in minutes',
  `imageUrl` varchar(255) DEFAULT NULL,
  `isInteractive` tinyint(1) DEFAULT '0',
  `createdBy` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `learning_tools_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_tools`
--

LOCK TABLES `learning_tools` WRITE;
/*!40000 ALTER TABLE `learning_tools` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_tools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `courseId` int NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `contentType` enum('video','audio','text','image','mixed') NOT NULL,
  `content` text COMMENT 'Text content or JSON with content details',
  `videoUrl` varchar(255) DEFAULT NULL,
  `audioUrl` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `duration` int DEFAULT NULL COMMENT 'Duration in minutes',
  `isPublished` tinyint(1) DEFAULT '0',
  `createdBy` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courseId` (`courseId`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (2,'Bài 01','<p>B&agrave;i giảng mở dầu 1</p>',2,1,'video','<iframe width=\"1296\" height=\"729\" src=\"https://www.youtube.com/embed/lhMPErjiT7s?list=RDOZmK0YuSmXU\" title=\"Em Thế Nào | Khắc Việt ft. Yanbi || Official Lyrics Video | ALBUM &quot;NHẠC SUY THƯ GIÃN&quot;\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>',NULL,NULL,NULL,60,1,1,'2025-06-19 20:27:39','2025-06-19 11:43:35'),(3,'Bài 02','<p>test</p>',2,2,'text','<p>test</p>',NULL,NULL,NULL,10,1,1,'2025-06-19 11:59:28','2025-06-19 11:59:41');
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `summary` text,
  `imageUrl` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `isPublished` tinyint(1) DEFAULT '0',
  `publishedAt` datetime DEFAULT NULL,
  `createdBy` int NOT NULL,
  `viewCount` int DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (2,'Mẹo thi TOEIC 7 phần ẵm trọn 990 điểm TOEIC','I. TỔNG QUAN ĐỀ THI TOEIC\nĐề thi TOEIC hiện nay gồm 7 phần thi chính, chú trọng vào hai kỹ năng là đọc và nghe. Bao gồm 200 câu hỏi trắc nghiệm tiếng Anh với tổng thời gian thi 120 phút: 100 câu Listening tương đương part 1, 2, 3, 4 ( thi trong 45 phút) và 100 câu reading tương đương part 5, 6, 7 (thi trong 75 phút). \n\nPhần 1: Mô tả tranh (Photographs)\n\nPhần 2: Hỏi đáp (Question – Response)\n\nPhần 3: Đoạn hội thoại ngắn (Short Conversations)\n\nPhần 4: Bài nói ngắn (Short Talks)\n\nPhần 5: Hoàn thành câu (Incomplete Sentences)\n\nPhần 6: Hoàn thành đoạn văn (Text Completion)\n\nPhần 7: Đọc hiểu (Reading Comprehension)\n\nĐể biết chi tiết hơn về Cấu trúc đề thi TOEIC theo Format mới, các bạn tham khảo bài viết dưới đây:\n\n ➡️ Cấu trúc đề thi TOEIC: Full 7 phần Reading & Listening\n\nCác bạn thấy đó, mỗi một phần trong đề thi TOEIC có dạng câu hỏi khác nhau. Chính vì vậy, ở từng phần bạn phải có chiến lược riêng thì sẽ hoàn thành các câu hỏi nhanh nhất và có đáp án đúng.\n\nVậy chúng ta cùng nhau đi tìm hiểu mẹo thi trong từng phần ở dưới đây nhé!','Trong bài viết này, Ms Hoa sẽ chia sẻ chi tiết các bạn chiến thuật và mẹo làm bài thi TOEIC theo từng Part hiệu quả nhất mà ít người biết giúp bạn làm bài nhanh và chính xác hơn.','https://firebasestorage.googleapis.com/v0/b/zalo-app-66612.appspot.com/o/news%2F1743023792760-231244-600x600.jpg?alt=media&token=4d760311-d381-4aec-834d-fb14ef9a1dd6','tin-tuc','[\"tintuc\"]',1,'2025-06-19 21:18:09',1,1,'2025-06-19 20:31:11','2025-06-19 11:32:19'),(13,'10 Mẹo Cải Thiện Tiếng Anh','<p>Nội dung về c&aacute;ch cải thiện tiếng Anh... 111</p>','Học 10 cách hiệu quả để nâng cao kỹ năng tiếng Anh.','https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d','tin-tuc','[\"Tiếng Anh\",\"Mẹo học\"]',1,'2025-06-01 10:00:00',1,123,'2025-06-19 03:47:35','2025-06-19 12:21:27'),(14,'Làm Sao Để Nói Tiếng Anh Trôi Chảy','Các kỹ thuật và bài tập nói trôi chảy...','Làm chủ sự lưu loát với những bài tập đơn giản.','https://images.unsplash.com/photo-1611162617474-5b21e879e113','Nói','[\"Lưu loát\", \"Luyện tập\"]',1,'2025-06-02 14:30:00',1,94,'2025-06-19 03:47:35','2025-06-19 12:15:22'),(15,'Top 5 Ứng Dụng Học Tiếng Anh','Đánh giá và gợi ý ứng dụng học tiếng Anh...','Khám phá những ứng dụng tốt nhất để học tiếng Anh năm 2024.','https://images.unsplash.com/photo-1434030216411-0b793f4b4173','Công nghệ','[\"Ứng dụng\", \"Học qua di động\"]',1,'2025-06-03 09:15:00',1,202,'2025-06-19 03:47:35','2025-06-19 11:32:14'),(16,'Những Lỗi Ngữ Pháp Phổ Biến Cần Tránh','Phân tích chi tiết các lỗi thường gặp...','Tránh những lỗi ngữ pháp phổ biến để nói tự nhiên hơn.','https://images.unsplash.com/photo-1611162617474-5b21e879e113','Ngữ pháp','[\"Lỗi sai\", \"Viết lách\"]',1,'2025-06-04 16:45:00',1,150,'2025-06-19 03:47:35','2025-06-19 03:47:35'),(17,'Các Thành Ngữ Tiếng Anh Cần Biết','Danh sách những thành ngữ hữu ích...','Học những thành ngữ phổ biến trong hội thoại tiếng Anh.','https://images.unsplash.com/photo-1434030216411-0b793f4b4173','Từ vựng','[\"Thành ngữ\", \"Cách diễn đạt\"]',1,'2025-06-05 11:20:00',1,95,'2025-06-19 03:47:35','2025-06-19 03:47:35'),(18,'Những Kênh YouTube Học Tiếng Anh Hay Nhất','Các kênh YouTube học tiếng Anh hàng đầu...','Khám phá các kênh YouTube tốt nhất để học tiếng Anh.','https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d','Truyền thông','[\"YouTube\", \"Nghe hiểu\"]',1,'2025-06-06 18:00:00',1,180,'2025-06-19 03:47:35','2025-06-19 03:47:35'),(19,'Hướng Dẫn Phát Âm Tiếng Anh','Mẹo và thủ thuật phát âm...','Cải thiện phát âm của bạn với những bí quyết từ chuyên gia.','https://images.unsplash.com/photo-1611162617474-5b21e879e113','Nói','[\"Phát âm\", \"Giọng điệu\"]',1,'2025-06-07 12:10:00',1,130,'2025-06-19 03:47:35','2025-06-19 03:47:35'),(20,'Viết Email Tiếng Anh Chuyên Nghiệp','Hướng dẫn viết email công việc...','Cẩm nang viết email chuyên nghiệp cho người học tiếng Anh.','https://images.unsplash.com/photo-1434030216411-0b793f4b4173','Viết','[\"Email\", \"Tiếng Anh thương mại\"]',1,'2025-06-08 08:30:00',1,75,'2025-06-19 03:47:35','2025-06-19 03:47:35'),(21,'Làm Sao Để Suy Nghĩ Bằng Tiếng Anh','Các bài tập tư duy bằng tiếng Anh...','Luyện não để suy nghĩ trực tiếp bằng tiếng Anh.','https://images.unsplash.com/photo-1434030216411-0b793f4b4173','Tư duy','[\"Suy nghĩ\", \"Luyện tập\"]',1,'2025-06-09 13:45:00',1,90,'2025-06-19 03:47:35','2025-06-19 03:47:35'),(22,'Từ Vựng Tiếng Anh Khi Đi Du Lịch','Những cụm từ cần biết khi đi du lịch...','Từ vựng tiếng Anh quan trọng cho người đi du lịch.','https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d','Du lịch','[\"Từ vựng\", \"Tiếng Anh du lịch\"]',1,'2025-06-10 17:20:00',1,110,'2025-06-19 03:47:35','2025-06-19 03:47:35');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'multiple_choice',
  `options` json NOT NULL,
  `points` int NOT NULL DEFAULT '1',
  `explanation` text,
  `orderIndex` int NOT NULL DEFAULT '0',
  `exerciseId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exerciseId` (`exerciseId`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exerciseId`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES ('9b7a0d12-4857-4d43-b1d6-ee6757842742','test','multiple_choice','[{\"text\": \"test4\", \"isCorrect\": false}, {\"text\": \"test6\", \"isCorrect\": false}, {\"text\": \"test7\", \"isCorrect\": true}, {\"text\": \"tét8\", \"isCorrect\": false}, {\"text\": \"test9\", \"isCorrect\": false}]',10,'yyy',1,1,'2025-06-19 01:57:35','2025-06-19 01:57:35',NULL),('e0b5e704-dcfa-445b-8336-fc8d08d4855a','test','multiple_choice','[{\"text\": \"test1\", \"isCorrect\": false}, {\"text\": \"test2\", \"isCorrect\": true}, {\"text\": \"test3\", \"isCorrect\": false}, {\"text\": \"test4\", \"isCorrect\": false}]',9,'test',0,1,'2025-06-19 01:56:54','2025-06-19 01:56:54',NULL);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `courseId` int DEFAULT NULL,
  `lessonId` int DEFAULT NULL,
  `exerciseId` int DEFAULT NULL,
  `progress` float NOT NULL DEFAULT '0' COMMENT 'Progress percentage (0-100)',
  `score` float DEFAULT NULL COMMENT 'Score for exercises or assessments',
  `completedAt` datetime DEFAULT NULL,
  `lastAccessedAt` datetime NOT NULL,
  `timeSpent` int DEFAULT NULL COMMENT 'Time spent in minutes',
  `notes` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_progress_user_id_course_id_lesson_id_exercise_id` (`userId`,`courseId`,`lessonId`,`exerciseId`),
  KEY `courseId` (`courseId`),
  KEY `lessonId` (`lessonId`),
  KEY `exerciseId` (`exerciseId`),
  CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_progress_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_progress_ibfk_3` FOREIGN KEY (`lessonId`) REFERENCES `lessons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_progress_ibfk_4` FOREIGN KEY (`exerciseId`) REFERENCES `exercises` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,5,2,2,NULL,0,NULL,NULL,'2025-06-19 02:00:33',NULL,NULL,'2025-06-19 02:00:33','2025-06-19 02:00:33'),(2,5,2,3,NULL,0,NULL,NULL,'2025-06-19 02:05:02',NULL,NULL,'2025-06-19 02:05:02','2025-06-19 02:05:02');
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_tool_progress`
--

DROP TABLE IF EXISTS `user_tool_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tool_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `toolId` int NOT NULL,
  `startedAt` datetime NOT NULL,
  `lastAccessedAt` datetime NOT NULL,
  `completedAt` datetime DEFAULT NULL,
  `isCompleted` tinyint(1) DEFAULT '0',
  `score` int DEFAULT NULL COMMENT 'Score achieved in the tool (if applicable)',
  `data` text COMMENT 'JSON data with user progress details',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_tool_progress_user_id_tool_id` (`userId`,`toolId`),
  KEY `toolId` (`toolId`),
  CONSTRAINT `user_tool_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_tool_progress_ibfk_2` FOREIGN KEY (`toolId`) REFERENCES `learning_tools` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tool_progress`
--

LOCK TABLES `user_tool_progress` WRITE;
/*!40000 ALTER TABLE `user_tool_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_tool_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userflashcardprogress`
--

DROP TABLE IF EXISTS `userflashcardprogress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userflashcardprogress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `flashcardId` int NOT NULL,
  `status` enum('new','learning','reviewing','mastered') NOT NULL DEFAULT 'new',
  `correctCount` int NOT NULL DEFAULT '0',
  `incorrectCount` int NOT NULL DEFAULT '0',
  `lastReviewedAt` datetime DEFAULT NULL,
  `nextReviewAt` datetime DEFAULT NULL,
  `easeFactor` float NOT NULL DEFAULT '2.5',
  `interval` int NOT NULL DEFAULT '1',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_flashcard_progress_user_id_flashcard_id` (`userId`,`flashcardId`),
  KEY `flashcardId` (`flashcardId`),
  CONSTRAINT `userflashcardprogress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `userflashcardprogress_ibfk_2` FOREIGN KEY (`flashcardId`) REFERENCES `flashcards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userflashcardprogress`
--

LOCK TABLES `userflashcardprogress` WRITE;
/*!40000 ALTER TABLE `userflashcardprogress` DISABLE KEYS */;
/*!40000 ALTER TABLE `userflashcardprogress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `profileImage` varchar(255) DEFAULT NULL,
  `bio` text,
  `lastLogin` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpire` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@gmail.com','$2b$10$Uu4DEWDAtMivuG0GEOJCw.UO7ESbK.uCjfJo1g3DJ5yW1kzwqdeeC','Admin','admin',NULL,NULL,'2025-06-19 12:43:14',1,NULL,NULL,'2025-06-19 14:06:06','2025-06-19 12:43:14'),(2,'kieu','123@gmail.com','$2b$10$HWt681ael1pYSbHJScEtIewC1fJaDJFjYxwA7nUwHq2nF7hiPLr4O','kieu','user',NULL,NULL,NULL,1,NULL,NULL,'2025-06-19 07:26:09','2025-06-19 20:23:07'),(4,'test','test@gmail.com','$2b$10$T6SDdrvflm5ymPty8sZDlubyhtQsqQ0qHgYkmKwDfEofZLEEwJQla','test','user','https://firebasestorage.googleapis.com/v0/b/zalo-app-66612.appspot.com/o/profile-images%2Fnew%2F231244-600x600.jpg?alt=media&token=45a577ed-ddd9-4577-8879-47debb5a19c2',NULL,'2025-06-19 20:33:47',1,NULL,NULL,'2025-06-19 20:46:51','2025-06-19 20:33:47'),(5,'hung','vovanhung77h12@gmail.com','$2b$10$i.j4OGGHvLXldR6lK95L6O67lBAJC.uGZFfKHEFGqo209.wPnMMJ2','hungvo','user',NULL,'111','2025-06-19 02:26:53',1,'c4557bd73feca404a6694475d59db1095fc4cc2f1429cb4b7bcc089920ddbd16','2025-06-19 02:54:18','2025-06-19 20:41:01','2025-06-19 02:26:53'),(6,'hungvo','host_01@gmail.com','$2b$10$7RAIILMnNLScHMPlcJatounXa4XjxY9dcAkWbnwMUN3yKcdZJ69Om','hungvo','user','https://firebasestorage.googleapis.com/v0/b/zalo-app-66612.appspot.com/o/profile-images%2Fnew%2F482235601_2064821724034633_2732843953287391688_n.jpg?alt=media&token=153ce306-34a1-4ff6-b7fa-232dbd09656d',NULL,'2025-06-19 04:41:46',1,NULL,NULL,'2025-06-19 04:41:32','2025-06-19 04:41:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-19 20:09:16
