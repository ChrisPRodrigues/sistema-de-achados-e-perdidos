import { Module } from '@nestjs/common';

import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service.js';
import { CadastroController } from './cadastro/cadastro.controller.js';
import { CadastroService } from './cadastro/cadastro.service.js';

import { GerenciamentoController } from './gerenciamento/gerenciamento.controller.js';
import { GerenciamentoService } from './gerenciamento/gerenciamento.service.js';

@Module({
  providers: [
    ObjetosRepositoryService,
    CadastroService,
    GerenciamentoService,
  ],

  exports: [ObjetosRepositoryService],

  controllers: [
    CadastroController,
    GerenciamentoController,
  ],
})
export class ObjetosModule {}