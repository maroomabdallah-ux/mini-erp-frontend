import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
export const DropdownMenu = Dropdown.Root
export const DropdownMenuTrigger = Dropdown.Trigger
export function DropdownMenuContent({ className, ...props }) { return <Dropdown.Portal><Dropdown.Content dir="ltr" align="end" sideOffset={6} className={cn('z-50 min-w-44 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl', className)} {...props} /></Dropdown.Portal> }
export function DropdownMenuItem({ className, ...props }) { return <Dropdown.Item className={cn('flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted data-[disabled]:opacity-50', className)} {...props} /> }
export function DropdownMenuSeparator({ className, ...props }) { return <Dropdown.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} /> }
