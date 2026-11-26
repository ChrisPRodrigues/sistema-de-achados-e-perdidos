import { ForbiddenException } from '@nestjs/common';

import type { UsuarioAutenticado } from '../decorators/usuario-atual.decorator.js';

export function verificarPropriedade(
  usuario: UsuarioAutenticado,
  proprietarioId: string,
  permitirDocente = false,
): void {
  if (usuario.sub === proprietarioId) {
    return;
  }

  if (permitirDocente && usuario.tipo === 'docente') {
    return;
  }

  throw new ForbiddenException(
    'Você não tem permissão para acessar este recurso',
  );
}