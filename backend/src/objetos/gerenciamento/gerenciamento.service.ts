import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjetosRepositoryService } from '../objetos-repository/objetos-repository.service.js';
import type { Objeto } from '../models/objeto/objeto.interface.js';
import { DevolucaoRepository } from '../../devolucoes/devolucao.repository.js';

@Injectable()
export class GerenciamentoService {
  constructor(
    private readonly objetosRepository: ObjetosRepositoryService,
    private readonly devolucaoRepository: DevolucaoRepository,
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

  devolver(
    id: number,
    usuarioId: number,
    observacao?: string,
  ): Objeto {
    const objeto = this.objetosRepository.buscarPorId(id);

    if (!objeto) {
      throw new NotFoundException('Objeto não encontrado');
    }

    this.devolucaoRepository.adicionar({
      objetoId: id,
      usuarioId,
      dataDevolucao: new Date(),
      observacao,
    });

    const objetoAtualizado = this.objetosRepository.atualizar(id, {
      status: 'devolvido',
    });

    return objetoAtualizado!;
  }
}