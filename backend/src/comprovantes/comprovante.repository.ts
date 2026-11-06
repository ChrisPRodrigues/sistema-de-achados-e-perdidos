import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Comprovante } from './comprovante.interface.js';

@Injectable()
export class ComprovanteRepository {
  private comprovantes: Comprovante[] = [];

  listar(): Comprovante[] {
    return this.comprovantes;
  }

  buscarPorId(id: string): Comprovante | undefined {
    return this.comprovantes.find(
      (comprovante) => comprovante.id === id,
    );
  }

  adicionar(comprovante: Omit<Comprovante, 'id'>): Comprovante {
    const novoComprovante: Comprovante = {
      id: randomUUID(),
      ...comprovante,
    };

    this.comprovantes.push(novoComprovante);

    return novoComprovante;
  }

  atualizar(
    id: string,
    dados: Partial<Omit<Comprovante, 'id'>>,
  ): Comprovante | undefined {
    const comprovante = this.buscarPorId(id);

    if (!comprovante) {
      return undefined;
    }

    Object.assign(comprovante, dados);

    return comprovante;
  }

  remover(id: string): boolean {
    const indice = this.comprovantes.findIndex(
      (comprovante) => comprovante.id === id,
    );

    if (indice === -1) {
      return false;
    }

    this.comprovantes.splice(indice, 1);

    return true;
  }
}