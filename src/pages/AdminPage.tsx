import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSyncStatus, getImportHistory, triggerSync, checkOllamaHealth } from '../api/client';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Cpu, Database, Play } from 'lucide-react';
import { useState } from 'react';

export function AdminPage() {
  const queryClient = useQueryClient();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const { data: syncStatus, isLoading: syncLoading } = useQuery({
    queryKey: ['sync-status'],
    queryFn: getSyncStatus,
  });

  const { data: importHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['import-history'],
    queryFn: getImportHistory,
  });

  const { data: ollamaHealth } = useQuery({
    queryKey: ['ollama-health'],
    queryFn: checkOllamaHealth,
  });

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      setSyncMessage('Synchronization completed successfully');
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: () => {
      setSyncMessage('Synchronization failed. Please check the logs.');
    },
  });

  const handleSync = () => {
    setSyncMessage(null);
    syncMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
        <p className="mt-2 text-slate-600">
          Manage data synchronization and system configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-primary-600" />
            Data Synchronization
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Last Sync</span>
                {syncStatus?.lastSync && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    syncStatus.lastSync.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : syncStatus.lastSync.status === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {syncStatus.lastSync.status}
                  </span>
                )}
              </div>
              {syncStatus?.lastSync && (
                <div className="text-sm text-slate-600 space-y-1">
                  <p>Time: {new Date(syncStatus.lastSync.startTime).toLocaleString()}</p>
                  <p>Records Updated: {syncStatus.lastSync.recordsUpdated}</p>
                  <p>Records Created: {syncStatus.lastSync.recordsCreated}</p>
                  {syncStatus.lastSync.errorSummary && (
                    <p className="text-red-600 mt-2">Error: {syncStatus.lastSync.errorSummary}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Scheduled Interval</span>
              <span className="font-medium text-slate-900">{syncStatus?.scheduledInterval || 'Not configured'}</span>
            </div>

            {syncStatus?.nextScheduledRun && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Next Scheduled Run</span>
                <span className="font-medium text-slate-900">
                  {new Date(syncStatus.nextScheduledRun).toLocaleString()}
                </span>
              </div>
            )}

            <button
              onClick={handleSync}
              disabled={syncMutation.isPending || syncStatus?.isRunning}
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Manual Sync
                </>
              )}
            </button>

            {syncMessage && (
              <div className={`p-3 rounded-md ${
                syncMessage.includes('successfully')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                {syncMessage}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-primary-600" />
            AI Model (Ollama)
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status</span>
              <span className={`flex items-center ${ollamaHealth?.available ? 'text-green-600' : 'text-red-600'}`}>
                {ollamaHealth?.available ? (
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
              <span className="text-sm text-slate-600">Model</span>
              <span className="font-mono text-sm text-slate-900">
                {ollamaHealth?.model || 'Not configured'}
              </span>
            </div>

            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Configuration:</strong> Set environment variables to configure Ollama:
              </p>
              <ul className="mt-2 text-xs text-blue-700 space-y-1 font-mono">
                <li>OLLAMA_BASE_URL=http://localhost:11434</li>
                <li>OLLAMA_MODEL=qwen3:4b</li>
                <li>OLLAMA_ENABLED=true</li>
                <li>OLLAMA_TIMEOUT_SECONDS=30</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> AI analysis is optional. The system will fall back to deterministic
                matching if Ollama is unavailable.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary-600" />
          Import History
        </h2>

        {historyLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : importHistory && importHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Removed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {importHistory.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(job.startTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : job.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{job.recordsCreated}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{job.recordsUpdated}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{job.recordsRemoved}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {job.failures > 0 ? (
                        <span className="text-red-600">{job.failures}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No import history available
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Data Source</p>
            <p className="font-medium text-slate-900">UN Security Council Consolidated Sanctions List</p>
          </div>
          <div>
            <p className="text-slate-600">Processing Mode</p>
            <p className="font-medium text-slate-900">Local (CSV Import)</p>
          </div>
          <div>
            <p className="text-slate-600">Database</p>
            <p className="font-medium text-slate-900">PostgreSQL</p>
          </div>
          <div>
            <p className="text-slate-600">Backend</p>
            <p className="font-medium text-slate-900">Spring Boot 3.5.x</p>
          </div>
        </div>
      </div>
    </div>
  );
}
