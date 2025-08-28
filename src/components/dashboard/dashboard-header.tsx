
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, PlusCircle, ArrowRightLeft, Menu, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionSheet } from './add-transaction-sheet';
import { AddTransferSheet } from './add-transfer-sheet';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/contexts/currency-context';
import { useAuth } from '@/contexts/auth-context';
import InstallPWA from './install-pwa';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';


export default function DashboardHeader() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const { user, logout } = useAuth();
  
  const transactionType = (() => {
    if (pathname === '/income') return 'income';
    if (pathname === '/expenses') return 'expense';
    return undefined;
  })();
  
  const isTransfersPage = pathname === '/transfers';
  const isPlanningPage = pathname === '/planning';
  const isSettingsPage = pathname === '/settings';
  const isHomePage = pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Image src="/images/icons/logo.png" alt="Le KAIZEN" width={32} height={32} className="h-8 w-8" />
          <span className="font-headline">Le KAIZEN</span>
        </Link>
      </div>

        <div className="flex flex-1 items-center justify-end gap-2">
            <InstallPWA />
            <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Devise" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="XOF">FCFA</SelectItem>
                </SelectContent>
            </Select>

            <div className="hidden md:flex items-center gap-2">
                 {!isPlanningPage && !isHomePage && !isSettingsPage && (
                  isTransfersPage ? (
                      <AddTransferSheet>
                          <Button>
                              <ArrowRightLeft className="mr-2 h-4 w-4" />
                              Nouveau virement
                          </Button>
                      </AddTransferSheet>
                  ) : (
                      <AddTransactionSheet type={transactionType}>
                          <Button>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Ajouter une transaction
                          </Button>
                      </AddTransactionSheet>
                  )
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                         <Avatar>
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.username}`} />
                            <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/settings">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Paramètres</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Se déconnecter</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    </header>
  );
}
