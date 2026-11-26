import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type PapelUsuario = 'aluno' | 'docente';

export const Roles = (...roles: PapelUsuario[]) =>
  SetMetadata(ROLES_KEY, roles);