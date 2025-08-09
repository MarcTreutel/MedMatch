import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNullStartDates1722162900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, add default values to existing rows with NULL start_date
        await queryRunner.query(`
            UPDATE "internship_positions" 
            SET "start_date" = CURRENT_DATE 
            WHERE "start_date" IS NULL
        `);
        
        // Then update the application_deadline field if needed
        await queryRunner.query(`
            UPDATE "internship_positions" 
            SET "application_deadline" = CURRENT_DATE + INTERVAL '30 days'
            WHERE "application_deadline" IS NULL
        `);
        
        // Add NOT NULL constraints after fixing the data
        await queryRunner.query(`
            ALTER TABLE "internship_positions" 
            ALTER COLUMN "start_date" SET NOT NULL
        `);
        
        await queryRunner.query(`
            ALTER TABLE "internship_positions" 
            ALTER COLUMN "application_deadline" SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove NOT NULL constraints
        await queryRunner.query(`
            ALTER TABLE "internship_positions" 
            ALTER COLUMN "start_date" DROP NOT NULL
        `);
        
        await queryRunner.query(`
            ALTER TABLE "internship_positions" 
            ALTER COLUMN "application_deadline" DROP NOT NULL
        `);
    }
}
