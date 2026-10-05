import { Module } from '@nestjs/common';
import { SolicitacaoController } from './solicitacao.controller.js';
import { SolicitacaoService } from './solicitacao.service.js';
import { SolicitacaoRepository } from './solicitacao.repository.js';

@Module({
  controllers: [SolicitacaoController],
  providers: [SolicitacaoService, SolicitacaoRepository],
})
export class SolicitacoesModule {}