import { Injectable, NotFoundException } from '@nestjs/common';
import type { Historico } from './historico.interface.js';
import { HistoricoRepository } from './historico.repository.js';

@Injectable()
export class HistoricoService {
  constructor(
    private readonly historicoRepository: HistoricoRepository,
  ) {}

  listar(): Historico[] {
    return this.historicoRepository.listar();
  }

  buscarPorId(id: string): Historico {
    const historico = this.historicoRepository.buscarPorId(id);

    if (!historico) {
      throw new NotFoundException('Histórico não encontrado.');
    }

    return historico;
  }

  adicionar(dados: Omit<Historico, 'id'>): Historico {
    return this.historicoRepository.adicionar(dados);
  }

  atualizar(
    id: string,
    dados: Partial<Omit<Historico, 'id'>>,
  ): Historico {
    const historico = this.historicoRepository.atualizar(id, dados);

    if (!historico) {
      throw new NotFoundException('Histórico não encontrado.');
    }

    return historico;
  }

  remover(id: string): void {
    const removido = this.historicoRepository.remover(id);

    if (!removido) {
      throw new NotFoundException('Histórico não encontrado.');
    }
  }
}