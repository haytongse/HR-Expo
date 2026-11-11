-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 25, 2026 at 03:32 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_hrd`
--

-- --------------------------------------------------------

--
-- Table structure for table `adonis_schema`
--

CREATE TABLE `adonis_schema` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adonis_schema`
--

INSERT INTO `adonis_schema` (`id`, `name`, `batch`, `migration_time`) VALUES
(40, 'database/migrations/00_create_campuses_table', 1, '2025-11-27 07:31:58'),
(41, 'database/migrations/01_create_roles_table', 1, '2025-11-27 07:31:58'),
(42, 'database/migrations/02_create_users_table', 1, '2025-11-27 07:31:58'),
(43, 'database/migrations/03_create_access_tokens_table', 1, '2025-11-27 07:31:58'),
(44, 'database/migrations/04_shift_schedules', 1, '2025-11-27 07:31:58'),
(45, 'database/migrations/05_time_tables', 1, '2025-11-27 07:31:58'),
(46, 'database/migrations/06_user_shift_schedules', 1, '2025-11-27 07:31:58'),
(47, 'database/migrations/07_create_alter_users_profile_pictures_table', 1, '2025-11-27 07:31:58'),
(48, 'database/migrations/08_create_add_location_fields_to_campuses_table', 1, '2025-11-27 07:31:58'),
(49, 'database/migrations/09_create_check_ins_table', 1, '2025-11-27 07:31:58'),
(50, 'database/migrations/10_alter_check_ins_longitude_column', 1, '2025-11-27 07:31:58'),
(51, 'database/migrations/11_add_scan_fields_to_check_ins', 1, '2025-11-27 07:31:59'),
(52, 'database/migrations/12_add_allow_time_to_shift_schedules', 1, '2025-11-27 07:31:59'),
(53, 'database/migrations/13_add_scan_limits_to_shift_schedules', 1, '2025-11-27 07:31:59');

-- --------------------------------------------------------

--
-- Table structure for table `adonis_schema_versions`
--

CREATE TABLE `adonis_schema_versions` (
  `version` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adonis_schema_versions`
--

INSERT INTO `adonis_schema_versions` (`version`) VALUES
(2);

-- --------------------------------------------------------

--
-- Table structure for table `auth_access_tokens`
--

CREATE TABLE `auth_access_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `tokenable_id` int(10) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `hash` varchar(255) NOT NULL,
  `abilities` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_access_tokens`
--

INSERT INTO `auth_access_tokens` (`id`, `tokenable_id`, `type`, `name`, `hash`, `abilities`, `created_at`, `updated_at`, `last_used_at`, `expires_at`) VALUES
(1, 1, 'auth_token', NULL, '597b1a29fec36b60fd7ad615451d2b4f5d4847aac13cf11789aecd2bd5fa7d02', '[\"*\"]', '2025-11-27 07:38:26', '2025-11-27 00:36:20', '2025-11-27 00:38:26', '2025-12-27 00:36:20'),
(2, 1, 'auth_token', NULL, '169b797a6aeb7a20085c03752411d0cbeb40a9b7ec37bd383e537778411af138', '[\"*\"]', '2025-11-27 07:48:25', '2025-11-27 00:40:46', '2025-11-27 00:48:25', '2025-12-27 00:40:46'),
(3, 1, 'auth_token', NULL, '2a01d926213fd1e36ed87b84eb730af02d762d4e4695dd2ed54b079364292fff', '[\"*\"]', '2025-11-27 08:14:29', '2025-11-27 01:00:49', '2025-11-27 01:14:29', '2025-12-27 01:00:49'),
(4, 1, 'auth_token', NULL, 'ae1068b4df42f58736b5fb60c0acad537d34aa7f727edddc5bf4004812d3f1bc', '[\"*\"]', '2025-12-01 13:34:11', '2025-12-01 06:31:35', '2025-12-01 06:34:11', '2025-12-31 06:31:35'),
(5, 1, 'auth_token', NULL, 'da0e03b90fa44765ca015bffceb1725974fbfb03324097394ad98951322bf031', '[\"*\"]', '2025-12-01 13:36:35', '2025-12-01 06:34:31', '2025-12-01 06:36:35', '2025-12-31 06:34:31'),
(6, 1, 'auth_token', NULL, 'b08763157d702ee16418539f2c6a9d3463cc0c198b12b195dcc307bfb031bafb', '[\"*\"]', '2025-12-01 13:37:50', '2025-12-01 06:36:42', '2025-12-01 06:37:50', '2025-12-31 06:36:42'),
(7, 1, 'auth_token', NULL, 'b27c523a8bcfcb193eb6c7e2da9b3c0be5c2120e8b411bc6068815d67d8945a4', '[\"*\"]', '2025-12-01 13:44:40', '2025-12-01 06:38:07', '2025-12-01 06:44:40', '2025-12-31 06:38:07'),
(8, 1, 'auth_token', NULL, 'fbde3c804f4279de4c6caae6974fcf35177967e4079446c019a585ab52265214', '[\"*\"]', '2025-12-01 13:53:21', '2025-12-01 06:52:00', '2025-12-01 06:53:21', '2025-12-31 06:52:00'),
(9, 1, 'auth_token', NULL, '17033e398aae617d0d9166448b1f22fa0ffbba52844aa17b8573f302dc7d0190', '[\"*\"]', '2025-12-01 13:54:36', '2025-12-01 06:53:33', '2025-12-01 06:54:36', '2025-12-31 06:53:33'),
(10, 1, 'auth_token', NULL, 'bca53410a9d6873c94c1d1de27b38e1330186125d20c9a3b8a8fa0a635e777b3', '[\"*\"]', '2025-12-01 14:02:33', '2025-12-01 06:54:52', '2025-12-01 07:02:33', '2025-12-31 06:54:52'),
(11, 1, 'auth_token', NULL, '4894af30ca6134ecbc9b4860b1814d50447c8396e01389243114291965c7f2da', '[\"*\"]', '2025-12-01 14:06:09', '2025-12-01 07:02:43', '2025-12-01 07:06:09', '2025-12-31 07:02:43'),
(12, 1, 'auth_token', NULL, 'd6873a23b54cd41548a5c5fbdf17c36bc8157343c89d82fe22d81e0ab8eaa90c', '[\"*\"]', '2025-12-01 14:07:58', '2025-12-01 07:07:23', '2025-12-01 07:07:58', '2025-12-31 07:07:23'),
(13, 1, 'auth_token', NULL, 'c9ab2f89490ec551449203c5d0e3ddbe16adafdb9b62f35d72a09f2feb554f70', '[\"*\"]', '2025-12-01 14:08:53', '2025-12-01 07:08:51', '2025-12-01 07:08:53', '2025-12-31 07:08:51'),
(14, 1, 'auth_token', NULL, '8c5f62f6bf12bff750cb5967c695639da63986fefbc751780e771cc8b275c468', '[\"*\"]', '2025-12-01 14:27:18', '2025-12-01 07:15:40', '2025-12-01 07:27:18', '2025-12-31 07:15:40'),
(15, 1, 'auth_token', NULL, 'f69033f934a83c10c1c3668498b79a4a574211e73b16cdb9df1a02a0dc23a097', '[\"*\"]', '2025-12-01 14:29:30', '2025-12-01 07:29:23', '2025-12-01 07:29:30', '2025-12-31 07:29:23'),
(16, 1, 'auth_token', NULL, 'c99adb8fea233f179424c6c1227f7530ee85b0194c1f6eab0336995145f0e1bf', '[\"*\"]', '2025-12-01 14:40:56', '2025-12-01 07:36:26', '2025-12-01 07:40:56', '2025-12-31 07:36:26'),
(17, 1, 'auth_token', NULL, '0c1cd1ffb8c2c362491fe25dcd42589b7a04869961522d0979d1b95a3fef7847', '[\"*\"]', '2025-12-01 14:48:57', '2025-12-01 07:41:33', '2025-12-01 07:48:57', '2025-12-31 07:41:33'),
(18, 1, 'auth_token', NULL, 'b959b99168f736e8e81679ea21e916faf50e8916fbea863e79ec17eb31204f2c', '[\"*\"]', '2025-12-10 23:21:40', '2025-12-10 23:21:40', NULL, '2026-01-09 23:21:40'),
(19, 1, 'auth_token', NULL, '15433b2f7e5bf5a0504f56fc7f9f4f63e4f28d3946a1e8f0244cae88c0e1928b', '[\"*\"]', '2025-12-10 23:28:36', '2025-12-10 23:28:36', NULL, '2026-01-09 23:28:36'),
(20, 1, 'auth_token', NULL, '656901b869d88914734df542e64d605418629b5ac66b267c1fc4be399cc8b402', '[\"*\"]', '2025-12-10 23:43:56', '2025-12-10 23:43:56', NULL, '2026-01-09 23:43:56'),
(21, 1, 'auth_token', NULL, 'ecc026d0db02c7aac37a89c5ff795efb77cc33933d0a2cb7c3976cb592f73810', '[\"*\"]', '2025-12-10 23:47:00', '2025-12-10 23:47:00', NULL, '2026-01-09 23:47:00'),
(22, 1, 'auth_token', NULL, '1ee4d405b75fa25d131a777069a5476397c7bb9112277d8734ac94a62b38277f', '[\"*\"]', '2026-01-12 06:38:09', '2026-01-11 23:37:20', '2026-01-11 23:38:09', '2026-02-10 23:37:20'),
(23, 1, 'auth_token', NULL, '8782e2bfd9ec79117dd7c145b6ba5dd1b7674c617ce65f7d30e35c4a711ad98c', '[\"*\"]', '2026-01-12 06:53:16', '2026-01-11 23:41:46', '2026-01-11 23:53:16', '2026-02-10 23:41:46'),
(24, 1, 'auth_token', NULL, 'ad23b763369ef3f39edb0eb65817e7a583cf3533f3dfd9ece10948753019cf31', '[\"*\"]', '2026-01-12 04:42:46', '2026-01-12 04:42:46', NULL, '2026-02-11 04:42:46'),
(25, 1, 'auth_token', NULL, '76f14e1cc57ea2402af84cb47d542ea41b49b487dd0b4ccd14d363b9f630e153', '[\"*\"]', '2026-01-12 04:43:54', '2026-01-12 04:43:54', NULL, '2026-02-11 04:43:54'),
(26, 1, 'auth_token', NULL, 'a7ba98dd799a3b32e32c7d27ceec0bf6bb177b8fccb8c959d767289adc820ddc', '[\"*\"]', '2026-01-12 04:45:02', '2026-01-12 04:45:02', NULL, '2026-02-11 04:45:02'),
(27, 1, 'auth_token', NULL, '6830a0203cfceddc86c4d4a3cf64f3fb8146927948ace9e00399cda2e5c714e0', '[\"*\"]', '2026-01-12 12:03:47', '2026-01-12 04:52:02', '2026-01-12 05:03:47', '2026-02-11 04:52:02'),
(28, 1, 'auth_token', NULL, '1887f8e36eacb7929ee8608dab016dda9d9c80517fc30501ec5edd02a9202736', '[\"*\"]', '2026-01-12 05:06:10', '2026-01-12 05:06:10', NULL, '2026-02-11 05:06:10'),
(29, 1, 'auth_token', NULL, '780d6f26287c541c41559db8c4b204257c096759574c5d94ccc6762f53a5114e', '[\"*\"]', '2026-01-12 05:06:51', '2026-01-12 05:06:51', NULL, '2026-02-11 05:06:51'),
(30, 1, 'auth_token', NULL, 'e0edd8e9eb7c4af60481025494f451e3ba51277c51c60f7e243920928e99dedc', '[\"*\"]', '2026-01-12 05:09:50', '2026-01-12 05:09:50', NULL, '2026-02-11 05:09:50'),
(31, 1, 'auth_token', NULL, 'a4bb4221ec0eaf328254560ae6127661de5b2a0b9b6eda8da061c09de5e05481', '[\"*\"]', '2026-01-12 05:15:12', '2026-01-12 05:15:12', NULL, '2026-02-11 05:15:12');

-- --------------------------------------------------------

--
-- Table structure for table `campuses`
--

CREATE TABLE `campuses` (
  `id` int(10) UNSIGNED NOT NULL,`code` varchar(255) NOT NULL,`full_name` varchar(255) NOT NULL,`address` varchar(255) DEFAULT NULL,`phone_number` varchar(255) DEFAULT NULL,`email` varchar(255) DEFAULT NULL,`website` varchar(255) DEFAULT NULL,`logo` varchar(255) DEFAULT NULL,`status` int(11) NOT NULL,`description` varchar(255) DEFAULT NULL,`start_counts` int(11) NOT NULL,`allow_meter` decimal(10,2) DEFAULT NULL,`lat` decimal(10,8) DEFAULT NULL,`long` decimal(11,8) DEFAULT NULL,`created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),`updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `campuses`
--

INSERT INTO `campuses` (`id`, `code`, `full_name`, `address`, `phone_number`, `email`, `website`, `logo`, `status`, `description`, `start_counts`, `allow_meter`, `lat`, `long`, `created_at`, `updated_at`) VALUES
(1, 'DF', 'default', NULL, NULL, NULL, NULL, NULL, 1, NULL, 1, 30.00, 11.70403400, 104.94179700, '2026-01-12 11:57:08', '2025-11-27 00:33:08');

-- --------------------------------------------------------

--
-- Table structure for table `check_ins`
--

CREATE TABLE `check_ins` (
  `id` int(10) UNSIGNED NOT NULL,`user_id` int(10) UNSIGNED DEFAULT NULL,`check_in_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),`latitude` decimal(10,8) DEFAULT NULL,`longitude` decimal(11,8) DEFAULT NULL,`address` varchar(255) DEFAULT NULL,`street` varchar(255) DEFAULT NULL,`village` varchar(255) DEFAULT NULL,`district` varchar(255) DEFAULT NULL,`country` varchar(255) DEFAULT NULL,`photo_path` varchar(255) DEFAULT NULL,`created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',`updated_at` timestamp NULL DEFAULT NULL,`year` int(11) DEFAULT NULL,`month` int(11) DEFAULT NULL,`day` int(11) DEFAULT NULL,`time` varchar(255) DEFAULT NULL,`day_of_week` int(11) DEFAULT NULL,`scan_type` varchar(20) NOT NULL DEFAULT 'check_in',`shift_period` varchar(20) DEFAULT NULL,`time_table_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `check_ins`
--

INSERT INTO `check_ins` (`id`, `user_id`, `check_in_time`, `latitude`, `longitude`, `address`, `street`, `village`, `district`, `country`, `photo_path`, `created_at`, `updated_at`, `year`, `month`, `day`, `time`, `day_of_week`, `scan_type`, `shift_period`, `time_table_id`) VALUES
(1, 1, '2025-12-01 13:40:20', 11.70404832, 104.94178411, 'Bak Kaeng, Chrouy Changva, Phnom Penh, Cambodia', 'Bak Kaeng', 'Chrouy Changva', 'Phnom Penh', 'Cambodia', NULL, '2025-12-01 06:40:32', '2025-12-01 06:40:32', 2025, 12, 1, '20:40', 1, 'check_in', 'night', 1),
(2, 1, '2025-12-01 14:42:15', 11.70404734, 104.94182622, 'Bak Kaeng, Chrouy Changva, Phnom Penh, Cambodia', 'Bak Kaeng', 'Chrouy Changva', 'Phnom Penh', 'Cambodia', NULL, '2025-12-01 07:42:24', '2025-12-01 07:42:24', 2025, 12, 1, '21:42', 1, 'check_out', 'night', 1),
(3, 1, '2025-12-01 14:48:17', 11.70398779, 104.94177222, 'Bak Kaeng, Chrouy Changva, Phnom Penh, Cambodia', 'Bak Kaeng', 'Chrouy Changva', 'Phnom Penh', 'Cambodia', NULL, '2025-12-01 07:48:36', '2025-12-01 07:48:36', 2025, 12, 1, '21:48', 1, 'check_in', 'night', 1),
(4, 1, '2026-01-12 11:55:40', 11.70407128, 104.94173884, 'Bak Kaeng, Chrouy Changva, Phnom Penh, Cambodia', 'Bak Kaeng', 'Chrouy Changva', 'Phnom Penh', 'Cambodia', NULL, '2026-01-12 04:55:50', '2026-01-12 04:55:50', 2026, 1, 12, '18:55', 1, 'check_in', 'night', 8),
(5, 1, '2026-01-12 11:57:16', 11.70404822, 104.94176964, 'Bak Kaeng, Chrouy Changva, Phnom Penh, Cambodia', 'Bak Kaeng', 'Chrouy Changva', 'Phnom Penh', 'Cambodia', NULL, '2026-01-12 04:57:47', '2026-01-12 04:57:47', 2026, 1, 12, '18:57', 1, 'check_out', 'night', 8);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'spa', '2025-11-27 00:33:08', '2025-11-27 00:33:08'),
(2, 'admin', '2025-11-27 00:33:08', '2025-11-27 00:33:08'),
(3, 'user', '2025-11-27 00:33:08', '2025-11-27 00:33:08');

-- --------------------------------------------------------

--
-- Table structure for table `shift_schedules`
--

CREATE TABLE `shift_schedules` (
  `id` int(10) UNSIGNED NOT NULL,
  `start_date` varchar(255) NOT NULL,
  `end_date` varchar(255) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `weekly_rules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`weekly_rules`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `allow_time_before` int(11) DEFAULT 15 COMMENT 'Minutes allowed before shift start time',
  `allow_time_after` int(11) DEFAULT 15 COMMENT 'Minutes allowed after shift end time',
  `allow_amount_scan` int(11) DEFAULT 4 COMMENT 'Maximum number of scans allowed per day',
  `allow_time_second_scan` int(11) DEFAULT 30 COMMENT 'Minimum seconds required between scans'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shift_schedules`
--

INSERT INTO `shift_schedules` (`id`, `start_date`, `end_date`, `created_by`, `weekly_rules`, `created_at`, `updated_at`, `allow_time_before`, `allow_time_after`, `allow_amount_scan`, `allow_time_second_scan`) VALUES
(1, '2025-11-01', '2025-12-31', 1, '{\"1\":\"Morning (08:00-12:00)\",\"2\":\"Morning (08:00-12:00)\",\"3\":\"Morning (08:00-12:00)\",\"4\":\"Morning (08:00-12:00)\",\"5\":\"Morning (08:00-12:00)\",\"6\":\"Off\",\"7\":\"Off\"}', '2025-11-27 00:36:57', '2025-11-27 00:36:57', 15, 15, 4, 30),
(2, '2026-01-01', '2026-12-31', 1, '{\"1\":\"Evening (13:00-17:00)\",\"2\":\"Evening (13:00-17:00)\",\"3\":\"Evening (13:00-17:00)\",\"4\":\"Evening (13:00-17:00)\",\"5\":\"Evening (13:00-17:00)\",\"6\":\"Off\",\"7\":\"Off\"}', '2025-11-27 00:38:05', '2025-11-27 00:38:05', 15, 15, 4, 30);

-- --------------------------------------------------------

--
-- Table structure for table `time_tables`
--

CREATE TABLE `time_tables` (
  `id` int(10) UNSIGNED NOT NULL,
  `shift_schedule_id` int(10) UNSIGNED DEFAULT NULL,
  `day_of_week` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `start_time` varchar(255) DEFAULT NULL,
  `end_time` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `time_tables`
--

INSERT INTO `time_tables` (`id`, `shift_schedule_id`, `day_of_week`, `label`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Morning', '08:00', '12:00', '2025-11-27 00:36:57', '2025-11-27 00:36:57'),
(2, 1, 2, 'Morning', '08:00', '12:00', '2025-11-27 00:36:57', '2025-11-27 00:36:57'),
(3, 1, 3, 'Morning', '08:00', '12:00', '2025-11-27 00:36:57', '2025-11-27 00:36:57'),
(4, 1, 4, 'Morning', '08:00', '12:00', '2025-11-27 00:36:57', '2025-11-27 00:36:57'),
(5, 1, 5, 'Morning', '08:00', '12:00', '2025-11-27 00:36:57', '2025-11-27 00:36:57'),
(6, 1, 6, 'Off', NULL, NULL, '2025-11-27 00:36:57', '2025-11-27 00:36:57'),
(7, 1, 7, 'Off', NULL, NULL, '2025-11-27 00:36:57', '2025-11-27 00:36:57'),
(8, 2, 1, 'Evening', '13:00', '17:00', '2025-11-27 00:38:05', '2025-11-27 00:38:05'),
(9, 2, 2, 'Evening', '13:00', '17:00', '2025-11-27 00:38:05', '2025-11-27 00:38:05'),
(10, 2, 3, 'Evening', '13:00', '17:00', '2025-11-27 00:38:05', '2025-11-27 00:38:05'),
(11, 2, 4, 'Evening', '13:00', '17:00', '2025-11-27 00:38:05', '2025-11-27 00:38:05'),
(12, 2, 5, 'Evening', '13:00', '17:00', '2025-11-27 00:38:05', '2025-11-27 00:38:05'),
(13, 2, 6, 'Off', NULL, NULL, '2025-11-27 00:38:05', '2025-11-27 00:38:05'),
(14, 2, 7, 'Off', NULL, NULL, '2025-11-27 00:38:05', '2025-11-27 00:38:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `birth_of_date` varchar(255) DEFAULT NULL,
  `profile_picture` text DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT '1',
  `campus_id` int(10) UNSIGNED DEFAULT NULL,
  `fcm_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone_number`, `address`, `gender`, `birth_of_date`, `profile_picture`, `role`, `status`, `campus_id`, `fcm_token`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@gmail.com', '$scrypt$n=16384,r=8,p=1$7xH/K4ngYQh3JgimmOKeJA$1vSDICzacDDGUTaOPbNTP9VhdF9YTtJfYyRRkE8ZgoHTMRdGQk7GBO1XO4uFIRDv9G/mE48pTQ19tjVq7E7mxg', NULL, NULL, NULL, NULL, NULL, 'admin', '1', 1, NULL, '2026-03-22 01:09:36', '2025-11-27 00:33:08'),
(2, 'user', 'user@gmail.com', '$scrypt$n=16384,r=8,p=1$+DqhG1IIde53iOXESkoKVg$jC6oyGWajiW4qkZZGqZXd80AQpZ+kddlkjCrtFhI+ZjgCtF5OiTgbwoDq2DHYzG65jk3c0hb0skBQC3c+OM3+A', NULL, NULL, NULL, NULL, NULL, 'user', '1', 1, NULL, '2025-11-27 00:33:08', '2025-11-27 00:33:08');

-- --------------------------------------------------------

--
-- Table structure for table `user_shift_schedules`
--

CREATE TABLE `user_shift_schedules` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `shift_schedule_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_shift_schedules`
--

INSERT INTO `user_shift_schedules` (`id`, `user_id`, `shift_schedule_id`, `assigned_by`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, '2025-11-27 00:38:11', '2025-11-27 00:38:11'),
(2, 2, 2, 1, '2025-11-27 00:38:11', '2025-11-27 00:38:11'),
(3, 1, 1, 1, '2025-11-27 00:38:15', '2025-11-27 00:38:15'),
(4, 2, 1, 1, '2025-11-27 00:38:15', '2025-11-27 00:38:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `adonis_schema`
--
ALTER TABLE `adonis_schema`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `adonis_schema_versions`
--
ALTER TABLE `adonis_schema_versions`
  ADD PRIMARY KEY (`version`);

--
-- Indexes for table `auth_access_tokens`
--
ALTER TABLE `auth_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `auth_access_tokens_tokenable_id_foreign` (`tokenable_id`);

--
-- Indexes for table `campuses`
--
ALTER TABLE `campuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `check_ins`
--
ALTER TABLE `check_ins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `check_ins_user_id_foreign` (`user_id`),
  ADD KEY `check_ins_time_table_id_foreign` (`time_table_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shift_schedules`
--
ALTER TABLE `shift_schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `time_tables`
--
ALTER TABLE `time_tables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `time_tables_shift_schedule_id_foreign` (`shift_schedule_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_campus_id_foreign` (`campus_id`);

--
-- Indexes for table `user_shift_schedules`
--
ALTER TABLE `user_shift_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_shift_schedules_user_id_shift_schedule_id_unique` (`user_id`,`shift_schedule_id`),
  ADD KEY `user_shift_schedules_shift_schedule_id_foreign` (`shift_schedule_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `adonis_schema`
--
ALTER TABLE `adonis_schema`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `auth_access_tokens`
--
ALTER TABLE `auth_access_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `campuses`
--
ALTER TABLE `campuses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `check_ins`
--
ALTER TABLE `check_ins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `shift_schedules`
--
ALTER TABLE `shift_schedules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `time_tables`
--
ALTER TABLE `time_tables`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_shift_schedules`
--
ALTER TABLE `user_shift_schedules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_access_tokens`
--
ALTER TABLE `auth_access_tokens`
  ADD CONSTRAINT `auth_access_tokens_tokenable_id_foreign` FOREIGN KEY (`tokenable_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `check_ins`
--
ALTER TABLE `check_ins`
  ADD CONSTRAINT `check_ins_time_table_id_foreign` FOREIGN KEY (`time_table_id`) REFERENCES `time_tables` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `check_ins_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `time_tables`
--
ALTER TABLE `time_tables`
  ADD CONSTRAINT `time_tables_shift_schedule_id_foreign` FOREIGN KEY (`shift_schedule_id`) REFERENCES `shift_schedules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_campus_id_foreign` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`);

--
-- Constraints for table `user_shift_schedules`
--
ALTER TABLE `user_shift_schedules`
  ADD CONSTRAINT `user_shift_schedules_shift_schedule_id_foreign` FOREIGN KEY (`shift_schedule_id`) REFERENCES `shift_schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_shift_schedules_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
