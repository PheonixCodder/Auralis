import { cn } from '@workspace/ui/lib/utils';
import { ReactNode } from 'react';
export const WidgetHeader = ( { children, className }: { children: ReactNode, className?: string } ) => {
    return (
        <header className={cn("bg-linear-to-b from-primary to-blue-600 p-4 text-primary-foreground", className)}>
            {children}
        </header>
    )
}