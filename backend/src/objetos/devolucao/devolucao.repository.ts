import { Injectable } from '@nestjs/common';
import type { Devolucao } from './devolucao.interface.js';

@Injectable()
export class DevolucaoRepository {
  private devolucoes: Devolucao[] = [];

  private proximoId = 1;

  listar(): Devolucao[] {
    return this.devolucoes;
  }

  buscarPorId(id: number): Devolucao | undefined {
    return this.devolucoes.find(
      (devolucao) => devolucao.id === id,
    );
  }

  adicionar(devolucao: Omit<Devolucao, 'id'>): Devolucao {
    const novaDevolucao: Devolucao = {
      id: this.proximoId++,
      ...devolucao,
    };

    this.devolucoes.push(novaDevolucao);

    return novaDevolucao;
  }
}