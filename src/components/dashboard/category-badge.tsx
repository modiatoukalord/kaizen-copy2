import {
  Car,
  UtensilsCrossed,
  Ticket,
  Lightbulb,
  Home,
  Landmark,
  MoreHorizontal,
  type LucideIcon,
  Gift,
  ArrowLeftRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { IncomeCategory } from '@/lib/types';

export const categoryIcons: Record<Category, LucideIcon> = {
  Nourriture: UtensilsCrossed,
  Transport: Car,
  Divertissement: Ticket,
  'Services publics': Lightbulb,
  Loyer: Home,
  Salaire: Landmark,
  Autre: MoreHorizontal,
  Don: Gift,
  Emprunt: ArrowLeftRight,
};

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const Icon = categoryIcons[category] || MoreHorizontal;
  const isIncome = (IncomeCategory as readonly string[]).includes(category);

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
