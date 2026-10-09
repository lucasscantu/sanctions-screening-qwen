import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { searchRecords } from '../api/client';
import { SearchResult } from '../types';
import { Search as SearchIcon, AlertCircle, Info, ChevronLeft, ChevronRight, ExternalLink, Brain, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const searchSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['ALL', 'INDIVIDUAL', 'ENTITY']).optional(),
  minScore: z.number().min(0).max(100).optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'ALL' | 'INDIVIDUAL' | 'ENTITY'>('ALL');
  const [minScore, setMinScore] = useState(0);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: { name: '', type: 'ALL', minScore: 0 },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery, searchType, page, minScore],
    queryFn: () => searchRecords(
      searchQuery,
      searchType === 'ALL' ? undefined : searchType,
      10,
      page,
      minScore
    ),
    enabled: hasSearched && searchQuery.length >= 2,
  });

  const onSubmit = (formData: SearchForm) => {
    setSearchQuery(formData.name);
    setSearchType(formData.type || 'ALL');
    setMinScore(formData.minScore || 0);
    setPage(1);
    setHasSearched(true);
  };

  const totalPages = data ? Math.ceil(data.totalResults / data.pageSize) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sanctions Screening</h1>
        <p className="mt-2 text-slate-600">
          Search the UN Security Council Consolidated Sanctions List
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name to Screen
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter full name or partial name..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...register('name')}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                Search
              </button>
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
                Record Type
              </label>
              <select
                id="type"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                {...register('type')}
              >
                <option value="ALL">All Types</option>
                <option value="INDIVIDUAL">Individuals Only</option>
                <option value="ENTITY">Entities Only</option>
              </select>
            </div>

            <div>
              <label htmlFor="minScore" className="block text-sm font-medium text-slate-700 mb-1">
                Minimum Score: {minScore}%
              </label>
              <input
                id="minScore"
                type="range"
                min="0"
                max="100"
                step="5"
                className="w-full mt-2"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
              />
            </div>

            <div className="flex items-end">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg w-full">
                <p className="text-xs text-amber-800 flex items-start">
                  <Info className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                  <span>Score thresholds are experimental. Lower thresholds show more potential matches for review.</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            An error occurred while searching. Please try again.
          </p>
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Found <strong>{data.totalResults}</strong> potential match{data.totalResults !== 1 ? 'es' : ''} in{' '}
              <strong>{data.searchTimeMs}ms</strong>
            </p>
            {data.aiAvailable && (
              <span className="flex items-center text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <Brain className="h-4 w-4 mr-1" />
                AI Analysis Active ({data.aiModel})
              </span>
            )}
            {!data.aiAvailable && (
              <span className="flex items-center text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                <Brain className="h-4 w-4 mr-1" />
                AI Unavailable — Deterministic Only
              </span>
            )}
          </div>

          {data.results.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <SearchIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No matches found</h3>
              <p className="mt-2 text-slate-600">
                No records matched your search criteria. Try a different name or lower the minimum score.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.results.map((result, index) => (
                <ResultCard key={result.record.id} result={result} rank={index + 1} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <SearchIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Start Screening</h3>
          <p className="mt-2 text-slate-600">
            Enter a name above to search the sanctions database. The system will find potential matches
            using deterministic algorithms and optional AI analysis.
          </p>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, rank }: { result: SearchResult; rank: number }) {
  const scoreColor = result.scoreLabel === 'HIGH' 
    ? 'text-red-700 bg-red-50 border-red-200'
    : result.scoreLabel === 'MEDIUM'
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : result.scoreLabel === 'LOW'
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : 'text-slate-700 bg-slate-50 border-slate-200';

  const scoreBarColor = result.scoreLabel === 'HIGH'
    ? 'bg-red-500'
    : result.scoreLabel === 'MEDIUM'
    ? 'bg-amber-500'
    : result.scoreLabel === 'LOW'
    ? 'bg-blue-500'
    : 'bg-slate-400';

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-slate-500">#{rank}</span>
            <h3 className="text-lg font-semibold text-slate-900">
              {result.record.primaryName}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              result.record.recordType === 'INDIVIDUAL' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {result.record.recordType}
            </span>
          </div>

          {result.matchingAlias && (
            <p className="text-sm text-slate-600 mb-2">
              <span className="font-medium">Matching alias:</span> {result.matchingAlias}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
            <span>Ref: {result.record.referenceNumber}</span>
            {result.record.biographicalDetails[0]?.nationality && (
              <span>Nationality: {result.record.biographicalDetails[0].nationality}</span>
            )}
            {result.record.biographicalDetails[0]?.dateOfBirth && (
              <span>DOB: {result.record.biographicalDetails[0].dateOfBirth}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                Deterministic: <strong>{result.deterministicScore}%</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                Combined: <strong>{result.finalScore}%</strong>
              </span>
            </div>
            {result.experimental && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Experimental
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <div className={`px-3 py-2 rounded-lg border text-center ${scoreColor}`}>
            <div className="text-2xl font-bold">{result.finalScore}%</div>
            <div className="text-xs font-medium">{result.scoreLabel}</div>
          </div>
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${scoreBarColor}`}
              style={{ width: `${result.finalScore}%` }}
            />
          </div>
          <Link
            to={`/records/${result.record.id}`}
            className="mt-2 flex items-center text-sm text-primary-600 hover:text-primary-800"
          >
            View Details <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>

      {result.aiAnalysis && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-700 mb-1">AI Linguistic Analysis:</p>
              <p>{result.aiAnalysis.explanation}</p>
              {result.aiAnalysis.supportingFields.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-green-700">Supporting evidence:</span>
                  <ul className="mt-1 space-y-1">
                    {result.aiAnalysis.supportingFields.map((field, i) => (
                      <li key={i} className="text-green-600 text-xs">• {field}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.aiAnalysis.missingInformation.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-amber-700">Missing information:</span>
                  <ul className="mt-1 space-y-1">
                    {result.aiAnalysis.missingInformation.map((info, i) => (
                      <li key={i} className="text-amber-600 text-xs">• {info}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500 italic">
                {result.aiAnalysis.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
