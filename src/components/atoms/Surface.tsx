import * as React from 'react';

import { recipes, type SurfaceDensity, type SurfaceVariant } from '@/design-system';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  density?: SurfaceDensity;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = 'default', density = 'standard', ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(recipes.surface({ variant, density }), className)}
      {...props}
    />
  ),
);

Surface.displayName = 'Surface';
