import { UserRole } from 'src/user/user.types';

export type AuthUser = {
  userId: string;
  companyId: string;
  role: UserRole;
};
