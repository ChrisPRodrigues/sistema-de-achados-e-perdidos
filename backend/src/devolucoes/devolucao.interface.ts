export interface Devolucao {
  id: string;
  objetoId: string;
  usuarioId: string;
  dataDevolucao: Date;
  observacao?: string;
}