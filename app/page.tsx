import { Topbar } from "@/components/layout/Topbar";
import { PageGrid } from "@/components/layout/PageGrid";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { getPipelineStats } from "@/lib/actions/companies";
import {
  getRecentInteractions,
  getInsightsDeliveredThisMonth,
} from "@/lib/actions/interactions";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, recentActivity, insightsThisMonth] = await Promise.all([
    getPipelineStats(),
    getRecentInteractions(8),
    getInsightsDeliveredThisMonth(),
  ]);

  return (
    <>
      <Topbar
        title="Dashboard"
        action={{ label: "+ Add Company", href: "/companies/new" }}
      />
      <PageGrid>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            label="Pipeline Value"
            value={formatCurrency(stats.pipelineValue)}
            gold
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            label="Active Prospects"
            value={stats.activeProspects}
            sub="excluding won/lost/dormant"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Total Companies" value={stats.totalCompanies} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            label="Insights Delivered"
            value={insightsThisMonth}
            sub="this month"
          />
        </div>

        <div className="col-span-12">
          <h2 className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.2em] mb-5">
            Recent Activity
          </h2>
          <div className="bg-bg-secondary/60 border border-c-border/60 rounded-2xl p-7">
            <ActivityFeed items={recentActivity} />
          </div>
        </div>
      </PageGrid>
    </>
  );
}
