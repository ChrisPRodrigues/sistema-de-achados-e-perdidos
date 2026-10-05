import { Module } from '@nestjs/common';

import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service.js';
import { ObjetosController } from './objetos.controller.js';
import { CadastroController } from './cadastro/cadastro.controller.js';
import { CadastroService } from './cadastro/cadastro.service.js';

import { GerenciamentoController } from './gerenciamento/gerenciamento.controller.js';
import { GerenciamentoService } from './gerenciamento/gerenciamento.service.js';

import { DevolucaoRepository } from './devolucao/devolucao.repository.js';
import { DevolucaoService } from './devolucao/devolucao.service.js';
import { DevolucaoController } from './devolucao/devolucao.controller.js';

@Module({
  providers: [
    ObjetosRepositoryService,
    CadastroService,
    GerenciamentoService,
    DevolucaoRepository,
    DevolucaoService,
  ],

  exports: [
    ObjetosRepositoryService,
  ],

  controllers: [
    ObjetosController,
    CadastroController,
    GerenciamentoController,
    DevolucaoController,
  ],
})
export class ObjetosModule {}