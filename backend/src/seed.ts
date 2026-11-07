
import 'reflect-metadata';
import 'dotenv/config';

import dataSource from './data-source.js';
import { UsuarioEntity } from './usuarios/entities/usuario.entity.js';
import { CategoriaEntity } from './categorias/entities/categoria.entity.js';
import { LocalEntity } from './locais/entities/local.entity.js';
import { ObjetoEntity } from './objetos/entities/objeto.entity.js';
import { DevolucaoEntity } from './devolucoes/entities/devolucao.entity.js';
import { SolicitacaoEntity } from './solicitacoes/entities/solicitacao.entity.js';

async function seed(): Promise<void> {
  await dataSource.initialize();

  try {
    const usuarios = dataSource.getRepository(UsuarioEntity);
    const categorias = dataSource.getRepository(CategoriaEntity);
    const locais = dataSource.getRepository(LocalEntity);
    const objetos = dataSource.getRepository(ObjetoEntity);
    const devolucoes = dataSource.getRepository(DevolucaoEntity);
    const solicitacoes = dataSource.getRepository(SolicitacaoEntity);

    // Usuários
    const aluno = await usuarios.save(
      usuarios.create({
        id: '10000000-0000-4000-8000-000000000001',
        nome: 'Aluno Seed',
        email: 'aluno.seed@ifpe.edu.br',
        tipo: 'aluno',
      }),
    );

    const docente = await usuarios.save(
      usuarios.create({
        id: '10000000-0000-4000-8000-000000000002',
        nome: 'Docente Seed',
        email: 'docente.seed@ifpe.edu.br',
        tipo: 'docente',
      }),
    );

    // Categorias e locais já cadastrados pelas migrations
    const categoria = await categorias.findOneByOrFail({
      nome: 'Eletrônicos',
    });

    const local = await locais.findOneByOrFail({
      nome: 'Biblioteca',
    });

    // Objetos
    const objetoEncontrado = await objetos.save(
      objetos.create({
        id: '20000000-0000-4000-8000-000000000001',
        nome: 'Notebook Seed',
        descricao: 'Notebook utilizado nos testes do seed.',
        categoria,
        localEncontrado: local,
        usuario: docente,
        dataEncontrado: new Date('2026-11-05T10:00:00Z'),
        status: 'encontrado',
      }),
    );

    const objetoDevolvido = await objetos.save(
      objetos.create({
        id: '20000000-0000-4000-8000-000000000002',
        nome: 'Celular Seed',
        descricao: 'Celular utilizado nos testes de devolução.',
        categoria,
        localEncontrado: local,
        usuario: docente,
        dataEncontrado: new Date('2026-11-04T10:00:00Z'),
        status: 'devolvido',
      }),
    );

    // Solicitações: relacionamento N-N entre usuários e objetos
    const solicitacoesTeste = [
      {
        id: '30000000-0000-4000-8000-000000000001',
        usuario: aluno,
        objeto: objetoEncontrado,
        status: 'pendente' as const,
      },
      {
        id: '30000000-0000-4000-8000-000000000002',
        usuario: docente,
        objeto: objetoEncontrado,
        status: 'pendente' as const,
      },
    ];

    for (const dados of solicitacoesTeste) {
      const existente = await solicitacoes.findOne({
        where: {
          usuario: { id: dados.usuario.id },
          objeto: { id: dados.objeto.id },
        },
      });

      if (!existente) {
        await solicitacoes.save(solicitacoes.create(dados));
      }
    }

    // Devolução: relacionamento 1-1 com o objeto
    const devolucaoExistente = await devolucoes.findOne({
      where: {
        objeto: { id: objetoDevolvido.id },
      },
    });

    if (!devolucaoExistente) {
      await devolucoes.save(
        devolucoes.create({
          id: '40000000-0000-4000-8000-000000000001',
          objeto: objetoDevolvido,
          usuario: docente,
          observacao: 'Devolução registrada pelo seed de testes.',
        }),
      );
    }

    console.log('Seed executado com sucesso!');
    console.log('Usuários, objetos, solicitações e devolução cadastrados.');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((erro: unknown) => {
  console.error('Erro ao executar o seed:', erro);
  process.exitCode = 1;
});
