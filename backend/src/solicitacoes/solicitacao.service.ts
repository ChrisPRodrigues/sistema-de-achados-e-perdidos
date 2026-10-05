import { Injectable } from '@nestjs/common';
import type { Solicitacao } from './models/solicitacao/solicitacao.interface.js';
import { SolicitacaoRepository } from './solicitacao.repository.js';

@Injectable()
export class SolicitacaoService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepository,
  ) {}

  listar(): Solicitacao[] {
    return this.solicitacaoRepository.listar();
  }

  cadastrar(dados: Omit<Solicitacao, 'id'>): Solicitacao {
    return this.solicitacaoRepository.adicionar(dados);
  }

  buscarPorId(id: number): Solicitacao | undefined {
    return this.solicitacaoRepository.buscarPorId(id);
  }

  atualizar(
    id: number,
    dados: Partial<Solicitacao>,
  ): Solicitacao | undefined {
    return this.solicitacaoRepository.atualizar(id, dados);
  }

  remover(id: number): boolean {
    return this.solicitacaoRepository.remover(id);
  }
}