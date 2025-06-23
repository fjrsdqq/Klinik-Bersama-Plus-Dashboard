-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2025 at 01:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `klinik`
--

-- --------------------------------------------------------

--
-- Table structure for table `medical_data`
--

CREATE TABLE `medical_data` (
  `id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `cholesterol` float DEFAULT NULL,
  `blood_sugar` float DEFAULT NULL,
  `uric_acid` float DEFAULT NULL,
  `tanggal` date DEFAULT curdate(),
  `address` varchar(255) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `check_time` time DEFAULT NULL,
  `tension` varchar(20) DEFAULT NULL,
  `result` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_data`
--

INSERT INTO `medical_data` (`id`, `username`, `cholesterol`, `blood_sugar`, `uric_acid`, `tanggal`, `address`, `birthdate`, `check_time`, `tension`, `result`) VALUES
(1, 'user1', 200, 140, 100, '2025-06-22', NULL, NULL, NULL, NULL, NULL),
(2, 'user2', 150, 160, 110, '2025-06-22', NULL, NULL, NULL, NULL, NULL),
(3, 'user1', 210, 150, 190, '2025-06-22', NULL, NULL, NULL, NULL, NULL),
(4, 'user1', 240, 150, 120, '2025-06-22', NULL, NULL, NULL, NULL, NULL),
(5, 'fajar', 200, 200, 3, '2025-06-22', 'Jl.Kp. Padurenan RT 04 RW 01 No. 65 Kel. Pabuaran Kec. Cibionong Kab. Bogor', '1999-05-02', '17:33:00', '120', 'baik'),
(6, 'Ferdi', 200, 200, 2, '2025-06-23', 'jl.kp.citayam no.12', '2004-03-02', '07:57:00', '131', 'tidak stabil'),
(7, 'fajar', 200, 200, 4, '2025-06-23', 'Jl.Kp. Padurenan RT 04 RW 01 No. 65 Kel. Pabuaran Kec. Cibionong Kab. Bogor', '1999-05-02', '05:59:00', '110', 'stabil'),
(8, 'fajar', 200, 200, 4, '2025-06-23', 'Jl.Kp. Padurenan RT 04 RW 01 No. 65 Kel. Pabuaran Kec. Cibionong Kab. Bogor', '1999-05-02', '19:54:00', '100', 'normal');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `birthdate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `gender`, `birthdate`) VALUES
(1, 'Fajar Sidik', 'fajarsidik09131@gmail.com', '$2b$10$1MZZrmL3gO7glS4ZWzSzy.QsnZ5vO0ejDE1RyslRPRSalrd9UED8e', 'Male', '1999-07-02'),
(2, 'indra', 'apaaja@gmail.com', '$2b$10$ArPBAqSBZfl5jvjy8/DVI.ykX5L6o.ozkGSUjqBJEOrnSxTb/YKIa', 'Male', '1952-02-12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `medical_data`
--
ALTER TABLE `medical_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `medical_data`
--
ALTER TABLE `medical_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
