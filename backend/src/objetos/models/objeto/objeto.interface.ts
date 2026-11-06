export interface Objeto {
  id: string;
  nome: string;
  descricao: string;
  categoriaId: string;
  localEncontrado: string;
  dataEncontrado: Date;
  status: 'encontrado' | 'devolvido';
}