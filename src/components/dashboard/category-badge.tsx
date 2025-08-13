import {
  Car,
  UtensilsCrossed,
  Ticket,
  Lightbulb,
  Landmark,
  MoreHorizontal,
  type LucideIcon,
  Gift,
  HelpingHand,
  TrendingUp,
  CircleArrowLeft,
  HandCoins,
  BookUser,
  ScrollText,
  Wrench,
  Home,
  Shirt,
  Plane,
  FileText,
  Shield,
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
  Salaire: Landmark,
  Autre: MoreHorizontal,
  Don: Gift,
  'Aide sociale': HelpingHand,
  Investissement: TrendingUp,
  Remboursement: CircleArrowLeft,
  Prêt: HandCoins,
  Dette: BookUser,
  Créance: ScrollText,
  Travaux: Wrench,
  'Equipements maison': Home,
  'Vêtements et accessoires': Shirt,
  'Vacances et voyage': Plane,
  Factures: FileText,
  Assurances: Shield,
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
