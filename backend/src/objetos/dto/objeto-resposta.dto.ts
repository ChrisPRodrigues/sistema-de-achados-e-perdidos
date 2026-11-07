export class ObjetoRespostaDto {
  id: string;
  nome: string;
  descricao: string;
  categoriaId: string;
  localId: string;
  usuarioId: string;
  categoria: {
    id: string;
    nome: string;
    descricao: string | null;
  };
  local: {
    id: string;
    nome: string;
    descricao: string | null;
  };
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
  dataEncontrado: Date;
  status: 'encontrado' | 'devolvido';
}