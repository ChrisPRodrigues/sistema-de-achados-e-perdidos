
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjetoEntity } from '../entities/objeto.entity.js';
import { CategoriaEntity } from '../../categorias/entities/categoria.entity.js';
import { LocalEntity } from '../../locais/entities/local.entity.js';
import { DevolucaoEntity } from '../../devolucoes/entities/devolucao.entity.js';
import { DevolucaoService } from '../../devolucoes/devolucao.service.js';
import { ComprovanteService } from '../../comprovantes/comprovante.service.js';
import { HistoricoService } from '../../historicos/historico.service.js';

type DadosAtualizacaoObjeto = {
  nome?: string;
  descricao?: string;
  categoriaId?: number;
  localId?: number;
  dataEncontrado?: Date;
};

@Injectable()
export class GerenciamentoService {
  constructor(
    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,

    @InjectRepository(CategoriaEntity)
    private readonly categoriasRepository: Repository<CategoriaEntity>,

    @InjectRepository(LocalEntity)
    private readonly locaisRepository: Repository<LocalEntity>,

    @InjectRepository(DevolucaoEntity)
    private readonly devolucoesRepository: Repository<DevolucaoEntity>,

    private readonly devolucoesService: DevolucaoService,
    private readonly comprovanteService: ComprovanteService,
    private readonly historicoService: HistoricoService,
  ) {}

  async atualizar(
    id: number,
    dados: DadosAtualizacaoObjeto,
  ): Promise<ObjetoEntity> {
    const objeto = await this.buscarObjeto(id);

    if (dados.nome !== undefined) {
      objeto.nome = dados.nome;
    }

    if (dados.descricao !== undefined) {
      objeto.descricao = dados.descricao;
    }

    if (dados.dataEncontrado !== undefined) {
      objeto.dataEncontrado = dados.dataEncontrado;
    }

    if (dados.categoriaId !== undefined) {
      const categoria = await this.categoriasRepository.findOneBy({
        id: dados.categoriaId,
      });

      if (!categoria) {
        throw new NotFoundException('Categoria não encontrada');
      }

      objeto.categoria = categoria;
    }

    if (dados.localId !== undefined) {
      const local = await this.locaisRepository.findOneBy({
        id: dados.localId,
      });

      if (!local) {
        throw new NotFoundException('Local não encontrado');
      }

      objeto.localEncontrado = local;
    }

    await this.objetosRepository.save(objeto);

    return this.buscarObjeto(id);
  }


async devolver(
  id: number,
  usuarioId: number,
  observacao?: string,
): Promise<ObjetoEntity> {
  await this.devolucoesService.adicionar({
    objetoId: id,
    usuarioId,
    observacao,
  });

  return this.buscarObjeto(id);
}

  async remover(id: number): Promise<void> {
    await this.buscarObjeto(id);

    const devolucao = await this.devolucoesRepository.findOne({
      where: { objeto: { id } },
    });

    if (devolucao) {
      throw new ConflictException(
        'Não é possível excluir um objeto que possui a devolução registrada.',
      );
    }

    const possuiComprovante = this.comprovanteService
      .listar()
      .some((comprovante) => comprovante.objetoId === id);

    if (possuiComprovante) {
      throw new ConflictException(
        'Não é possível excluir um objeto que possui comprovantes associados.',
      );
    }

    const possuiHistorico = this.historicoService
      .listar()
      .some((historico) => historico.objetoId === id);

    if (possuiHistorico) {
      throw new ConflictException(
        'Não é possível excluir um objeto que possui históricos associados.',
      );
    }

    await this.objetosRepository.delete(id);
  }
  private async buscarObjeto(id: number): Promise<ObjetoEntity> {
    const objeto = await this.objetosRepository.findOne({
      where: { id },
      relations: {
        categoria: true,
        localEncontrado: true,
        usuario: true,
      },
    });

    if (!objeto) {
      throw new NotFoundException('Objeto não encontrado');
    }

    return objeto;
  }
}
