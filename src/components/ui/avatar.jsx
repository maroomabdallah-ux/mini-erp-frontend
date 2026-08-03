import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

export function Avatar({ className, ...props }) { return <AvatarPrimitive.Root className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)} {...props} /> }
export function AvatarFallback({ className, ...props }) { return <AvatarPrimitive.Fallback className={cn('flex size-full items-center justify-center bg-secondary text-sm font-bold text-secondary-foreground', className)} {...props} /> }
