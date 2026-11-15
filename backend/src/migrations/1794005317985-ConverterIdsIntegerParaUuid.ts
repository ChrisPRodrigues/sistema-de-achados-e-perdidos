
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConverterIdsIntegerParaUuid1794005317985
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Gerar novos UUIDs para as entidades.
    for (const tabela of [
      'usuarios',
      'categorias',
      'locais',
      'objetos',
      'devolucoes',
      'solicitacoes',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "${tabela}" ADD COLUMN "id_uuid" uuid`,
      );
      await queryRunner.query(
        `UPDATE "${tabela}" SET "id_uuid" = gen_random_uuid()`,
      );
      await queryRunner.query(
        `ALTER TABLE "${tabela}" ALTER COLUMN "id_uuid" SET NOT NULL`,
      );
    }

    // Criar as novas chaves estrangeiras UUID.
    await queryRunner.query(`
      ALTER TABLE objetos
        ADD COLUMN categoria_id_uuid uuid,
        ADD COLUMN local_id_uuid uuid,
        ADD COLUMN usuario_id_uuid uuid;

      ALTER TABLE devolucoes
        ADD COLUMN objeto_id_uuid uuid,
        ADD COLUMN usuario_id_uuid uuid;

      ALTER TABLE solicitacoes
        ADD COLUMN usuario_id_uuid uuid,
        ADD COLUMN objeto_id_uuid uuid;
    `);

    // Preservar os relacionamentos existentes.
    await queryRunner.query(`
      UPDATE objetos o
      SET categoria_id_uuid = c.id_uuid
      FROM categorias c
      WHERE o.categoria_id = c.id;

      UPDATE objetos o
      SET local_id_uuid = l.id_uuid
      FROM locais l
      WHERE o.local_id = l.id;

      UPDATE objetos o
      SET usuario_id_uuid = u.id_uuid
      FROM usuarios u
      WHERE o.usuario_id = u.id;

      UPDATE devolucoes d
      SET objeto_id_uuid = o.id_uuid
      FROM objetos o
      WHERE d.objeto_id = o.id;

      UPDATE devolucoes d
      SET usuario_id_uuid = u.id_uuid
      FROM usuarios u
      WHERE d.usuario_id = u.id;

      UPDATE solicitacoes s
      SET objeto_id_uuid = o.id_uuid
      FROM objetos o
      WHERE s.objeto_id = o.id;

      UPDATE solicitacoes s
      SET usuario_id_uuid = u.id_uuid
      FROM usuarios u
      WHERE s.usuario_id = u.id;
    `);

    // Garantir que nenhum relacionamento ficou sem correspondência.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM objetos
          WHERE categoria_id_uuid IS NULL
             OR local_id_uuid IS NULL
             OR usuario_id_uuid IS NULL
        ) OR EXISTS (
          SELECT 1 FROM devolucoes
          WHERE objeto_id_uuid IS NULL OR usuario_id_uuid IS NULL
        ) OR EXISTS (
          SELECT 1 FROM solicitacoes
          WHERE objeto_id_uuid IS NULL OR usuario_id_uuid IS NULL
        ) THEN
          RAISE EXCEPTION 'Falha ao converter relacionamentos para UUID';
        END IF;
      END $$;
    `);

    // Remover restrições antigas com os nomes reais das migrações anteriores.
    await queryRunner.query(`
      ALTER TABLE objetos
        DROP CONSTRAINT "FK_1e1425c88011c24bdf5c17f4ebf",
        DROP CONSTRAINT "FK_44bf3f10332412700dcb7d98c76",
        DROP CONSTRAINT "FK_ea2eeedd230bea363eb01861857";

      ALTER TABLE devolucoes
        DROP CONSTRAINT "FK_9ff892c612f28f70e177f5a387b",
        DROP CONSTRAINT "FK_bab7768fc5ef5a189f3ea9a91a3",
        DROP CONSTRAINT "REL_9ff892c612f28f70e177f5a387";

      ALTER TABLE solicitacoes
        DROP CONSTRAINT "FK_solicitacoes_usuario",
        DROP CONSTRAINT "FK_solicitacoes_objeto",
        DROP CONSTRAINT "UQ_solicitacoes_usuario_objeto",
        DROP CONSTRAINT "CHK_solicitacoes_status";
    `);

    // Remover chaves primárias antigas com seus nomes reais.
    await queryRunner.query(`
      ALTER TABLE usuarios
        DROP CONSTRAINT "PK_d7281c63c176e152e4c531594a8";

      ALTER TABLE categorias
        DROP CONSTRAINT "PK_3886a26251605c571c6b4f861fe";

      ALTER TABLE locais
        DROP CONSTRAINT "PK_42eaed01557782613d36365d300";

      ALTER TABLE objetos
        DROP CONSTRAINT "PK_5f2898ccbd673819ed827b32a91";

      ALTER TABLE devolucoes
        DROP CONSTRAINT "PK_e89335b8032acafded142bbbff1";

      ALTER TABLE solicitacoes
        DROP CONSTRAINT "PK_solicitacoes";
    `);

    // Substituir os IDs e as chaves estrangeiras antigas.
    await queryRunner.query(`
      ALTER TABLE usuarios DROP COLUMN id;
      ALTER TABLE categorias DROP COLUMN id;
      ALTER TABLE locais DROP COLUMN id;
      ALTER TABLE objetos DROP COLUMN id;
      ALTER TABLE devolucoes DROP COLUMN id;
      ALTER TABLE solicitacoes DROP COLUMN id;

      ALTER TABLE usuarios RENAME COLUMN id_uuid TO id;
      ALTER TABLE categorias RENAME COLUMN id_uuid TO id;
      ALTER TABLE locais RENAME COLUMN id_uuid TO id;
      ALTER TABLE objetos RENAME COLUMN id_uuid TO id;
      ALTER TABLE devolucoes RENAME COLUMN id_uuid TO id;
      ALTER TABLE solicitacoes RENAME COLUMN id_uuid TO id;

      ALTER TABLE objetos DROP COLUMN categoria_id;
      ALTER TABLE objetos DROP COLUMN local_id;
      ALTER TABLE objetos DROP COLUMN usuario_id;

      ALTER TABLE objetos RENAME COLUMN categoria_id_uuid TO categoria_id;
      ALTER TABLE objetos RENAME COLUMN local_id_uuid TO local_id;
      ALTER TABLE objetos RENAME COLUMN usuario_id_uuid TO usuario_id;

      ALTER TABLE devolucoes DROP COLUMN objeto_id;
      ALTER TABLE devolucoes DROP COLUMN usuario_id;

      ALTER TABLE devolucoes RENAME COLUMN objeto_id_uuid TO objeto_id;
      ALTER TABLE devolucoes RENAME COLUMN usuario_id_uuid TO usuario_id;

      ALTER TABLE solicitacoes DROP COLUMN objeto_id;
      ALTER TABLE solicitacoes DROP COLUMN usuario_id;

      ALTER TABLE solicitacoes RENAME COLUMN objeto_id_uuid TO objeto_id;
      ALTER TABLE solicitacoes RENAME COLUMN usuario_id_uuid TO usuario_id;
    `);

    // Configurar geração automática de UUID.
    for (const tabela of [
      'usuarios',
      'categorias',
      'locais',
      'objetos',
      'devolucoes',
      'solicitacoes',
    ]) {
      await queryRunner.query(`
        ALTER TABLE "${tabela}"
        ALTER COLUMN id SET DEFAULT gen_random_uuid()
      `);
    }

    // Criar as novas chaves primárias.
    await queryRunner.query(`
      ALTER TABLE usuarios ADD CONSTRAINT PK_usuarios PRIMARY KEY (id);
      ALTER TABLE categorias ADD CONSTRAINT PK_categorias PRIMARY KEY (id);
      ALTER TABLE locais ADD CONSTRAINT PK_locais PRIMARY KEY (id);
      ALTER TABLE objetos ADD CONSTRAINT PK_objetos PRIMARY KEY (id);
      ALTER TABLE devolucoes ADD CONSTRAINT PK_devolucoes PRIMARY KEY (id);
      ALTER TABLE solicitacoes ADD CONSTRAINT PK_solicitacoes PRIMARY KEY (id);
    `);

    // Ajustar tipos enum e datas conforme as entidades.
    await queryRunner.query(`
      CREATE TYPE usuarios_tipo_enum AS ENUM ('aluno', 'docente');
      CREATE TYPE objetos_status_enum AS ENUM ('encontrado', 'devolvido');
      CREATE TYPE solicitacoes_status_enum AS ENUM ('pendente', 'aprovada', 'recusada');

      ALTER TABLE usuarios
        ALTER COLUMN tipo TYPE usuarios_tipo_enum USING tipo::usuarios_tipo_enum;

      ALTER TABLE objetos
        ALTER COLUMN status DROP DEFAULT;

      ALTER TABLE objetos
        ALTER COLUMN status TYPE objetos_status_enum USING status::objetos_status_enum;

      ALTER TABLE objetos
        ALTER COLUMN status SET DEFAULT 'encontrado';

      ALTER TABLE solicitacoes
        ALTER COLUMN status DROP DEFAULT;

      ALTER TABLE solicitacoes
        ALTER COLUMN status TYPE solicitacoes_status_enum USING status::solicitacoes_status_enum;

      ALTER TABLE solicitacoes
        ALTER COLUMN status SET DEFAULT 'pendente';

      ALTER TABLE objetos
        ALTER COLUMN "dataEncontrado" TYPE timestamptz
        USING "dataEncontrado" AT TIME ZONE 'UTC';

      ALTER TABLE devolucoes
        ALTER COLUMN "dataDevolucao" DROP DEFAULT;

      ALTER TABLE devolucoes
        ALTER COLUMN "dataDevolucao" TYPE timestamptz
        USING "dataDevolucao" AT TIME ZONE 'UTC';

      ALTER TABLE devolucoes
        ALTER COLUMN "dataDevolucao" SET DEFAULT now();
    `);

    // Recriar relacionamentos com RESTRICT.
    await queryRunner.query(`
      ALTER TABLE objetos
        ADD CONSTRAINT FK_objetos_categoria
          FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_objetos_local
          FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_objetos_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT;

      ALTER TABLE devolucoes
        ADD CONSTRAINT FK_devolucoes_objeto
          FOREIGN KEY (objeto_id) REFERENCES objetos(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_devolucoes_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
        ADD CONSTRAINT UQ_devolucoes_objeto UNIQUE (objeto_id);

      ALTER TABLE solicitacoes
        ADD CONSTRAINT FK_solicitacoes_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_solicitacoes_objeto
          FOREIGN KEY (objeto_id) REFERENCES objetos(id) ON DELETE RESTRICT,
        ADD CONSTRAINT UQ_solicitacoes_usuario_objeto
          UNIQUE (usuario_id, objeto_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // A reversão também preserva os relacionamentos,
    // gerando novos IDs inteiros.
    for (const tabela of [
      'usuarios',
      'categorias',
      'locais',
      'objetos',
      'devolucoes',
      'solicitacoes',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "${tabela}" ADD COLUMN id_integer integer`,
      );
      await queryRunner.query(`
        WITH numeracao AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY id)::integer AS novo_id
          FROM "${tabela}"
        )
        UPDATE "${tabela}" t
        SET id_integer = n.novo_id
        FROM numeracao n
        WHERE t.id = n.id
      `);
    }

    await queryRunner.query(`
      ALTER TABLE objetos
        ADD COLUMN categoria_id_integer integer,
        ADD COLUMN local_id_integer integer,
        ADD COLUMN usuario_id_integer integer;

      ALTER TABLE devolucoes
        ADD COLUMN objeto_id_integer integer,
        ADD COLUMN usuario_id_integer integer;

      ALTER TABLE solicitacoes
        ADD COLUMN objeto_id_integer integer,
        ADD COLUMN usuario_id_integer integer;

      UPDATE objetos o SET categoria_id_integer = c.id_integer
      FROM categorias c WHERE o.categoria_id = c.id;

      UPDATE objetos o SET local_id_integer = l.id_integer
      FROM locais l WHERE o.local_id = l.id;

      UPDATE objetos o SET usuario_id_integer = u.id_integer
      FROM usuarios u WHERE o.usuario_id = u.id;

      UPDATE devolucoes d SET objeto_id_integer = o.id_integer
      FROM objetos o WHERE d.objeto_id = o.id;

      UPDATE devolucoes d SET usuario_id_integer = u.id_integer
      FROM usuarios u WHERE d.usuario_id = u.id;

      UPDATE solicitacoes s SET objeto_id_integer = o.id_integer
      FROM objetos o WHERE s.objeto_id = o.id;

      UPDATE solicitacoes s SET usuario_id_integer = u.id_integer
      FROM usuarios u WHERE s.usuario_id = u.id;
    `);

    await queryRunner.query(`
      ALTER TABLE objetos
        DROP CONSTRAINT FK_objetos_categoria,
        DROP CONSTRAINT FK_objetos_local,
        DROP CONSTRAINT FK_objetos_usuario;

      ALTER TABLE devolucoes
        DROP CONSTRAINT FK_devolucoes_objeto,
        DROP CONSTRAINT FK_devolucoes_usuario,
        DROP CONSTRAINT UQ_devolucoes_objeto;

      ALTER TABLE solicitacoes
        DROP CONSTRAINT FK_solicitacoes_usuario,
        DROP CONSTRAINT FK_solicitacoes_objeto,
        DROP CONSTRAINT UQ_solicitacoes_usuario_objeto;

      ALTER TABLE usuarios DROP CONSTRAINT PK_usuarios;
      ALTER TABLE categorias DROP CONSTRAINT PK_categorias;
      ALTER TABLE locais DROP CONSTRAINT PK_locais;
      ALTER TABLE objetos DROP CONSTRAINT PK_objetos;
      ALTER TABLE devolucoes DROP CONSTRAINT PK_devolucoes;
      ALTER TABLE solicitacoes DROP CONSTRAINT PK_solicitacoes;
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios DROP COLUMN id;
      ALTER TABLE categorias DROP COLUMN id;
      ALTER TABLE locais DROP COLUMN id;
      ALTER TABLE objetos DROP COLUMN id;
      ALTER TABLE devolucoes DROP COLUMN id;
      ALTER TABLE solicitacoes DROP COLUMN id;

      ALTER TABLE usuarios RENAME COLUMN id_integer TO id;
      ALTER TABLE categorias RENAME COLUMN id_integer TO id;
      ALTER TABLE locais RENAME COLUMN id_integer TO id;
      ALTER TABLE objetos RENAME COLUMN id_integer TO id;
      ALTER TABLE devolucoes RENAME COLUMN id_integer TO id;
      ALTER TABLE solicitacoes RENAME COLUMN id_integer TO id;

      ALTER TABLE objetos DROP COLUMN categoria_id;
      ALTER TABLE objetos DROP COLUMN local_id;
      ALTER TABLE objetos DROP COLUMN usuario_id;

      ALTER TABLE objetos RENAME COLUMN categoria_id_integer TO categoria_id;
      ALTER TABLE objetos RENAME COLUMN local_id_integer TO local_id;
      ALTER TABLE objetos RENAME COLUMN usuario_id_integer TO usuario_id;

      ALTER TABLE devolucoes DROP COLUMN objeto_id;
      ALTER TABLE devolucoes DROP COLUMN usuario_id;

      ALTER TABLE devolucoes RENAME COLUMN objeto_id_integer TO objeto_id;
      ALTER TABLE devolucoes RENAME COLUMN usuario_id_integer TO usuario_id;

      ALTER TABLE solicitacoes DROP COLUMN objeto_id;
      ALTER TABLE solicitacoes DROP COLUMN usuario_id;

      ALTER TABLE solicitacoes RENAME COLUMN objeto_id_integer TO objeto_id;
      ALTER TABLE solicitacoes RENAME COLUMN usuario_id_integer TO usuario_id;
    `);

    for (const tabela of [
      'usuarios',
      'categorias',
      'locais',
      'objetos',
      'devolucoes',
      'solicitacoes',
    ]) {
      await queryRunner.query(`
        CREATE SEQUENCE "${tabela}_id_seq";

        ALTER TABLE "${tabela}"
        ALTER COLUMN id SET DEFAULT nextval('"${tabela}_id_seq"');

        ALTER SEQUENCE "${tabela}_id_seq" OWNED BY "${tabela}".id;

        SELECT setval(
          '"${tabela}_id_seq"',
          COALESCE((SELECT MAX(id) FROM "${tabela}"), 0) + 1,
          false
        );
      `);
    }

    await queryRunner.query(`
      ALTER TABLE usuarios ADD CONSTRAINT PK_usuarios PRIMARY KEY (id);
      ALTER TABLE categorias ADD CONSTRAINT PK_categorias PRIMARY KEY (id);
      ALTER TABLE locais ADD CONSTRAINT PK_locais PRIMARY KEY (id);
      ALTER TABLE objetos ADD CONSTRAINT PK_objetos PRIMARY KEY (id);
      ALTER TABLE devolucoes ADD CONSTRAINT PK_devolucoes PRIMARY KEY (id);
      ALTER TABLE solicitacoes ADD CONSTRAINT PK_solicitacoes PRIMARY KEY (id);

      ALTER TABLE objetos
        ADD CONSTRAINT FK_objetos_categoria
          FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_objetos_local
          FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_objetos_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT;

      ALTER TABLE devolucoes
        ADD CONSTRAINT FK_devolucoes_objeto
          FOREIGN KEY (objeto_id) REFERENCES objetos(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_devolucoes_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
        ADD CONSTRAINT UQ_devolucoes_objeto UNIQUE (objeto_id);

      ALTER TABLE solicitacoes
        ADD CONSTRAINT FK_solicitacoes_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
        ADD CONSTRAINT FK_solicitacoes_objeto
          FOREIGN KEY (objeto_id) REFERENCES objetos(id) ON DELETE RESTRICT,
        ADD CONSTRAINT UQ_solicitacoes_usuario_objeto
          UNIQUE (usuario_id, objeto_id);
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios
        ALTER COLUMN tipo TYPE varchar(20) USING tipo::text;

      ALTER TABLE objetos
        ALTER COLUMN status DROP DEFAULT,
        ALTER COLUMN status TYPE varchar(20) USING status::text,
        ALTER COLUMN status SET DEFAULT 'encontrado';

      ALTER TABLE solicitacoes
        ALTER COLUMN status DROP DEFAULT,
        ALTER COLUMN status TYPE varchar(20) USING status::text,
        ALTER COLUMN status SET DEFAULT 'pendente';

      ALTER TABLE solicitacoes
        ADD CONSTRAINT CHK_solicitacoes_status
        CHECK (status IN ('pendente', 'aprovada', 'recusada'));

      ALTER TABLE objetos
        ALTER COLUMN "dataEncontrado" TYPE timestamp
        USING "dataEncontrado" AT TIME ZONE 'UTC';

      ALTER TABLE devolucoes
        ALTER COLUMN "dataDevolucao" DROP DEFAULT,
        ALTER COLUMN "dataDevolucao" TYPE timestamp
        USING "dataDevolucao" AT TIME ZONE 'UTC',
        ALTER COLUMN "dataDevolucao" SET DEFAULT now();

      DROP TYPE solicitacoes_status_enum;
      DROP TYPE objetos_status_enum;
      DROP TYPE usuarios_tipo_enum;
    `);
  }
}
