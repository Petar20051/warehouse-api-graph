import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/user.static';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
