import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserAuditResolver } from 'src/common/resolvers/audit-resolvers';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserResolver, UserAuditResolver],
  exports: [UserService],
})
export class UserModule {}
