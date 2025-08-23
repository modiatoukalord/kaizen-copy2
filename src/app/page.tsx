
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTransactions, getTransfers } from '@/lib/data';
import RecentActivityDialog from '@/components/dashboard/recent-activity-dialog';


export default async function Home() {
  const initialTransactions = await getTransactions();
  const initialTransfers = await getTransfers();

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
        <Card className="lg:col-span-2 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DashboardActionItem href="/income" imgSrc="/images/icons/revenue.png" label="Revenus" />
            <DashboardActionItem href="/expenses" imgSrc="/images/icons/depense.png" label="Dépenses" />
            <DashboardActionItem href="/transfers" imgSrc="/images/icons/virement.png" label="Virements" />
          </CardContent>
        </Card>

        <Card className="hidden md:block bg-green-50/50 dark:bg-green-900/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Synthèse & Rapports</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DashboardActionItem href="/charts" imgSrc="/images/icons/graph.png" label="Graphiques" />
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            <Card className="hidden md:block bg-purple-50/50 dark:bg-purple-900/20 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Planification & Budget</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <DashboardActionItem href="/planning" imgSrc="/images/icons/planning.png" label="Planning" />
                </CardContent>
            </Card>
            
            <Card className="bg-background/75 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <RecentActivityDialog
                        initialTransactions={initialTransactions}
                        initialTransfers={initialTransfers}
                    />
                </CardContent>
            </Card>
       </div>
    </div>
  );
}

function DashboardActionItem({ href, imgSrc, label }: { href: string, imgSrc: string, label: string }) {
  return (
    <Link href={href}>
      <Button variant="outline" className="h-28 w-full flex-col gap-2 bg-background/75 hover:bg-accent/20 backdrop-blur-sm">
        <Image src={imgSrc} alt={label} width={48} height={48} className="h-12 w-12" />
        <span>{label}</span>
      </Button>
    </Link>
  );
}
