
import { Injectable, NotFoundException } from '@nestjs/common';
import { DevolucaoRepository } from './devolucao.repository.js';
import type { Devolucao } from './devolucao.interface.js';
import { ObjetosRepositoryService } from '../objetos/objetos-repository/objetos-repository.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class DevolucaoService {
  constructor(
    private readonly devolucaoRepository: DevolucaoRepository,
    private readonly objetosRepository: ObjetosRepositoryService,
    private readonly usuariosService: UsuariosService,
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
    const objeto = this.objetosRepository.buscarPorId(dados.objetoId);

    if (!objeto) {
      throw new NotFoundException('Objeto não encontrado');
    }

    if (objeto.status === 'devolvido') {
      throw new NotFoundException('Este objeto já foi devolvido');
    }

    const usuario = this.usuariosService.buscarPorId(dados.usuarioId);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const objetoAtualizado = this.objetosRepository.atualizar(
      dados.objetoId,
      { status: 'devolvido' },
    );

    if (!objetoAtualizado) {
      throw new NotFoundException('Não foi possível atualizar o objeto');
    }

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
