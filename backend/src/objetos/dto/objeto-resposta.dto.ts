export class ObjetoRespostaDto {
  id: string;
  nome: string;
  descricao: string;
  categoriaId: string;
  localId: string;
  usuarioId: string;
  dataEncontrado: Date;
  status: 'encontrado' | 'devolvido';
}