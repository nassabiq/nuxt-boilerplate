import { z } from 'zod'
import type { CreateUserPayload, UpdateUserPayload } from '~~/shared/types/user.types'
import { UserStatus } from '~~/shared/types/user.types'

export const createUserSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(255, 'Name too long'),
    email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(255, 'Email too long'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password cannot exceed 72 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
})

export const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(255, 'Email too long'),
    status_id: z.coerce
        .number()
        .pipe(z.nativeEnum(UserStatus, { errorMap: () => ({ message: 'Invalid status' }) })),
    version: z.coerce.number().int().min(1, 'Version is required')
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>

export function toCreateUserPayload(
    values: CreateUserFormValues | { name: string; email: string; password?: string }
): CreateUserPayload {
    return {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password || ''
    }
}

export function toUpdateUserPayload(
    values:
        | UpdateUserFormValues
        | {
              name: string
              email: string
              status_id?: UserStatus | number
              version?: number
          },
    fallbackVersion?: number
): UpdateUserPayload {
    const version = Number(values.version ?? fallbackVersion ?? 1)
    return {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        status_id: (Number(values.status_id) || UserStatus.ACTIVE) as UserStatus,
        version: version > 0 ? version : 1
    }
}
