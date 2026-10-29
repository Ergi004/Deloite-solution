import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/enums';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles. Used by RolesGuard. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
