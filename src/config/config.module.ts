import { Module, Global } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ConfigService } from './config.service';
import { envSchema } from './config.static';

dotenv.config();

const parsedEnv = envSchema.parse(process.env);

@Global()
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: parsedEnv,
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
