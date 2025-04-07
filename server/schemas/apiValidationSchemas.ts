import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

// User-related schemas
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
});

export const userUpdateSchema = userSchema.partial().omit({ password: true });

// Content-related schemas
export const contentSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(10000),
  tags: z.array(z.string().min(2).max(30)).max(10),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const contentUpdateSchema = contentSchema.partial();

// Search-related schemas
export const searchSchema = z.object({
  query: z.string().min(2).max(100),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).merge(paginationSchema);

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['image', 'document', 'video']),
  maxSize: z.number().int().positive().default(5 * 1024 * 1024), // 5MB default
});

// API request schemas
export const createUserRequestSchema = z.object({
  body: userSchema,
});

export const updateUserRequestSchema = z.object({
  params: idParamSchema,
  body: userUpdateSchema,
});

export const createContentRequestSchema = z.object({
  body: contentSchema,
});

export const updateContentRequestSchema = z.object({
  params: idParamSchema,
  body: contentUpdateSchema,
});

export const searchRequestSchema = z.object({
  query: searchSchema,
});

export const fileUploadRequestSchema = z.object({
  body: fileUploadSchema,
}); 