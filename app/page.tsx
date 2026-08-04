import { Topbar } from "@/components/layout/Topbar";
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
      <div className="p-10 space-y-10 max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Pipeline Value"
            value={formatCurrency(stats.pipelineValue)}
            gold
          />
          <StatCard
            label="Active Prospects"
            value={stats.activeProspects}
            sub="excluding won/lost/dormant"
          />
          <StatCard label="Total Companies" value={stats.totalCompanies} />
          <StatCard
            label="Insights Delivered"
            value={insightsThisMonth}
            sub="this month"
          />
        </div>

        <div>
          <h2 className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.2em] mb-5">
            Recent Activity
          </h2>
          <div className="bg-bg-secondary/60 border border-c-border/60 rounded-2xl p-7">
            <ActivityFeed items={recentActivity} />
          </div>
        </div>
      </div>
    </>
  );
}
