export interface Objeto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  localEncontrado: string;
  dataEncontrado: Date;
  status: 'encontrado' | 'devolvido';
}
