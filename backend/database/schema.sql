-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mise
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint unsigned NOT NULL,
  `pantry_item_id` bigint unsigned DEFAULT NULL,
  `pantry_batch_id` bigint unsigned DEFAULT NULL,
  `alert_type` enum('LOW_STOCK','OUT_OF_STOCK','EXPIRING_SOON','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dedupe_key` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `status` enum('ACTIVE','RESOLVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_alerts_workspace_dedupe` (`workspace_id`,`dedupe_key`),
  KEY `idx_alerts_workspace_status` (`workspace_id`,`status`,`created_at`),
  KEY `idx_alerts_pantry_item` (`pantry_item_id`),
  KEY `idx_alerts_pantry_batch` (`pantry_batch_id`),
  CONSTRAINT `fk_alerts_pantry_batch` FOREIGN KEY (`pantry_batch_id`) REFERENCES `pantry_batches` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_alerts_pantry_item` FOREIGN KEY (`pantry_item_id`) REFERENCES `pantry_items` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_alerts_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_alerts_resolved` CHECK ((((`status` = _utf8mb4'ACTIVE') and (`resolved_at` is null)) or ((`status` = _utf8mb4'RESOLVED') and (`resolved_at` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `household_invitations`
--

DROP TABLE IF EXISTS `household_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `household_invitations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `household_id` bigint unsigned NOT NULL,
  `inviter_user_id` bigint unsigned NOT NULL,
  `invitee_user_id` bigint unsigned NOT NULL,
  `status` enum('PENDING','ACCEPTED','DECLINED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` datetime DEFAULT NULL,
  `pending_slot` tinyint GENERATED ALWAYS AS ((case when (`status` = _utf8mb4'PENDING') then 1 else NULL end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_household_pending_invitation` (`household_id`,`invitee_user_id`,`pending_slot`),
  KEY `idx_invitations_inviter` (`inviter_user_id`),
  KEY `idx_invitations_invitee_status` (`invitee_user_id`,`status`),
  KEY `idx_invitations_household_status` (`household_id`,`status`),
  CONSTRAINT `fk_invitations_household` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_invitations_invitee` FOREIGN KEY (`invitee_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_invitations_inviter` FOREIGN KEY (`inviter_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `household_members`
--

DROP TABLE IF EXISTS `household_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `household_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `household_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `role` enum('ADMIN','MEMBER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_household_member` (`household_id`,`user_id`),
  UNIQUE KEY `uq_household_members_user` (`user_id`),
  CONSTRAINT `fk_household_members_household` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_household_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `households`
--

DROP TABLE IF EXISTS `households`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `households` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitation_code` char(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `invitation_code_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_households_workspace_id` (`workspace_id`),
  UNIQUE KEY `uq_households_invitation_code` (`invitation_code`),
  CONSTRAINT `fk_households_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ingredient_aliases`
--

DROP TABLE IF EXISTS `ingredient_aliases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient_aliases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ingredient_id` bigint unsigned NOT NULL,
  `alias_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ingredient_aliases_name` (`alias_name`),
  KEY `idx_ingredient_aliases_ingredient` (`ingredient_id`),
  CONSTRAINT `fk_ingredient_aliases_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_ingredient_aliases_name` CHECK ((char_length(trim(`alias_name`)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `canonical_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ingredients_canonical_name` (`canonical_name`),
  CONSTRAINT `chk_ingredients_name` CHECK ((char_length(trim(`canonical_name`)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_plan_items`
--

DROP TABLE IF EXISTS `monthly_plan_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_plan_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `monthly_plan_id` bigint unsigned NOT NULL,
  `workspace_id` bigint unsigned NOT NULL,
  `ingredient_id` bigint unsigned DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit` enum('PIECES','KG','LITERS','PACKS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('ESSENTIAL','OPTIONAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `added_by` bigint unsigned DEFAULT NULL,
  `status_at_closure` enum('TO_BUY','CLAIMED','PURCHASED_AWAITING_PANTRY','RESTOCKED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyer_at_closure` bigint unsigned DEFAULT NULL,
  `purchased_at_closure` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_monthly_plan_items_id_workspace` (`id`,`workspace_id`),
  KEY `idx_monthly_plan_items_plan_workspace` (`monthly_plan_id`,`workspace_id`),
  KEY `idx_monthly_plan_items_ingredient` (`ingredient_id`),
  KEY `idx_monthly_plan_items_added_by` (`added_by`),
  KEY `idx_monthly_plan_items_buyer` (`buyer_at_closure`),
  CONSTRAINT `fk_monthly_plan_items_buyer` FOREIGN KEY (`buyer_at_closure`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_monthly_plan_items_contributor` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_monthly_plan_items_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_monthly_plan_items_plan` FOREIGN KEY (`monthly_plan_id`, `workspace_id`) REFERENCES `monthly_plans` (`id`, `workspace_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_monthly_plan_items_name` CHECK ((char_length(trim(`name`)) > 0)),
  CONSTRAINT `chk_monthly_plan_items_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_plans`
--

DROP TABLE IF EXISTS `monthly_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint unsigned NOT NULL,
  `plan_year` smallint unsigned NOT NULL,
  `plan_month` tinyint unsigned NOT NULL,
  `plan_timezone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `deadline_at` datetime NOT NULL,
  `status` enum('PLANNING','ACTIVE','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PLANNING',
  `closed_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_monthly_plans_period` (`workspace_id`,`plan_year`,`plan_month`),
  UNIQUE KEY `uq_monthly_plans_id_workspace` (`id`,`workspace_id`),
  KEY `idx_monthly_plans_deadline` (`status`,`deadline_at`),
  KEY `idx_monthly_plans_creator` (`created_by`),
  CONSTRAINT `fk_monthly_plans_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_monthly_plans_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_monthly_plans_closed` CHECK ((((`status` = _utf8mb4'CLOSED') and (`closed_at` is not null) and (`closed_at` >= `deadline_at`)) or ((`status` <> _utf8mb4'CLOSED') and (`closed_at` is null)))),
  CONSTRAINT `chk_monthly_plans_month` CHECK ((`plan_month` between 1 and 12)),
  CONSTRAINT `chk_monthly_plans_year` CHECK ((`plan_year` between 1000 and 9999))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_history`
--

DROP TABLE IF EXISTS `notification_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `alert_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `channel` enum('SMS') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SMS',
  `status` enum('PENDING','SENDING','SENT','DELIVERED','FAILED','SKIPPED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `attempt_count` smallint unsigned NOT NULL DEFAULT '0',
  `provider_message_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_error` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_attempt_at` datetime DEFAULT NULL,
  `next_attempt_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notification_alert_recipient` (`alert_id`,`user_id`,`channel`),
  KEY `idx_notification_recipient` (`user_id`,`created_at`),
  KEY `idx_notification_retry` (`status`,`next_attempt_at`),
  CONSTRAINT `fk_notification_history_alert` FOREIGN KEY (`alert_id`) REFERENCES `alerts` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_notification_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pantry_batches`
--

DROP TABLE IF EXISTS `pantry_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pantry_batches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pantry_item_id` bigint unsigned NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `storage_location` enum('FRIDGE','CUPBOARD','FREEZER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pantry_batches_item_expiry` (`pantry_item_id`,`expiry_date`),
  KEY `idx_pantry_batches_expiry` (`expiry_date`),
  KEY `idx_pantry_batches_creator` (`created_by`),
  CONSTRAINT `fk_pantry_batches_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_pantry_batches_item` FOREIGN KEY (`pantry_item_id`) REFERENCES `pantry_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_pantry_batches_quantity` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pantry_items`
--

DROP TABLE IF EXISTS `pantry_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pantry_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint unsigned NOT NULL,
  `ingredient_id` bigint unsigned DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(32) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `image_url` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` enum('PIECES','KG','LITERS','PACKS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_quantity` decimal(12,3) DEFAULT NULL,
  `package_unit` enum('PIECES','KG','LITERS') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `minimum_stock` decimal(12,3) DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `item_key` varchar(160) COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS ((case when (`barcode` is not null) then convert(concat(_ascii'B:',`barcode`) using utf8mb4) else concat(_utf8mb4'N:',trim(`name`)) end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pantry_workspace_product_unit` (`workspace_id`,`unit`,`item_key`),
  KEY `idx_pantry_workspace_name` (`workspace_id`,`name`),
  KEY `idx_pantry_workspace_ingredient` (`workspace_id`,`ingredient_id`),
  KEY `idx_pantry_ingredient` (`ingredient_id`),
  KEY `idx_pantry_created_by` (`created_by`),
  CONSTRAINT `fk_pantry_items_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_pantry_items_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_pantry_items_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_pantry_items_barcode` CHECK (((`barcode` is null) or (char_length(`barcode`) > 0))),
  CONSTRAINT `chk_pantry_items_minimum` CHECK (((`minimum_stock` is null) or (`minimum_stock` >= 0))),
  CONSTRAINT `chk_pantry_items_name` CHECK ((char_length(trim(`name`)) > 0)),
  CONSTRAINT `chk_pantry_items_package` CHECK ((((`package_quantity` is null) and (`package_unit` is null)) or ((`package_quantity` is not null) and (`package_quantity` > 0) and (`package_unit` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipe_metadata`
--

DROP TABLE IF EXISTS `recipe_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_metadata` (
  `recipe_id` varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `duration_minutes` smallint unsigned DEFAULT NULL,
  `difficulty` enum('EASY','MEDIUM','HARD') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`recipe_id`),
  CONSTRAINT `chk_recipe_metadata_duration` CHECK (((`duration_minutes` is null) or (`duration_minutes` > 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `refresh_token_hash` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sessions_refresh_token_hash` (`refresh_token_hash`),
  KEY `idx_sessions_user_revoked` (`user_id`,`revoked_at`),
  KEY `idx_sessions_expires_at` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_sessions_expiry` CHECK ((`expires_at` > `created_at`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shopping_items`
--

DROP TABLE IF EXISTS `shopping_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint unsigned NOT NULL,
  `monthly_plan_item_id` bigint unsigned DEFAULT NULL,
  `ingredient_id` bigint unsigned DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit` enum('PIECES','KG','LITERS','PACKS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active_list` enum('QUICK','MONTHLY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'QUICK',
  `status` enum('TO_BUY','CLAIMED','PURCHASED_AWAITING_PANTRY','RESTOCKED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TO_BUY',
  `source` enum('MANUAL','RECIPE','LOW_STOCK','MONTHLY_ROLLOVER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MANUAL',
  `source_recipe_id` varchar(32) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `source_pantry_item_id` bigint unsigned DEFAULT NULL,
  `restocked_pantry_item_id` bigint unsigned DEFAULT NULL,
  `added_by` bigint unsigned DEFAULT NULL,
  `assigned_to` bigint unsigned DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `purchased_at` datetime DEFAULT NULL,
  `restocked_at` datetime DEFAULT NULL,
  `rolled_over_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `low_stock_pending_slot` tinyint GENERATED ALWAYS AS ((case when ((`source` = _utf8mb4'LOW_STOCK') and (`status` <> _utf8mb4'RESTOCKED')) then 1 else NULL end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shopping_monthly_item` (`monthly_plan_item_id`),
  UNIQUE KEY `uq_shopping_pending_low_stock` (`workspace_id`,`source_pantry_item_id`,`low_stock_pending_slot`),
  KEY `idx_shopping_monthly_workspace` (`monthly_plan_item_id`,`workspace_id`),
  KEY `idx_shopping_workspace_list_status` (`workspace_id`,`active_list`,`status`),
  KEY `idx_shopping_recipe_lookup` (`workspace_id`,`source_recipe_id`,`ingredient_id`,`status`),
  KEY `idx_shopping_ingredient` (`ingredient_id`),
  KEY `idx_shopping_source_pantry` (`source_pantry_item_id`),
  KEY `idx_shopping_restocked_pantry` (`restocked_pantry_item_id`),
  KEY `idx_shopping_contributor` (`added_by`),
  KEY `idx_shopping_buyer_status` (`assigned_to`,`status`),
  CONSTRAINT `fk_shopping_items_buyer` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_shopping_items_contributor` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_shopping_items_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_shopping_items_monthly` FOREIGN KEY (`monthly_plan_item_id`, `workspace_id`) REFERENCES `monthly_plan_items` (`id`, `workspace_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_shopping_items_restocked_pantry` FOREIGN KEY (`restocked_pantry_item_id`) REFERENCES `pantry_items` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_shopping_items_source_pantry` FOREIGN KEY (`source_pantry_item_id`) REFERENCES `pantry_items` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_shopping_items_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_shopping_items_name` CHECK ((char_length(trim(`name`)) > 0)),
  CONSTRAINT `chk_shopping_items_purchase_state` CHECK ((((`status` in (_utf8mb4'TO_BUY',_utf8mb4'CLAIMED')) and (`purchased_at` is null) and (`restocked_at` is null)) or ((`status` = _utf8mb4'PURCHASED_AWAITING_PANTRY') and (`purchased_at` is not null) and (`restocked_at` is null)) or ((`status` = _utf8mb4'RESTOCKED') and (`purchased_at` is not null) and (`restocked_at` is not null) and (`restocked_at` >= `purchased_at`)))),
  CONSTRAINT `chk_shopping_items_quantity` CHECK ((`quantity` > 0)),
  CONSTRAINT `chk_shopping_items_rollover` CHECK (((`rolled_over_at` is null) or (`active_list` = _utf8mb4'QUICK')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `user_id` bigint unsigned NOT NULL,
  `phone_number` varchar(16) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `sms_enabled` tinyint unsigned NOT NULL DEFAULT '0',
  `sms_consent_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_user_preferences_sms_enabled` CHECK ((`sms_enabled` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workspaces`
--

DROP TABLE IF EXISTS `workspaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workspaces` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workspace_type` enum('PERSONAL','HOUSEHOLD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_user_id` bigint unsigned NOT NULL,
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workspaces_created_by_user` (`created_by_user_id`),
  CONSTRAINT `fk_workspaces_created_by_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26 17:41:46
