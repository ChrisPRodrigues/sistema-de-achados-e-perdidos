
import 'reflect-metadata';
import { performance } from 'node:perf_hooks';
import { In, Repository } from 'typeorm';

import dataSource from '../data-source.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import { CategoriaEntity } from '../categorias/entities/categoria.entity.js';
import { LocalEntity } from '../locais/entities/local.entity.js';

async function executar() {
  // Evita carregar migrações TypeScript durante a execução
  // do arquivo JavaScript compilado.
  dataSource.setOptions({
    migrations: [],
  });

  await dataSource.initialize();

  const runner = dataSource.createQueryRunner();
  let transacaoIniciada = false;

  try {
    await runner.connect();
    await runner.startTransaction();
    transacaoIniciada = true;

    let consultas = 0;

    // Conta as consultas SQL executadas pelo QueryRunner.
    const queryOriginal = runner.query.bind(runner);

    runner.query = (async (...args: any[]) => {
      consultas++;
      return (queryOriginal as any)(...args);
    }) as typeof runner.query;

    const objetosRepository: Repository<ObjetoEntity> =
      runner.manager.getRepository(ObjetoEntity);

    const usuariosRepository =
      runner.manager.getRepository(UsuarioEntity);

    const categoriasRepository =
      runner.manager.getRepository(CategoriaEntity);

    const locaisRepository =
      runner.manager.getRepository(LocalEntity);

    // Busca os registros existentes para os relacionamentos.
    const usuario = await usuariosRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    const categoria = await categoriasRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    const local = await locaisRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    if (!usuario || !categoria || !local) {
      throw new Error(
        'É necessário existir pelo menos um usuário, uma categoria e um local.',
      );
    }

    // Cria 50 objetos temporários.
    const objetosTemporarios = Array.from(
      { length: 50 },
      (_, indice) =>
        objetosRepository.create({
          nome: `E2 N+1 Teste ${indice + 1}`,
          descricao: 'Registro temporário para experimento N+1',
          categoria,
          localEncontrado: local,
          usuario,
          dataEncontrado: new Date(),
          status: 'encontrado' as const,
        }),
    );

    await objetosRepository.save(objetosTemporarios);

    const ids = objetosTemporarios.map(
      (objeto) => objeto.id,
    );

    // EXPERIMENTO 1: SEM OTIMIZAÇÃO (N+1)
    consultas = 0;
    const inicioN1 = performance.now();

    const objetos = await objetosRepository.find({
      where: {
        id: In(ids),
      },
      take: 50,
    });

    // Executa uma consulta de usuário para cada objeto.
    for (const objeto of objetos) {
      await usuariosRepository.findOneBy({
        id: usuario.id,
      });
    }

    const tempoN1 = performance.now() - inicioN1;
    const quantidadeN1 = consultas;

    // EXPERIMENTO 2: COM RELATIONS
    consultas = 0;
    const inicioOtimizado = performance.now();

    const objetosOtimizados = await objetosRepository.find({
      where: {
        id: In(ids),
      },
      relations: {
        usuario: true,
      },
      take: 50,
    });

    const tempoOtimizado =
      performance.now() - inicioOtimizado;

    const quantidadeOtimizada = consultas;

    console.log('\n========== EXPERIMENTO N+1 ==========');
    console.log(`Objetos analisados: ${objetos.length}`);

    console.table([
      {
        abordagem: 'Sem otimização (N+1)',
        consultasSQL: quantidadeN1,
        tempoMs: tempoN1.toFixed(2),
      },
      {
        abordagem: 'Com relations',
        consultasSQL: quantidadeOtimizada,
        tempoMs: tempoOtimizado.toFixed(2),
      },
    ]);

    console.log(
      `Objetos com relations: ${objetosOtimizados.length}`,
    );

    console.log(
      `Redução de consultas: ${
        quantidadeN1 - quantidadeOtimizada
      }`,
    );
  } finally {
    try {
      if (transacaoIniciada) {
        await runner.rollbackTransaction();

        console.log(
          '\nROLLBACK realizado: os 50 objetos temporários não foram mantidos.',
        );
      }
    } finally {
      await runner.release();
      await dataSource.destroy();
    }
  }
}

executar().catch((erro) => {
  console.error('Erro no experimento:', erro);
  process.exitCode = 1;
});
