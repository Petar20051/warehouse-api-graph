import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { envSchema } from './config.static';

type EnvVars = z.infer<typeof envSchema>;

@Injectable()
export class ConfigService {
  constructor(@Inject('CONFIG') private readonly config: EnvVars) {}

  get<K extends keyof EnvVars>(key: K): EnvVars[K] {
    return this.config[key];
  }

  getAll(): EnvVars {
    return this.config;
  }
}
