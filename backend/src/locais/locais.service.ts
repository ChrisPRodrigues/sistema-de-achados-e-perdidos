import { Injectable, NotFoundException } from '@nestjs/common';
import type { Local } from './models/local.interface.js';

@Injectable()
export class LocaisService {
  private locais: Local[] = [];

  private proximoId = 1;

  listar(): Local[] {
    return this.locais;
  }

  buscarPorId(id: number): Local {
    const local = this.locais.find((local) => local.id === id);

    if (!local) {
      throw new NotFoundException('Local não encontrado');
    }

    return local;
  }

  adicionar(dados: Omit<Local, 'id'>): Local {
    const novoLocal: Local = {
      id: this.proximoId++,
      ...dados,
    };

    this.locais.push(novoLocal);

    return novoLocal;
  }

  atualizar(
    id: number,
    dados: Partial<Omit<Local, 'id'>>,
  ): Local {
    const local = this.buscarPorId(id);

    Object.assign(local, dados);

    return local;
  }

  remover(id: number): void {
    const indice = this.locais.findIndex(
      (local) => local.id === id,
    );

    if (indice === -1) {
      throw new NotFoundException('Local não encontrado');
    }

    this.locais.splice(indice, 1);
  }
}