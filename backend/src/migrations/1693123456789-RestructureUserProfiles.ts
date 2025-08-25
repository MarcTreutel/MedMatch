// backend/src/migrations/1693123456789-RestructureUserProfiles.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestructureUserProfiles1693123456789 implements MigrationInterface {
    name = 'RestructureUserProfiles1693123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create new user_profiles table
        await queryRunner.query(`
            CREATE TABLE "user_profiles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "phone" character varying,
                "university" character varying,
                "year_of_study" integer,
                "specialization" character varying,
                "cv_file_path" character varying,
                CONSTRAINT "PK_user_profiles" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user_profiles_user_id" UNIQUE ("user_id")
            )
        `);

        // 2. Rename clinic_profiles table to clinics and modify structure
        await queryRunner.query(`ALTER TABLE "clinic_profiles" RENAME TO "clinics"`);
        
        // Remove user_id column from clinics (we'll use the many-to-one relationship instead)
        await queryRunner.query(`ALTER TABLE "clinics" DROP COLUMN "user_id"`);
        
        // Rename clinic_name to name for consistency
        await queryRunner.query(`ALTER TABLE "clinics" RENAME COLUMN "clinic_name" TO "name"`);
        
        // Add timestamps to clinics
        await queryRunner.query(`ALTER TABLE "clinics" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);

        // 3. Add clinic_id column to users table
        await queryRunner.query(`ALTER TABLE "users" ADD "clinic_id" uuid`);

        // 4. Create a single clinic organization for all existing clinic users
        const clinicResult = await queryRunner.query(`
            INSERT INTO "clinics" ("name", "department", "address", "contact_person", "phone")
            VALUES ('Default Clinic Organization', 'General', NULL, NULL, NULL)
            RETURNING "id"
        `);
        const defaultClinicId = clinicResult[0].id;

        // 5. FIRST: Update existing users with 'clinic' role to 'clinic_admin' BEFORE changing enum
        await queryRunner.query(`
            UPDATE "users"
            SET "clinic_id" = $1
            WHERE "role" = 'clinic'
        `, [defaultClinicId]);

        // 6. THEN: Update UserRole enum to include new clinic roles
        await queryRunner.query(`ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('student', 'clinic_admin', 'clinic_member', 'admin')`);
        
        // Update the role column with proper mapping
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "role" TYPE "users_role_enum" 
            USING CASE 
                WHEN "role" = 'clinic' THEN 'clinic_admin'::users_role_enum
                ELSE "role"::text::"users_role_enum"
            END
        `);
        
        await queryRunner.query(`DROP TYPE "users_role_enum_old"`);

        // 7. Migrate existing student profile data to user profiles
        await queryRunner.query(`
            INSERT INTO "user_profiles" (
                "user_id",
                "phone",
                "university",
                "year_of_study",
                "specialization",
                "cv_file_path"
            )
            SELECT
                sp."user_id",
                sp."phone",
                sp."university",
                sp."year_of_study",
                sp."specialization",
                sp."cv_file_path"
            FROM "student_profiles" sp
        `);

        // 8. Update foreign key references in applications table
        await queryRunner.query(`
            ALTER TABLE "applications"
            DROP CONSTRAINT IF EXISTS "FK_applications_student_id"
        `);

        // Update applications to reference user_profiles instead of student_profiles
        await queryRunner.query(`
            UPDATE "applications" a
            SET "student_id" = up."id"
            FROM "user_profiles" up
            INNER JOIN "student_profiles" sp ON sp."user_id" = up."user_id"
            WHERE a."student_id" = sp."id"
        `);

        // 9. Update foreign key references in documents table
        await queryRunner.query(`
            ALTER TABLE "documents"
            DROP CONSTRAINT IF EXISTS "FK_documents_student_id"
        `);

        // Update documents to reference user_profiles instead of student_profiles
        await queryRunner.query(`
            UPDATE "documents" d
            SET "student_id" = up."id"
            FROM "user_profiles" up
            INNER JOIN "student_profiles" sp ON sp."user_id" = up."user_id"
            WHERE d."student_id" = sp."id"
        `);

        // 10. Update internship_positions to reference the new clinics table structure
        await queryRunner.query(`
            UPDATE "internship_positions"
            SET "clinic_id" = $1
            WHERE "clinic_id" IS NOT NULL
        `, [defaultClinicId]);

        // 11. Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "user_profiles"
            ADD CONSTRAINT "FK_user_profiles_user_id"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_clinic_id"
            FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_applications_student_id"
            FOREIGN KEY ("student_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "documents"
            ADD CONSTRAINT "FK_documents_student_id"
            FOREIGN KEY ("student_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "internship_positions"
            ADD CONSTRAINT "FK_internship_positions_clinic_id"
            FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE
        `);

        // 12. Drop remaining foreign key constraints and then the old student_profiles table
        await queryRunner.query(`
          ALTER TABLE "applications"
          DROP CONSTRAINT IF EXISTS "FK_791e5e9cf054d0295ebfe4491a9"
        `);

        await queryRunner.query(`
          ALTER TABLE "documents" 
          DROP CONSTRAINT IF EXISTS "FK_add06d9cca9b67e7392a060b6c7"
        `);

        // Now safely drop the old student_profiles table
        await queryRunner.query(`DROP TABLE "student_profiles"`);

        console.log('Migration completed successfully!');
        console.log(`Created default clinic with ID: ${defaultClinicId}`);
        console.log('All existing clinic users have been assigned clinic_admin role');
        console.log('All student profile data has been migrated to user_profiles');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse migration - recreate original structure
        // 1. Recreate student_profiles table
        await queryRunner.query(`
            CREATE TABLE "student_profiles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "university" character varying NOT NULL,
                "year_of_study" integer NOT NULL,
                "specialization" character varying,
                "cv_file_path" character varying,
                "phone" character varying,
                CONSTRAINT "PK_student_profiles" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_student_profiles_user_id" UNIQUE ("user_id")
            )
        `);

        // 2. Migrate data back from user_profiles to student_profiles (for students only)
        await queryRunner.query(`
            INSERT INTO "student_profiles" (
                "user_id",
                "university",
                "year_of_study",
                "specialization",
                "cv_file_path",
                "phone"
            )
            SELECT
                up."user_id",
                COALESCE(up."university", 'Unknown'),
                COALESCE(up."year_of_study", 1),
                up."specialization",
                up."cv_file_path",
                up."phone"
            FROM "user_profiles" up
            INNER JOIN "users" u ON u."id" = up."user_id"
            WHERE u."role" = 'student'
        `);

        // 3. Recreate clinic_profiles table structure
        await queryRunner.query(`ALTER TABLE "clinics" RENAME TO "clinic_profiles"`);
        await queryRunner.query(`ALTER TABLE "clinic_profiles" RENAME COLUMN "name" TO "clinic_name"`);
        await queryRunner.query(`ALTER TABLE "clinic_profiles" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "clinic_profiles" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "clinic_profiles" DROP COLUMN "updated_at"`);

        // 4. Restore original UserRole enum
        await queryRunner.query(`ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('student', 'clinic', 'admin')`);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "role" TYPE "users_role_enum"
            USING CASE
                WHEN "role" IN ('clinic_admin', 'clinic_member') THEN 'clinic'::users_role_enum
                ELSE "role"::text::users_role_enum
            END
        `);
        await queryRunner.query(`DROP TYPE "users_role_enum_old"`);

        // 5. Remove clinic_id from users
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clinic_id"`);

        // 6. Update foreign key references back to student_profiles
        await queryRunner.query(`
            UPDATE "applications" a
            SET "student_id" = sp."id"
            FROM "student_profiles" sp
            INNER JOIN "user_profiles" up ON up."user_id" = sp."user_id"
            WHERE a."student_id" = up."id"
        `);

        await queryRunner.query(`
            UPDATE "documents" d
            SET "student_id" = sp."id"
            FROM "student_profiles" sp
            INNER JOIN "user_profiles" up ON up."user_id" = sp."user_id"
            WHERE d."student_id" = up."id"
        `);

        // 7. Drop user_profiles table
        await queryRunner.query(`DROP TABLE "user_profiles"`);

        console.log('Migration rolled back successfully!');
    }
}
