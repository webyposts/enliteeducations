CREATE DATABASE IF NOT EXISTS enliteeducations
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE enliteeducations;

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(190) NOT NULL,
  role VARCHAR(50) NOT NULL,
  role_label VARCHAR(80) NOT NULL,
  organization VARCHAR(190) NOT NULL DEFAULT '',
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL DEFAULT '',
  user_agent VARCHAR(255) NOT NULL DEFAULT '',
  email_status ENUM('pending','sent','skipped','failed') NOT NULL DEFAULT 'pending',
  email_error VARCHAR(255) DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_created (created_at),
  KEY idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
