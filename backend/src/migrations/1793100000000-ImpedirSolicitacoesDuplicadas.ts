
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImpedirSolicitacoesDuplicadas1793100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "solicitacoes"
      ADD CONSTRAINT "UQ_solicitacoes_usuario_objeto"
      UNIQUE ("usuario_id", "objeto_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "solicitacoes"
      DROP CONSTRAINT "UQ_solicitacoes_usuario_objeto"
    `);
  }
}
