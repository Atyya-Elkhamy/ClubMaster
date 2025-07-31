import { UserRole } from '../../users/users.schema';

export interface JwtPayload {
  id: string;
  name: string;
   role?: UserRole;
}
