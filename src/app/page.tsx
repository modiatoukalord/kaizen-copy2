
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, BarChart2, Calendar, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">
            Votre centre de contrôle financier.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DashboardActionItem href="/income" icon={ArrowUpRight} label="Revenus" />
            <DashboardActionItem href="/expenses" icon={ArrowDownLeft} label="Dépenses" />
            <DashboardActionItem href="/transfers" icon={ArrowRightLeft} label="Virements" />
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle>Synthèse & Rapports</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DashboardActionItem href="/charts" icon={BarChart2} label="Graphiques" />
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle>Planification & Budget</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <DashboardActionItem href="/planning" icon={Calendar} label="Planning" />
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <DashboardActionItem href="#" icon={Settings} label="Paramètres" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardActionItem({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  return (
    <Link href={href}>
      <Button variant="outline" className="h-28 w-full flex-col gap-2 bg-background/50 hover:bg-background">
        <Icon className="h-8 w-8 text-primary" />
        <span>{label}</span>
      </Button>
    </Link>
  );
}
