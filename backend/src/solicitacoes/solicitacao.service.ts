import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { SolicitacaoEntity } from './entities/solicitacao.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';
import type { Solicitacao } from './models/solicitacao/solicitacao.interface.js';

type DadosSolicitacao = Omit<Solicitacao, 'id'>;

@Injectable()
export class SolicitacaoService {
  constructor(
    @InjectRepository(SolicitacaoEntity)
    private readonly solicitacoesRepository: Repository<SolicitacaoEntity>,

    @InjectRepository(UsuarioEntity)
    private readonly usuariosRepository: Repository<UsuarioEntity>,

    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,
  ) {}

  private paraSolicitacao(entidade: SolicitacaoEntity): Solicitacao {
    return {
      id: entidade.id,
      usuarioId: entidade.usuario.id,
      objetoId: entidade.objeto.id,
      status: entidade.status,
    };
  }

  private async buscarUsuario(id: string): Promise<UsuarioEntity> {
    const usuario = await this.usuariosRepository.findOneBy({ id });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  private async buscarObjeto(id: string): Promise<ObjetoEntity> {
    const objeto = await this.objetosRepository.findOneBy({ id });

    if (!objeto) {
      throw new NotFoundException('Objeto não encontrado');
    }

    return objeto;
  }

  private async verificarDuplicidade(
    usuarioId: string,
    objetoId: string,
    ignorarId?: string,
  ): Promise<void> {
    const existente = await this.solicitacoesRepository.findOne({
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

  private tratarErroDuplicidade(erro: unknown): never {
    if (
      erro instanceof QueryFailedError &&
      (erro.driverError as { code?: string }).code === '23505' &&
      (erro.driverError as { constraint?: string }).constraint ===
        'UQ_solicitacoes_usuario_objeto'
    ) {
      throw new ConflictException(
        'Este usuário já possui uma solicitação para este objeto',
      );
    }

    throw erro;
  }

  async listar(): Promise<Solicitacao[]> {
    const solicitacoes = await this.solicitacoesRepository.find({
      relations: {
        usuario: true,
        objeto: true,
      },
    });

    return solicitacoes.map((solicitacao) =>
      this.paraSolicitacao(solicitacao),
    );
  }

  async cadastrar(dados: DadosSolicitacao): Promise<Solicitacao> {
    const usuario = await this.buscarUsuario(dados.usuarioId);
    const objeto = await this.buscarObjeto(dados.objetoId);

    await this.verificarDuplicidade(dados.usuarioId, dados.objetoId);

    const solicitacao = this.solicitacoesRepository.create({
      usuario,
      objeto,
      status: dados.status,
    });

    try {
      const salva = await this.solicitacoesRepository.save(solicitacao);
      return this.paraSolicitacao(salva);
    } catch (erro) {
      this.tratarErroDuplicidade(erro);
    }
  }

  async buscarPorId(id: string): Promise<Solicitacao | undefined> {
    const solicitacao = await this.solicitacoesRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        objeto: true,
      },
    });

    return solicitacao
      ? this.paraSolicitacao(solicitacao)
      : undefined;
  }

  async atualizar(
    id: string,
    dados: Partial<DadosSolicitacao>,
  ): Promise<Solicitacao | undefined> {
    const solicitacao = await this.solicitacoesRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        objeto: true,
      },
    });

    if (!solicitacao) {
      return undefined;
    }

    const usuarioId = dados.usuarioId ?? solicitacao.usuario.id;
    const objetoId = dados.objetoId ?? solicitacao.objeto.id;

    if (dados.usuarioId !== undefined) {
      solicitacao.usuario = await this.buscarUsuario(dados.usuarioId);
    }

    if (dados.objetoId !== undefined) {
      solicitacao.objeto = await this.buscarObjeto(dados.objetoId);
    }

    await this.verificarDuplicidade(usuarioId, objetoId, id);

    if (dados.status !== undefined) {
      solicitacao.status = dados.status;
    }

    try {
      const atualizada = await this.solicitacoesRepository.save(solicitacao);
      return this.paraSolicitacao(atualizada);
    } catch (erro) {
      this.tratarErroDuplicidade(erro);
    }
  }

  async remover(id: string): Promise<boolean> {
    const resultado = await this.solicitacoesRepository.delete(id);

    return (resultado.affected ?? 0) > 0;
  }
}