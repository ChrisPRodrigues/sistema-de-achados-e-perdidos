import { Module } from '@nestjs/common';

import { DevolucaoController } from './devolucao.controller.js';
import { DevolucaoService } from './devolucao.service.js';
import { DevolucaoRepository } from './devolucao.repository.js';

@Module({
  controllers: [DevolucaoController],

  providers: [
    DevolucaoService,
    DevolucaoRepository,
  ],

  exports: [
    DevolucaoRepository,
  ],
})
export class DevolucoesModule {}