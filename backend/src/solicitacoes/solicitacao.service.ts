import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { SolicitacaoEntity } from './entities/solicitacao.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';

import type { Solicitacao } from './models/solicitacao/solicitacao.interface.js';
import type { UsuarioAutenticado } from '../auth/decorators/usuario-atual.decorator.js';

import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto.js';
import { AtualizarSolicitacaoDto } from './dto/atualizar-solicitacao.dto.js';

import { verificarPropriedade } from '../auth/utils/propriedade.js';

@Injectable()
export class SolicitacaoService {
  constructor(
    @InjectRepository(SolicitacaoEntity)
    private readonly solicitacoesRepository:
      Repository<SolicitacaoEntity>,

    @InjectRepository(UsuarioEntity)
    private readonly usuariosRepository:
      Repository<UsuarioEntity>,

    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository:
      Repository<ObjetoEntity>,
  ) {}

  private paraSolicitacao(
    entidade: SolicitacaoEntity,
  ): Solicitacao {
    return {
      id: entidade.id,
      usuarioId: entidade.usuario.id,
      objetoId: entidade.objeto.id,
      status: entidade.status,
    };
  }

  private async buscarUsuario(
    id: string,
  ): Promise<UsuarioEntity> {
    const usuario =
      await this.usuariosRepository.findOneBy({ id });

    if (!usuario) {
      throw new NotFoundException(
        'Usuário não encontrado',
      );
    }

    return usuario;
  }

  private async buscarObjeto(
    id: string,
  ): Promise<ObjetoEntity> {
    const objeto =
      await this.objetosRepository.findOneBy({ id });

    if (!objeto) {
      throw new NotFoundException(
        'Objeto não encontrado',
      );
    }

    return objeto;
  }

  private async buscarEntidadeAutorizada(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<SolicitacaoEntity> {
    const solicitacao =
      await this.solicitacoesRepository.findOne({
        where: { id },
        relations: {
          usuario: true,
          objeto: true,
        },
      });

    if (!solicitacao) {
      throw new NotFoundException(
        'Solicitação não encontrada',
      );
    }

    verificarPropriedade(
      usuario,
      solicitacao.usuario.id,
      true,
    );

    return solicitacao;
  }

  private async verificarDuplicidade(
    usuarioId: string,
    objetoId: string,
    ignorarId?: string,
  ): Promise<void> {
    const existente =
      await this.solicitacoesRepository.findOne({
        where: {
          usuario: { id: usuarioId },
          objeto: { id: objetoId },
        },
      });

    if (existente && existente.id !== ignorarId) {
      throw new ConflictException(
        'Este usuário já possui uma solicitação para este objeto',
      );
    }
  }

  private tratarErroDuplicidade(
    erro: unknown,
  ): never {
    if (
      erro instanceof QueryFailedError &&
      (erro.driverError as { code?: string }).code ===
        '23505' &&
      (erro.driverError as { constraint?: string })
        .constraint ===
        'UQ_solicitacoes_usuario_objeto'
    ) {
      throw new ConflictException(
        'Este usuário já possui uma solicitação para este objeto',
      );
    }

    throw erro;
  }

  async listar(
    usuario: UsuarioAutenticado,
  ): Promise<Solicitacao[]> {
    const solicitacoes =
      await this.solicitacoesRepository.find({
        where:
          usuario.tipo === 'docente'
            ? {}
            : {
                usuario: {
                  id: usuario.sub,
                },
              },
        relations: {
          usuario: true,
          objeto: true,
        },
      });

    return solicitacoes.map((solicitacao) =>
      this.paraSolicitacao(solicitacao),
    );
  }

  async cadastrar(
    dados: CriarSolicitacaoDto,
    usuarioAutenticado: UsuarioAutenticado,
  ): Promise<Solicitacao> {
    const usuario = await this.buscarUsuario(
      usuarioAutenticado.sub,
    );

    const objeto = await this.buscarObjeto(
      dados.objetoId,
    );

    await this.verificarDuplicidade(
      usuarioAutenticado.sub,
      dados.objetoId,
    );

    const solicitacao =
      this.solicitacoesRepository.create({
        usuario,
        objeto,
        status: 'pendente',
      });

    try {
      const salva =
        await this.solicitacoesRepository.save(
          solicitacao,
        );

      return this.paraSolicitacao(salva);
    } catch (erro) {
      this.tratarErroDuplicidade(erro);
    }
  }

  async buscarPorId(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<Solicitacao> {
    const solicitacao =
      await this.buscarEntidadeAutorizada(
        id,
        usuario,
      );

    return this.paraSolicitacao(solicitacao);
  }

  async atualizar(
    id: string,
    dados: AtualizarSolicitacaoDto,
    usuario: UsuarioAutenticado,
  ): Promise<Solicitacao> {
    const solicitacao =
      await this.buscarEntidadeAutorizada(
        id,
        usuario,
      );

    if (usuario.tipo === 'aluno') {
      if (solicitacao.status !== 'pendente') {
        throw new ForbiddenException(
          'Apenas solicitações pendentes podem ser alteradas pelo aluno',
        );
      }

      if (dados.status !== undefined) {
        throw new ForbiddenException(
          'Apenas docentes podem alterar o status da solicitação',
        );
      }
    }

    if (dados.objetoId !== undefined) {
      if (solicitacao.status !== 'pendente') {
        throw new ForbiddenException(
          'Não é permitido alterar o objeto de uma solicitação já analisada',
        );
      }

      const objeto = await this.buscarObjeto(
        dados.objetoId,
      );

      await this.verificarDuplicidade(
        solicitacao.usuario.id,
        objeto.id,
        id,
      );

      solicitacao.objeto = objeto;
    }

    if (dados.status !== undefined) {
      solicitacao.status = dados.status;
    }

    try {
      const atualizada =
        await this.solicitacoesRepository.save(
          solicitacao,
        );

      return this.paraSolicitacao(atualizada);
    } catch (erro) {
      this.tratarErroDuplicidade(erro);
    }
  }

  async remover(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<void> {
    const solicitacao =
      await this.buscarEntidadeAutorizada(
        id,
        usuario,
      );

    if (
      usuario.tipo === 'aluno' &&
      solicitacao.status !== 'pendente'
    ) {
      throw new ForbiddenException(
        'Apenas solicitações pendentes podem ser excluídas pelo aluno',
      );
    }

    const resultado =
      await this.solicitacoesRepository.delete(id);

    if (!resultado.affected) {
      throw new NotFoundException(
        'Solicitação não encontrada',
      );
    }
  }
}