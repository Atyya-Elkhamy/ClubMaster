// import { MembershipType, UserMembership } from '../../membership/schema/membership.schema';
// import { User } from '../../users/users.schema';

// export interface PopulatedUserMembership extends Omit<UserMembership, 'user' | 'membershipType'> {
//   _id: any; 
//   user: User;
//   membershipType: MembershipType;
// }
import { HydratedDocument, Types } from 'mongoose';
import { UserMembership } from '../../membership/schema/membership.schema';
import { MembershipType } from '../../membership/schema/membership.schema';
import { User } from '../../users/users.schema';

// export interface PopulatedUserMembershipDocument extends Document<Types.ObjectId, any, UserMembership> {
//   _id: Types.ObjectId;
//   user: User;
//   membershipType: MembershipType;
//   save(): Promise<this>;
// }

export type PopulatedUserMembershipDocument = HydratedDocument<UserMembership> & {
  _id: Types.ObjectId;
  user: User; // populated field
  membershipType: MembershipType; // populated field
};
