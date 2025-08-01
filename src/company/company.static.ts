import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2).max(64),
  email: z.string().email(),
});

export const updateCompanySchema = createCompanySchema.partial();
