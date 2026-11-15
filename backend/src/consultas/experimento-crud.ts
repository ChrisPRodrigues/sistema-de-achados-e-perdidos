
import 'reflect-metadata';
import { QueryRunner } from 'typeorm';

import dataSource from '../data-source.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import { CategoriaEntity } from '../categorias/entities/categoria.entity.js';
import { LocalEntity } from '../locais/entities/local.entity.js';

async function executar() {
  // Desativa migrações e habilita a exibição dos SQLs.
  dataSource.setOptions({
    migrations: [],
    logging: ['query', 'error'],
  });

  let runner: QueryRunner | undefined;
  let transacaoIniciada = false;

  try {
    await dataSource.initialize();

    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    transacaoIniciada = true;

    const objetosRepository =
      runner.manager.getRepository(ObjetoEntity);

    const usuariosRepository =
      runner.manager.getRepository(UsuarioEntity);

    const categoriasRepository =
      runner.manager.getRepository(CategoriaEntity);

    const locaisRepository =
      runner.manager.getRepository(LocalEntity);

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

    console.log('\n========== EXPERIMENTO CRUD ==========');

    // CREATE
    console.log('\n1. CREATE — save()');

    const novoObjeto = objetosRepository.create({
      nome: 'E2 Teste CRUD',
      descricao: 'Objeto temporário para demonstrar CRUD',
      usuario,
      categoria,
      localEncontrado: local,
      dataEncontrado: new Date(),
      status: 'encontrado',
    });

    const objetoSalvo = await objetosRepository.save(novoObjeto);

    console.log('Objeto cadastrado:', {
      id: objetoSalvo.id,
      nome: objetoSalvo.nome,
    });

    // READ
    console.log('\n2. READ — findOne()');

    const objetoEncontrado = await objetosRepository.findOne({
      where: { id: objetoSalvo.id },
    });

    if (!objetoEncontrado) {
      throw new Error('Objeto não encontrado após o cadastro.');
    }

    console.log('Objeto encontrado:', {
      id: objetoEncontrado.id,
      nome: objetoEncontrado.nome,
    });

    // UPDATE
    console.log('\n3. UPDATE — save()');

    objetoEncontrado.nome = 'E2 Teste CRUD Atualizado';

    const objetoAtualizado =
      await objetosRepository.save(objetoEncontrado);

    console.log('Objeto atualizado:', {
      id: objetoAtualizado.id,
      nome: objetoAtualizado.nome,
    });

    // DELETE
    console.log('\n4. DELETE — delete()');

    const resultadoExclusao = await objetosRepository.delete(
      objetoAtualizado.id,
    );

    console.log(
      'Registros excluídos:',
      resultadoExclusao.affected,
    );

    // VERIFICAÇÃO FINAL
    const objetoDepoisExclusao = await objetosRepository.findOne({
      where: { id: objetoAtualizado.id },
    });

    if (objetoDepoisExclusao !== null) {
      throw new Error('O objeto ainda existe após a exclusão.');
    }

    console.log('\nCRUD executado com sucesso!');
  } finally {
    if (runner) {
      try {
        if (transacaoIniciada) {
          await runner.rollbackTransaction();

          console.log(
            '\nROLLBACK realizado: alterações temporárias desfeitas.',
          );
        }
      } finally {
        await runner.release();
      }
    }

    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

executar().catch((erro) => {
  console.error('\nErro no experimento CRUD:', erro);
  process.exitCode = 1;
});
