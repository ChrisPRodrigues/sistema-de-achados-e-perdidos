import type { ObjetoEntity } from '../entities/objeto.entity.js';
import type { ObjetoRespostaDto } from './objeto-resposta.dto.js';

export function paraObjetoResposta(
  objeto: ObjetoEntity,
): ObjetoRespostaDto {
  return {
    id: objeto.id,
    nome: objeto.nome,
    descricao: objeto.descricao,
    categoriaId: objeto.categoria.id,
    localId: objeto.localEncontrado.id,
    usuarioId: objeto.usuario.id,
    categoria: {
      id: objeto.categoria.id,
      nome: objeto.categoria.nome,
      descricao: objeto.categoria.descricao,
    },
    local: {
      id: objeto.localEncontrado.id,
      nome: objeto.localEncontrado.nome,
      descricao: objeto.localEncontrado.descricao,
    },
    usuario: {
      id: objeto.usuario.id,
      nome: objeto.usuario.nome,
      email: objeto.usuario.email,
      tipo: objeto.usuario.tipo,
    },
    dataEncontrado: objeto.dataEncontrado,
    status: objeto.status,
  };
}