import { cva, type VariantProps } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
                outline: 'text-foreground border-border',
                success:
                    'border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/30',
                warning:
                    'border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:border-amber-500/30'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
