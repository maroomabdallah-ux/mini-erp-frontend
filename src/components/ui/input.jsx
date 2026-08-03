import { cn } from '@/lib/utils'

export function Input({ className, ...props }) {
  return <input className={cn('flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:opacity-50', className)} {...props} />
}
