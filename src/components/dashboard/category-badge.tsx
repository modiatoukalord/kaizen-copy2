import {
  Car,
  UtensilsCrossed,
  Ticket,
  Lightbulb,
  Home,
  Landmark,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

export const categoryIcons: Record<Category, LucideIcon> = {
  Food: UtensilsCrossed,
  Transportation: Car,
  Entertainment: Ticket,
  Utilities: Lightbulb,
  Rent: Home,
  Salary: Landmark,
  Other: MoreHorizontal,
};

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const Icon = categoryIcons[category] || MoreHorizontal;
  const isIncome = category === 'Salary';

  return (
    <Badge
      variant={isIncome ? 'default' : 'secondary'}
      className={cn('gap-1.5 whitespace-nowrap', className)}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className='text-xs'>{category}</span>
    </Badge>
  );
}
