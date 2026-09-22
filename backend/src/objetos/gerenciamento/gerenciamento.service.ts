import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjetosRepositoryService } from '../objetos-repository/objetos-repository.service.js';
import type { Objeto } from '../models/objeto/objeto.interface.js';

@Injectable()
export class GerenciamentoService {
  constructor(
    private readonly objetosRepository: ObjetosRepositoryService,
  ) {}

  atualizar(
    id: number,
    dados: Partial<Omit<Objeto, 'id'>>,
  ): Objeto {
    const objetoAtualizado = this.objetosRepository.atualizar(id, dados);

    if (!objetoAtualizado) {
      throw new NotFoundException('Objeto não encontrado');
    }

    return objetoAtualizado;
  }

  devolver(id: number): Objeto {
    const objetoAtualizado = this.objetosRepository.atualizar(id, {
      status: 'devolvido',
    });

    if (!objetoAtualizado) {
      throw new NotFoundException('Objeto não encontrado');
    }

    return objetoAtualizado;
  }
}