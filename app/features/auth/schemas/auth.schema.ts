import { z } from 'zod'

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email wajib diisi')
        .email('Format email tidak valid')
        .max(255, 'Email terlalu panjang'),
    password: z.string().min(1, 'Password wajib diisi')
})

export type LoginFormValues = z.infer<typeof loginSchema>
