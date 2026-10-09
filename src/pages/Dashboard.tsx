import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getSyncStatus } from '../api/client';
import { Shield, Users, Building2, Clock, AlertTriangle, Cpu, Database, CheckCircle, XCircle } from 'lucide-react';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: syncStatus } = useQuery({
    queryKey: ['sync-status'],
    queryFn: getSyncStatus,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Overview of the sanctions screening system status and data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Records"
          value={stats.totalRecords.toLocaleString()}
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Individuals"
          value={stats.totalIndividuals.toLocaleString()}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Entities"
          value={stats.totalEntities.toLocaleString()}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Data Freshness"
          value={stats.dataFreshness || 'Unknown'}
          icon={Clock}
          color="orange"
          subtitle={stats.lastSyncStatus === 'SUCCESS' ? 'Up to date' : 'Sync failed'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-primary-600" />
            AI Model Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Ollama Status</span>
              <span className={`flex items-center ${stats.ollamaAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ollamaAvailable ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Available
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Unavailable
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Model</span>
              <span className="font-mono text-sm text-slate-900">
                {stats.ollamaModel || 'Not configured'}
              </span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> AI analysis is experimental. Scores are based on textual similarity 
                and linguistic analysis, not identity determination.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary-600" />
            Synchronization
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Last Sync</span>
              <span className="text-sm text-slate-900">
                {stats.lastSyncTime 
                  ? new Date(stats.lastSyncTime).toLocaleString()
                  : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                stats.lastSyncStatus === 'SUCCESS' 
                  ? 'bg-green-100 text-green-800'
                  : stats.lastSyncStatus === 'FAILED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {stats.lastSyncStatus}
              </span>
            </div>
            {syncStatus && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Next Scheduled</span>
                <span className="text-sm text-slate-900">
                  {syncStatus.nextScheduledRun 
                    ? new Date(syncStatus.nextScheduledRun).toLocaleString()
                    : 'Not scheduled'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats.recentFailures.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-warning-600" />
            Recent Failures
          </h2>
          <div className="space-y-3">
            {stats.recentFailures.map((failure) => (
              <div key={failure.id} className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      {new Date(failure.startTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {failure.errorSummary || 'Unknown error'}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    FAILED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About This System</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            This is a local sanctions screening tool that processes data you have downloaded from the 
            UN Security Council Consolidated Sanctions List.
          </p>
          <p>
            <strong>Important:</strong> This system provides screening assistance and does not make 
            definitive legal or identity determinations. Name similarity scores are experimental and 
            should always be reviewed by qualified personnel before making compliance decisions.
          </p>
          <p>
            All processing happens locally on your machine. No data is sent to external services.
          </p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
