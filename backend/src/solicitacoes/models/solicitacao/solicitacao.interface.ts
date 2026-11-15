export interface Solicitacao {
  id: string;
  usuarioId: string;
  objetoId: string;
  status: 'pendente' | 'aprovada' | 'recusada';
}