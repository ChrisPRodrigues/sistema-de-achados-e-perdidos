import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Solicitacao } from './models/solicitacao/solicitacao.interface.js';

@Injectable()
export class SolicitacaoRepository {
  private solicitacoes: Solicitacao[] = [];

  listar(): Solicitacao[] {
    return this.solicitacoes;
  }

  buscarPorId(id: string): Solicitacao | undefined {
    return this.solicitacoes.find(
      (solicitacao) => solicitacao.id === id,
    );
  }

  adicionar(solicitacao: Omit<Solicitacao, 'id'>): Solicitacao {
    const novaSolicitacao: Solicitacao = {
      id: randomUUID(),
      ...solicitacao,
    };

    this.solicitacoes.push(novaSolicitacao);

    return novaSolicitacao;
  }

  atualizar(
    id: string,
    dados: Partial<Solicitacao>,
  ): Solicitacao | undefined {
    const solicitacao = this.buscarPorId(id);

    if (!solicitacao) {
      return undefined;
    }

    Object.assign(solicitacao, dados);

    return solicitacao;
  }

  remover(id: string): boolean {
    const indice = this.solicitacoes.findIndex(
      (solicitacao) => solicitacao.id === id,
    );

    if (indice === -1) {
      return false;
    }

    this.solicitacoes.splice(indice, 1);

    return true;
  }
}