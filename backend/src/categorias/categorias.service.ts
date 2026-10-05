import { Injectable } from '@nestjs/common';
import { Categoria } from './models/categoria.interface.js';

@Injectable()
export class CategoriasService {
  private categorias: Categoria[] = [];
  private proximoId = 1;

  criar(dados: Omit<Categoria, 'id'>): Categoria {
    const novaCategoria: Categoria = {
      id: this.proximoId++,
      ...dados,
    };

    this.categorias.push(novaCategoria);

    return novaCategoria;
  }

  listar(): Categoria[] {
    return this.categorias;
  }

  buscarPorId(id: number): Categoria | undefined {
    return this.categorias.find((categoria) => categoria.id === id);
  }
}

