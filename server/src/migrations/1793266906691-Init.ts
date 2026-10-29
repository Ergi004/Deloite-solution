import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1793266906691 implements MigrationInterface {
  name = 'Init1793266906691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`company\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`slug\` varchar(150) NOT NULL, \`logo_url\` varchar(500) NULL, \`industries\` json NOT NULL, \`default_invite_expiry_days\` int NOT NULL DEFAULT '14', \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`IDX_47216baa0f0c8ebc6ee5a74989\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`student_profile\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, \`first_name\` varchar(100) NULL, \`last_name\` varchar(100) NULL, \`phone\` varchar(32) NULL, \`city\` varchar(100) NULL, \`country\` varchar(100) NULL, \`avatar_url\` varchar(500) NULL, \`bio\` text NULL, \`linkedin_url\` varchar(300) NULL, \`github_url\` varchar(300) NULL, \`portfolio_url\` varchar(300) NULL, \`available_from\` date NULL, \`university\` varchar(150) NULL, \`degree_level\` varchar(50) NULL, \`field_of_study\` varchar(150) NULL, \`graduation_year\` int NULL, \`gpa\` decimal(3,2) NULL, \`notable_projects\` text NULL, \`languages\` json NULL, \`preferred_industry\` varchar(100) NULL, \`interests\` json NULL, \`day_to_day_preferences\` json NULL, \`day_to_day_other\` text NULL, \`soft_skills_self\` json NULL, \`soft_skills_situational\` json NULL, \`role_family\` varchar(100) NULL, \`target_role\` varchar(150) NULL, \`track_preference\` enum ('INDIVIDUAL_CONTRIBUTOR', 'PEOPLE_LEADERSHIP', 'UNSURE') NULL, \`target_horizon_years\` int NULL, \`target_level\` varchar(50) NULL, \`goal_statement\` text NULL, \`weekly_learning_hours\` int NULL, \`expectations\` json NULL, \`salary_expectation_band\` varchar(100) NULL, \`consent_privacy_at\` datetime(3) NULL, \`consent_ai_at\` datetime(3) NULL, \`onboarding_step\` int NOT NULL DEFAULT '1', \`onboarding_completed_at\` datetime(3) NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`REL_1f5209fc71a9181affa7647b8b\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`company_id\` varchar(36) NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`role\` enum ('COMPANY_ADMIN', 'STUDENT') NOT NULL, \`status\` enum ('ACTIVE', 'ARCHIVED', 'PENDING') NOT NULL DEFAULT 'PENDING', \`last_login_at\` datetime(3) NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), INDEX \`IDX_9e70b5f9d7095018e86970c787\` (\`company_id\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`refresh_token\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`expires_at\` datetime(3) NOT NULL, \`revoked_at\` datetime(3) NULL, \`replaced_by_token_id\` char(36) NULL, \`user_agent\` varchar(300) NULL, \`ip\` varchar(64) NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX \`IDX_6bbe63d2fe75e7f0ba1710351d\` (\`user_id\`), UNIQUE INDEX \`IDX_f0812282fad2e352cdaf83ef0a\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`skill\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`category\` enum ('TECHNICAL', 'TOOL', 'SOFT', 'DOMAIN', 'LANGUAGE') NOT NULL, \`role_families\` json NOT NULL, \`description\` text NOT NULL, UNIQUE INDEX \`IDX_0f49a593960360f6f85b692aca\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_skill\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, \`skill_id\` varchar(36) NOT NULL, \`level\` int NOT NULL, \`source\` enum ('SELF', 'ASSESSED', 'COURSE_VERIFIED') NOT NULL DEFAULT 'SELF', \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), INDEX \`IDX_e4ba866607554d86dc9c2a6c0e\` (\`user_id\`), INDEX \`IDX_215460dc28b2f3cb6507c315eb\` (\`skill_id\`), UNIQUE INDEX \`IDX_91999f680543f1b5f6689af1a0\` (\`user_id\`, \`skill_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`onboarding_response\` (\`id\` varchar(36) NOT NULL, \`user_id\` char(36) NOT NULL, \`step\` int NOT NULL, \`data\` json NOT NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), INDEX \`IDX_b1149ff65af3b03265159cb936\` (\`user_id\`), UNIQUE INDEX \`IDX_7e8881e9749125621ae444887a\` (\`user_id\`, \`step\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`job\` (\`id\` varchar(36) NOT NULL, \`company_id\` varchar(36) NOT NULL, \`code\` varchar(30) NOT NULL, \`title\` varchar(150) NOT NULL, \`department\` varchar(100) NOT NULL, \`role_family\` varchar(100) NOT NULL, \`industry\` varchar(100) NOT NULL, \`seniority\` enum ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD') NOT NULL, \`employment_type\` varchar(50) NOT NULL DEFAULT 'Full-time', \`location\` varchar(150) NOT NULL, \`work_mode\` enum ('ONSITE', 'HYBRID', 'REMOTE') NOT NULL, \`salary_min\` int NULL, \`salary_max\` int NULL, \`salary_currency\` varchar(10) NULL, \`openings\` int NOT NULL DEFAULT '1', \`status\` enum ('DRAFT', 'OPEN', 'CLOSED', 'PLANNED') NOT NULL DEFAULT 'DRAFT', \`target_start_date\` date NULL, \`closing_date\` date NULL, \`summary\` text NOT NULL, \`responsibilities\` json NOT NULL, \`nice_to_have_skills\` json NULL, \`tools_and_tech\` json NOT NULL, \`education_requirement\` varchar(200) NOT NULL, \`min_years_experience\` decimal(3,1) NOT NULL DEFAULT '0.0', \`languages\` json NOT NULL, \`soft_skill_requirements\` json NOT NULL, \`months_to_productivity\` int NOT NULL, \`promotion_criteria\` json NOT NULL, \`reports_to\` varchar(150) NULL, \`team_size\` int NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), INDEX \`IDX_51cb12c924d3e8c7465cc8edff\` (\`company_id\`), INDEX \`IDX_1df8104ffb698c8a9fae893c55\` (\`role_family\`), INDEX \`IDX_8621fd94dcf215eab39883476c\` (\`industry\`), INDEX \`IDX_bac37f13b06c08534012dc3607\` (\`status\`), UNIQUE INDEX \`IDX_19a318ef2f7c34a6248ebfa9ff\` (\`company_id\`, \`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`job_skill\` (\`id\` varchar(36) NOT NULL, \`job_id\` varchar(36) NOT NULL, \`skill_id\` varchar(36) NOT NULL, \`min_level\` int NOT NULL, \`weight\` int NOT NULL, \`is_required\` tinyint NOT NULL DEFAULT 1, INDEX \`IDX_57d07c4be198a93a91fa847981\` (\`job_id\`), INDEX \`IDX_380feeef9ae48bb593b5acd923\` (\`skill_id\`), UNIQUE INDEX \`IDX_119a6ffc60b3ce0973262b3a74\` (\`job_id\`, \`skill_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`job_progression\` (\`id\` varchar(36) NOT NULL, \`from_job_id\` varchar(36) NOT NULL, \`to_job_id\` varchar(36) NOT NULL, \`typical_months\` int NOT NULL, \`notes\` varchar(300) NULL, INDEX \`IDX_0e6535d86aa7f020c6f6d09a8f\` (\`from_job_id\`), INDEX \`IDX_05850bdeb12792a5a3aeeb62f7\` (\`to_job_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`invitation\` (\`id\` varchar(36) NOT NULL, \`company_id\` varchar(36) NOT NULL, \`email\` varchar(255) NULL, \`token_hash\` varchar(255) NOT NULL, \`expires_at\` datetime(3) NOT NULL, \`used_at\` datetime(3) NULL, \`used_by_user_id\` varchar(36) NULL, \`revoked_at\` datetime(3) NULL, \`created_by_id\` char(36) NOT NULL, \`note\` varchar(300) NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX \`IDX_088c9b15c9465faaa40472b71c\` (\`company_id\`), UNIQUE INDEX \`IDX_b827d3749ffbb3b5ab5099afd6\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`course\` (\`id\` varchar(36) NOT NULL, \`company_id\` varchar(36) NULL, \`title\` varchar(200) NOT NULL, \`provider\` varchar(150) NOT NULL, \`url\` varchar(500) NOT NULL, \`format\` enum ('VIDEO', 'READING', 'PROJECT', 'BOOTCAMP', 'CERTIFICATION', 'MENTORING', 'INTERNAL') NOT NULL, \`level\` enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL, \`estimated_hours\` int NOT NULL, \`language\` varchar(50) NOT NULL DEFAULT 'English', \`cost\` varchar(50) NOT NULL DEFAULT 'Free', \`is_internal\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_c30695ab5ff2a672b5276270b0\` (\`company_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`course_skill\` (\`id\` varchar(36) NOT NULL, \`course_id\` varchar(36) NOT NULL, \`skill_id\` varchar(36) NOT NULL, \`level_gained\` int NOT NULL, INDEX \`IDX_fc716ec22d754eadaf1b01d044\` (\`course_id\`), INDEX \`IDX_22dc1cfd6fe00a3353f7a52c3b\` (\`skill_id\`), UNIQUE INDEX \`IDX_cd7ecb22aebe82fc19cbcf0247\` (\`course_id\`, \`skill_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`career_path\` (\`id\` varchar(36) NOT NULL, \`user_id\` char(36) NOT NULL, \`version\` int NOT NULL, \`status\` enum ('GENERATING', 'READY', 'FAILED', 'SUPERSEDED') NOT NULL DEFAULT 'GENERATING', \`input_snapshot\` json NULL, \`output\` json NULL, \`validation_report\` json NULL, \`generation_method\` enum ('AI', 'FALLBACK') NULL, \`model\` varchar(100) NULL, \`prompt_version\` varchar(50) NULL, \`tokens_in\` int NULL, \`tokens_out\` int NULL, \`feedback\` enum ('UP', 'DOWN') NULL, \`feedback_note\` varchar(500) NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), INDEX \`IDX_55694961638c5591c0941ac348\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`audit_log\` (\`id\` varchar(36) NOT NULL, \`company_id\` char(36) NULL, \`actor_id\` char(36) NULL, \`action\` varchar(100) NOT NULL, \`entity_type\` varchar(100) NOT NULL, \`entity_id\` char(36) NULL, \`metadata\` json NULL, \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX \`IDX_f8377051a51b17b8ef7d0db51a\` (\`company_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`student_profile\` ADD CONSTRAINT \`FK_1f5209fc71a9181affa7647b8b5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_9e70b5f9d7095018e86970c7874\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_6bbe63d2fe75e7f0ba1710351d4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_skill\` ADD CONSTRAINT \`FK_e4ba866607554d86dc9c2a6c0e3\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_skill\` ADD CONSTRAINT \`FK_215460dc28b2f3cb6507c315eb3\` FOREIGN KEY (\`skill_id\`) REFERENCES \`skill\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD CONSTRAINT \`FK_51cb12c924d3e8c7465cc8edff2\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_skill\` ADD CONSTRAINT \`FK_57d07c4be198a93a91fa8479819\` FOREIGN KEY (\`job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_skill\` ADD CONSTRAINT \`FK_380feeef9ae48bb593b5acd9232\` FOREIGN KEY (\`skill_id\`) REFERENCES \`skill\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_progression\` ADD CONSTRAINT \`FK_0e6535d86aa7f020c6f6d09a8f2\` FOREIGN KEY (\`from_job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_progression\` ADD CONSTRAINT \`FK_05850bdeb12792a5a3aeeb62f74\` FOREIGN KEY (\`to_job_id\`) REFERENCES \`job\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_088c9b15c9465faaa40472b71cf\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_613433ab55ed223a10ce65a29d6\` FOREIGN KEY (\`used_by_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`course\` ADD CONSTRAINT \`FK_c30695ab5ff2a672b5276270b00\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`course_skill\` ADD CONSTRAINT \`FK_fc716ec22d754eadaf1b01d044c\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`course_skill\` ADD CONSTRAINT \`FK_22dc1cfd6fe00a3353f7a52c3bc\` FOREIGN KEY (\`skill_id\`) REFERENCES \`skill\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`course_skill\` DROP FOREIGN KEY \`FK_22dc1cfd6fe00a3353f7a52c3bc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`course_skill\` DROP FOREIGN KEY \`FK_fc716ec22d754eadaf1b01d044c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_c30695ab5ff2a672b5276270b00\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_613433ab55ed223a10ce65a29d6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_088c9b15c9465faaa40472b71cf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_progression\` DROP FOREIGN KEY \`FK_05850bdeb12792a5a3aeeb62f74\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_progression\` DROP FOREIGN KEY \`FK_0e6535d86aa7f020c6f6d09a8f2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_skill\` DROP FOREIGN KEY \`FK_380feeef9ae48bb593b5acd9232\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job_skill\` DROP FOREIGN KEY \`FK_57d07c4be198a93a91fa8479819\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_51cb12c924d3e8c7465cc8edff2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_skill\` DROP FOREIGN KEY \`FK_215460dc28b2f3cb6507c315eb3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_skill\` DROP FOREIGN KEY \`FK_e4ba866607554d86dc9c2a6c0e3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_6bbe63d2fe75e7f0ba1710351d4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_9e70b5f9d7095018e86970c7874\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`student_profile\` DROP FOREIGN KEY \`FK_1f5209fc71a9181affa7647b8b5\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_f8377051a51b17b8ef7d0db51a\` ON \`audit_log\``,
    );
    await queryRunner.query(`DROP TABLE \`audit_log\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_55694961638c5591c0941ac348\` ON \`career_path\``,
    );
    await queryRunner.query(`DROP TABLE \`career_path\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_cd7ecb22aebe82fc19cbcf0247\` ON \`course_skill\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_22dc1cfd6fe00a3353f7a52c3b\` ON \`course_skill\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fc716ec22d754eadaf1b01d044\` ON \`course_skill\``,
    );
    await queryRunner.query(`DROP TABLE \`course_skill\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_c30695ab5ff2a672b5276270b0\` ON \`course\``,
    );
    await queryRunner.query(`DROP TABLE \`course\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b827d3749ffbb3b5ab5099afd6\` ON \`invitation\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_088c9b15c9465faaa40472b71c\` ON \`invitation\``,
    );
    await queryRunner.query(`DROP TABLE \`invitation\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_05850bdeb12792a5a3aeeb62f7\` ON \`job_progression\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_0e6535d86aa7f020c6f6d09a8f\` ON \`job_progression\``,
    );
    await queryRunner.query(`DROP TABLE \`job_progression\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_119a6ffc60b3ce0973262b3a74\` ON \`job_skill\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_380feeef9ae48bb593b5acd923\` ON \`job_skill\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_57d07c4be198a93a91fa847981\` ON \`job_skill\``,
    );
    await queryRunner.query(`DROP TABLE \`job_skill\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_19a318ef2f7c34a6248ebfa9ff\` ON \`job\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bac37f13b06c08534012dc3607\` ON \`job\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_8621fd94dcf215eab39883476c\` ON \`job\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1df8104ffb698c8a9fae893c55\` ON \`job\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_51cb12c924d3e8c7465cc8edff\` ON \`job\``,
    );
    await queryRunner.query(`DROP TABLE \`job\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7e8881e9749125621ae444887a\` ON \`onboarding_response\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b1149ff65af3b03265159cb936\` ON \`onboarding_response\``,
    );
    await queryRunner.query(`DROP TABLE \`onboarding_response\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_91999f680543f1b5f6689af1a0\` ON \`user_skill\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_215460dc28b2f3cb6507c315eb\` ON \`user_skill\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e4ba866607554d86dc9c2a6c0e\` ON \`user_skill\``,
    );
    await queryRunner.query(`DROP TABLE \`user_skill\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0f49a593960360f6f85b692aca\` ON \`skill\``,
    );
    await queryRunner.query(`DROP TABLE \`skill\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f0812282fad2e352cdaf83ef0a\` ON \`refresh_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_6bbe63d2fe75e7f0ba1710351d\` ON \`refresh_token\``,
    );
    await queryRunner.query(`DROP TABLE \`refresh_token\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9e70b5f9d7095018e86970c787\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(
      `DROP INDEX \`REL_1f5209fc71a9181affa7647b8b\` ON \`student_profile\``,
    );
    await queryRunner.query(`DROP TABLE \`student_profile\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_47216baa0f0c8ebc6ee5a74989\` ON \`company\``,
    );
    await queryRunner.query(`DROP TABLE \`company\``);
  }
}
