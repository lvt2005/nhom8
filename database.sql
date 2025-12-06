-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: corporate_blog
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (1,'Getting Started with Vue 3 and Vite','Vue 3 is the latest version of the progressive JavaScript framework. It features a new Composition API, better performance, and smaller bundle sizes. Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects.','','[\"vue\", \"vite\", \"frontend\"]','2025-12-06 22:45:38','2025-12-06 22:45:38',1),(2,'Building REST APIs with Node.js and Express','Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It is the de facto standard server framework for Node.js.','','[\"nodejs\", \"express\", \"backend\"]','2025-12-06 22:45:38','2025-12-06 22:45:38',1),(4,'Trang chủ','Mini Blog Platfom API','/uploads/image-1765061976434.png','[\"@xh\", \"@xhhh\"]','2025-12-06 22:59:36','2025-12-06 22:59:36',3),(5,'Đăng kí ','Mini Blog Platfom API','/uploads/image-1765062082826.png','[\"@hot\", \"@hottrend\"]','2025-12-06 23:01:22','2025-12-06 23:01:22',4),(6,'Thông tin cá nhân','Mini Blog Platfom API','/uploads/image-1765062166058.png','[\"@blog\", \"@miniblog\"]','2025-12-06 23:02:46','2025-12-06 23:02:46',5),(9,'Đăng nhập','Mini Blog Platfom API','/uploads/image-1765062368593.png','[\"@loginn\", \"@xhhh\"]','2025-12-06 23:06:08','2025-12-06 23:06:08',6);
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'demo_user','demo@example.com','$2a$10$A.Rrc3okjMlbKMjerxAN/uD3d/Ro6i7xcePywzSkdiI72dq0QTTEC','user','2025-12-06 22:45:38','2025-12-06 22:45:38'),(2,'054205002706','324@gmail.com','$2a$10$QwK.N1dAGPaYYTtfntp3Fug5pQDLrQsnzqwxR20ejSPWR9C8zqO..','user','2025-12-06 22:48:18','2025-12-06 22:48:18'),(3,'Lê Văn Trí','tri@gmail.com','$2a$10$JZfh6IbGFbOPdPM1obtkAevbkJVVNG0gcipxQSRsO/TVTkG2M3ftW','user','2025-12-06 22:55:18','2025-12-06 22:55:18'),(4,'Nguyễn Hoàng Minh Nhật','nhat@gmail.com','$2a$10$YnTLQ/B4THjXFyXCjNxj4...LKjyl3jzBMYMrpnqtgjm0VsBVja06','user','2025-12-06 23:00:30','2025-12-06 23:00:30'),(5,'Ngyễn Nhật Hào','12313@gmail.com','$2a$10$RdvN7zlRqIXhLrN6RWKN9u47RfCt7wwHdxA5d9zfZpPkIZKYMAoni','user','2025-12-06 23:02:05','2025-12-06 23:02:05'),(6,'Phan Tấn Thuận','213@gmail.com','$2a$10$phVUPWcmA.fx6G5aDDsKFe28fdYFuDAOwH1apXngB9U0ZSRp4RH9C','user','2025-12-06 23:03:12','2025-12-06 23:03:12');
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

-- Dump completed on 2025-12-07  6:08:02
