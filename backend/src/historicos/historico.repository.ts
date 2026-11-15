import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Historico } from './historico.interface.js';

@Injectable()
export class HistoricoRepository {
  private historicos: Historico[] = [];

  listar(): Historico[] {
    return this.historicos;
  }

  buscarPorId(id: string): Historico | undefined {
    return this.historicos.find(
      (historico) => historico.id === id,
    );
  }

  adicionar(historico: Omit<Historico, 'id'>): Historico {
    const novoHistorico: Historico = {
      id: randomUUID(),
      ...historico,
    };

    this.historicos.push(novoHistorico);

    return novoHistorico;
  }

  atualizar(
    id: string,
    dados: Partial<Omit<Historico, 'id'>>,
  ): Historico | undefined {
    const historico = this.buscarPorId(id);

    if (!historico) {
      return undefined;
    }

    Object.assign(historico, dados);

    return historico;
  }

  remover(id: string): boolean {
    const indice = this.historicos.findIndex(
      (historico) => historico.id === id,
    );

    if (indice === -1) {
      return false;
    }

    this.historicos.splice(indice, 1);

    return true;
  }
}