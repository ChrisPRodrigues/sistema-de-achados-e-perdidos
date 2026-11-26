import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionarSenhaHashUsuarios1795707840000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios"
      ADD COLUMN "senha_hash" VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios"
      DROP COLUMN "senha_hash"
    `);
  }
}