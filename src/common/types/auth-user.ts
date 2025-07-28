import { UserRole } from 'src/entities/user/user.static';

export type AuthUser = {
  userId: string;
  companyId: string;
  role: UserRole;
};
