
import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(30, 'Requirements must be at least 30 characters'),
  location: z.string().min(2, 'Location is required'),
  salary_min: z.number().min(0, 'Minimum salary must be 0 or greater'),
  salary_max: z.number().min(0, 'Maximum salary must be 0 or greater'),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'remote', 'internship']),
  experience_level: z.enum(['entry', 'junior', 'mid', 'senior', 'lead']),
  closing_date: z.string().datetime().optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const jobSearchSchema = z.object({
  keyword: z.string().optional(),
  location: z.string().optional(),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'remote', 'internship']).optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  experience_level: z.enum(['entry', 'junior', 'mid', 'senior', 'lead']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobSearchInput = z.infer<typeof jobSearchSchema>;