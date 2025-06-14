import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { zodToOpenAPISchema } from '../utils/zod-to-openapi';

describe('zodToOpenAPISchema', () => {
  it('should convert string schema', () => {
    const schema = z.string();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({ type: 'string' });
  });

  it('should convert string with constraints', () => {
    const schema = z.string().min(3).max(10).email();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'string',
      minLength: 3,
      maxLength: 10,
      format: 'email',
    });
  });

  it('should convert number schema', () => {
    const schema = z.number();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({ type: 'number' });
  });

  it('should convert number with constraints', () => {
    const schema = z.number().min(0).max(100).int();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'integer',
      minimum: 0,
      maximum: 100,
    });
  });

  it('should convert boolean schema', () => {
    const schema = z.boolean();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({ type: 'boolean' });
  });

  it('should convert date schema', () => {
    const schema = z.date();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'string',
      format: 'date-time',
    });
  });

  it('should convert array schema', () => {
    const schema = z.array(z.string());
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
  });

  it('should convert object schema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email().optional(),
    });
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        email: { type: 'string', format: 'email' },
      },
      required: ['name', 'age'],
    });
  });

  it('should convert enum schema', () => {
    const schema = z.enum(['red', 'green', 'blue']);
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'string',
      enum: ['red', 'green', 'blue'],
    });
  });

  it('should convert union schema', () => {
    const schema = z.union([z.string(), z.number()]);
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      oneOf: [{ type: 'string' }, { type: 'number' }],
    });
  });

  it('should convert optional schema', () => {
    const schema = z.string().optional();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({ type: 'string' });
  });

  it('should convert nullable schema', () => {
    const schema = z.string().nullable();
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'string',
      nullable: true,
    });
  });

  it('should convert default schema', () => {
    const schema = z.string().default('hello');
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'string',
      default: 'hello',
    });
  });

  it('should convert record schema', () => {
    const schema = z.record(z.string());
    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'object',
      additionalProperties: { type: 'string' },
    });
  });

  it('should convert complex nested schema', () => {
    const schema = z.object({
      user: z.object({
        id: z.string().uuid(),
        profile: z.object({
          firstName: z.string(),
          lastName: z.string(),
          age: z.number().int().min(0).max(120),
        }),
        roles: z.array(z.enum(['admin', 'user', 'guest'])),
      }),
      metadata: z.record(z.any()).optional(),
    });

    const result = zodToOpenAPISchema(schema);
    expect(result).toEqual({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            profile: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                age: { type: 'integer', minimum: 0, maximum: 120 },
              },
              required: ['firstName', 'lastName', 'age'],
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['admin', 'user', 'guest'],
              },
            },
          },
          required: ['id', 'profile', 'roles'],
        },
        metadata: {
          type: 'object',
          additionalProperties: {},
        },
      },
      required: ['user'],
    });
  });

  it('should convert ZodEffects schema by extracting underlying schema', () => {
    // Test .refine()
    const refinedSchema = z
      .string()
      .refine(
        (val) => val.length > 3,
        'String must be longer than 3 characters'
      );
    const refinedResult = zodToOpenAPISchema(refinedSchema);
    expect(refinedResult).toEqual({ type: 'string' });

    // Test .transform()
    const transformedSchema = z.string().transform((val) => val.toUpperCase());
    const transformedResult = zodToOpenAPISchema(transformedSchema);
    expect(transformedResult).toEqual({ type: 'string' });

    // Test .refine() with constraints
    const constrainedRefinedSchema = z
      .string()
      .min(5)
      .max(20)
      .email()
      .refine((val) => !val.includes('test'), 'Cannot contain test');
    const constrainedResult = zodToOpenAPISchema(constrainedRefinedSchema);
    expect(constrainedResult).toEqual({
      type: 'string',
      minLength: 5,
      maxLength: 20,
      format: 'email',
    });

    // Test nested ZodEffects with object
    const objectWithEffects = z.object({
      email: z
        .string()
        .email()
        .refine((val) => !val.includes('spam')),
      age: z
        .number()
        .int()
        .transform((val) => Math.max(0, val)),
    });
    const objectResult = zodToOpenAPISchema(objectWithEffects);
    expect(objectResult).toEqual({
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        age: { type: 'integer' },
      },
      required: ['email', 'age'],
    });
  });
});
