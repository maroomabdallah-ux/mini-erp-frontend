import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[.98]',
  { variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/75',
      outline: 'border border-border bg-background hover:bg-muted',
      ghost: 'hover:bg-muted hover:text-foreground',
      destructive: 'bg-destructive text-white hover:bg-destructive/90',
    },
    size: { default: 'h-10 px-4', sm: 'h-9 rounded-lg px-3', lg: 'h-12 px-6', icon: 'size-10 p-0' },
  }, defaultVariants: { variant: 'default', size: 'default' } },
)

export function Button({ className, variant, size, asChild, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
export { buttonVariants }
