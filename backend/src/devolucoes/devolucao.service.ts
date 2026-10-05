import { Injectable, NotFoundException } from '@nestjs/common';
import { DevolucaoRepository } from './devolucao.repository.js';
import type { Devolucao } from './devolucao.interface.js';

@Injectable()
export class DevolucaoService {
  constructor(
    private readonly devolucaoRepository: DevolucaoRepository,
  ) {}

  listar(): Devolucao[] {
    return this.devolucaoRepository.listar();
  }

  buscarPorId(id: number): Devolucao {
    const devolucao = this.devolucaoRepository.buscarPorId(id);

    if (!devolucao) {
      throw new NotFoundException('Devolução não encontrada');
    }

    return devolucao;
  }

  adicionar(
    dados: Omit<Devolucao, 'id' | 'dataDevolucao'>,
  ): Devolucao {
    return this.devolucaoRepository.adicionar({
      ...dados,
      dataDevolucao: new Date(),
    });
  }

  atualizar(
    id: number,
    dados: Partial<Omit<Devolucao, 'id'>>,
  ): Devolucao {
    const devolucaoAtualizada =
      this.devolucaoRepository.atualizar(id, dados);

    if (!devolucaoAtualizada) {
      throw new NotFoundException('Devolução não encontrada');
    }

    return devolucaoAtualizada;
  }

  remover(id: number): void {
    const removida = this.devolucaoRepository.remover(id);

    if (!removida) {
      throw new NotFoundException('Devolução não encontrada');
    }
  }
}