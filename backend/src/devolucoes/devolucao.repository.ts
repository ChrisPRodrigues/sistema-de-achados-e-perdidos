import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Devolucao } from './devolucao.interface.js';

@Injectable()
export class DevolucaoRepository {
  private devolucoes: Devolucao[] = [];

  listar(): Devolucao[] {
    return this.devolucoes;
  }

  buscarPorId(id: string): Devolucao | undefined {
    return this.devolucoes.find(
      (devolucao) => devolucao.id === id,
    );
  }

  adicionar(devolucao: Omit<Devolucao, 'id'>): Devolucao {
    const novaDevolucao: Devolucao = {
      id: randomUUID(),
      ...devolucao,
    };

    this.devolucoes.push(novaDevolucao);

    return novaDevolucao;
  }

  atualizar(
    id: string,
    dados: Partial<Omit<Devolucao, 'id'>>,
  ): Devolucao | undefined {
    const devolucao = this.buscarPorId(id);

    if (!devolucao) {
      return undefined;
    }

    Object.assign(devolucao, dados);

    return devolucao;
  }

  remover(id: string): boolean {
    const indice = this.devolucoes.findIndex(
      (devolucao) => devolucao.id === id,
    );

    if (indice === -1) {
      return false;
    }

    this.devolucoes.splice(indice, 1);

    return true;
  }
}