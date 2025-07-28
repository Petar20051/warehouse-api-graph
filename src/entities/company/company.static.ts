import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createCompanySchema = z.object({
  name: z.string().min(2).max(64),
  email: z.string().email(),
});
export class CreateCompanyDto extends createZodDto(createCompanySchema) {}

export const updateCompanySchema = createCompanySchema.partial();
export class UpdateCompanyDto extends createZodDto(updateCompanySchema) {}
