// membership.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipTypeController } from './membership.controller';
import { MembershipTypeService } from './membership.service';
import {
  MembershipType,
  MembershipTypeSchema,
} from './schema/membership.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipType.name, schema: MembershipTypeSchema },
    ]),
  ],
  controllers: [MembershipTypeController],
  providers: [MembershipTypeService],
  exports: [MongooseModule], // ✅ This makes MembershipTypeModel usable in other modules
})
export class MembershipModule {}
