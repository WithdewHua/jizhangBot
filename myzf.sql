/*
 Navicat Premium Data Transfer

 Source Server         : trx
 Source Server Type    : MySQL
 Source Server Version : 80032
 Source Host           : localhost:3306
 Source Schema         : myzf

 Target Server Type    : MySQL
 Target Server Version : 80032
 File Encoding         : 65001

 Date: 25/06/2024 16:39:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for group1002181037525
-- ----------------------------
DROP TABLE IF EXISTS `group1002181037525`;
CREATE TABLE `group1002181037525`  (
  `amount` int(0) NOT NULL,
  `huilv` float NOT NULL,
  `type` int(0) NULL DEFAULT 0,
  `msgid` int(0) NOT NULL,
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group1002195483740
-- ----------------------------
DROP TABLE IF EXISTS `group1002195483740`;
CREATE TABLE `group1002195483740`  (
  `amount` int(0) NOT NULL,
  `huilv` float NOT NULL,
  `type` int(0) NULL DEFAULT 0,
  `msgid` int(0) NOT NULL,
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group4134938343
-- ----------------------------
DROP TABLE IF EXISTS `group4134938343`;
CREATE TABLE `group4134938343`  (
  `amount` int(0) NOT NULL,
  `huilv` float NOT NULL,
  `type` int(0) NULL DEFAULT 0,
  `msgid` int(0) NOT NULL,
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group4202348056
-- ----------------------------
DROP TABLE IF EXISTS `group4202348056`;
CREATE TABLE `group4202348056`  (
  `amount` int(0) NOT NULL,
  `huilv` float NOT NULL,
  `type` int(0) NULL DEFAULT 0,
  `msgid` int(0) NOT NULL,
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group4220588843
-- ----------------------------
DROP TABLE IF EXISTS `group4220588843`;
CREATE TABLE `group4220588843`  (
  `amount` int(0) NOT NULL,
  `huilv` float NOT NULL,
  `type` int(0) NULL DEFAULT 0,
  `msgid` int(0) NOT NULL,
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for group4266995827
-- ----------------------------
DROP TABLE IF EXISTS `group4266995827`;
CREATE TABLE `group4266995827`  (
  `amount` int(0) NOT NULL,
  `huilv` float NOT NULL,
  `type` int(0) NULL DEFAULT 0,
  `msgid` int(0) NOT NULL,
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for grouplist
-- ----------------------------
DROP TABLE IF EXISTS `grouplist`;
CREATE TABLE `grouplist`  (
  `id` bigint(0) NOT NULL,
  `huilv` float NULL DEFAULT 1,
  `admin` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `create_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `inviterId` bigint(0) NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '0',
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `jisuanStatus` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '1',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
