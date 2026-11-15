import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Objeto } from '../models/objeto/objeto.interface.js';

@Injectable()
export class ObjetosRepositoryService {
  private objetos: Objeto[] = [];

  listar(): Objeto[] {
    return this.objetos;
  }

  buscarPorId(id: string): Objeto | undefined {
    return this.objetos.find((objeto) => objeto.id === id);
  }

  adicionar(objeto: Omit<Objeto, 'id'>): Objeto {
    const novoObjeto: Objeto = {
      id: randomUUID(),
      ...objeto,
    };

    this.objetos.push(novoObjeto);

    return novoObjeto;
  }

  atualizar(id: string, dados: Partial<Objeto>): Objeto | undefined {
    const objeto = this.buscarPorId(id);

    if (!objeto) {
      return undefined;
    }

    Object.assign(objeto, dados);

    return objeto;
  }
}