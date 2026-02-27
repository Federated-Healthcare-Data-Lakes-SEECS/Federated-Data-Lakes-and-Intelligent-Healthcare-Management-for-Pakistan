import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({})],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
