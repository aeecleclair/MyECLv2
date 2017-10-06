-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 30, 2014 at 09:32 AM
-- Server version: 5.5.33
-- PHP Version: 5.5.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `dashboard_demo`
--

-- --------------------------------------------------------

--
-- Table structure for table `invheader`
--

CREATE TABLE `invheader` (
  `invid` int(11) NOT NULL AUTO_INCREMENT,
  `invdate` date NOT NULL,
  `client_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `closed` char(3) DEFAULT 'No',
  `ship_via` char(50) DEFAULT NULL,
  `note` char(100) DEFAULT NULL,
  PRIMARY KEY (`invid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=15 ;

--
-- Dumping data for table `invheader`
--

INSERT INTO `invheader` (`invid`, `invdate`, `client_id`, `amount`, `tax`, `total`, `closed`, `ship_via`, `note`) VALUES
(1, '2010-01-01', 2045, 103.98, 45.34, 149.32, 'No', 'TNT', 'This is record 1'),
(2, '2010-01-02', 2046, 104.98, 46.34, 151.32, 'No', 'FedEx', 'This is record 2'),
(3, '2010-01-03', 2047, 105.98, 47.34, 153.32, 'No', 'TNT', 'This is record 3'),
(4, '2010-01-04', 2048, 106.98, 48.34, 155.32, 'No', 'TNT', 'This is record 4'),
(5, '2010-01-05', 2049, 107.98, 49.34, 157.32, 'No', 'TNT', 'This is record 5'),
(6, '2010-01-06', 2050, 108.98, 50.34, 159.32, 'No', 'FedEx', 'This is record 6'),
(7, '2010-01-07', 2051, 109.98, 51.34, 161.32, 'No', 'FedEx', 'This is record 7'),
(8, '2010-01-08', 2052, 110.98, 52.34, 163.32, 'No', 'FedEx', 'This is record 8'),
(9, '2010-01-09', 2053, 111.98, 53.34, 165.32, 'No', 'FedEx', 'This is record 9'),
(10, '2010-01-10', 2054, 112.98, 54.34, 167.32, 'No', 'TNT', 'This is record 10'),
(11, '2010-01-11', 2055, 113.98, 55.34, 169.32, 'No', 'TNT', 'This is record 11'),
(12, '2010-01-12', 2056, 114.98, 56.34, 171.32, 'No', 'FedEx', 'This is record 12'),
(13, '2010-01-13', 2057, 115.98, 57.34, 173.32, 'No', 'FedEx', 'This is record 13'),
(14, '2010-01-14', 2058, 116.98, 58.34, 175.32, 'No', 'FedEx', 'This is record 14');
