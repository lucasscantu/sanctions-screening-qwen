import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRecordById } from '../api/client';
import { ArrowLeft, ExternalLink, User, Building2, Calendar, MapPin, Flag, FileText, AlertTriangle } from 'lucide-react';

export function RecordDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading, error } = useQuery({
    queryKey: ['record', id],
    queryFn: () => getRecordById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-red-900">Record Not Found</h2>
        <p className="mt-2 text-red-700">The requested record could not be found.</p>
        <Link to="/search" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Link>
      </div>
    );
  }

  const bio = record.biographicalDetails[0];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/search" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Link>
        <div className="flex items-center gap-3">
          {record.recordType === 'INDIVIDUAL' ? (
            <User className="h-8 w-8 text-blue-600" />
          ) : (
            <Building2 className="h-8 w-8 text-purple-600" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{record.primaryName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                record.recordType === 'INDIVIDUAL' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {record.recordType}
              </span>
              <span className="text-sm text-slate-500">
                Reference: {record.referenceNumber}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                record.sourceStatus === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {record.sourceStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Aliases ({record.aliases.length})
          </h2>
          <div className="space-y-2">
            {record.aliases.map((alias) => (
              <div key={alias.id} className="p-3 bg-slate-50 rounded-md">
                <p className="font-medium text-slate-900">{alias.aliasName}</p>
                {alias.quality && (
                  <span className="text-xs text-slate-500">Quality: {alias.quality}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {bio && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Biographical Information
            </h2>
            <div className="space-y-3">
              {bio.dateOfBirth && (
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-slate-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Date of Birth</p>
                    <p className="text-sm text-slate-900">
                      {bio.dateOfBirth}
                      {bio.datePrecision && bio.datePrecision !== 'EXACT' && (
                        <span className="text-xs text-amber-600 ml-2">({bio.datePrecision})</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
              {bio.placeOfBirth && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Place of Birth</p>
                    <p className="text-sm text-slate-900">{bio.placeOfBirth}</p>
                  </div>
                </div>
              )}
              {bio.nationality && (
                <div className="flex items-start">
                  <Flag className="h-4 w-4 text-slate-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Nationality</p>
                    <p className="text-sm text-slate-900">{bio.nationality}</p>
                  </div>
                </div>
              )}
              {bio.gender && (
                <div>
                  <p className="text-sm font-medium text-slate-700">Gender</p>
                  <p className="text-sm text-slate-900">
                    {bio.gender === 'M' ? 'Male' : bio.gender === 'F' ? 'Female' : bio.gender}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {bio && bio.identificationDocuments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Identification Documents</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Issuing Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bio.identificationDocuments.map((doc, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm text-slate-900">{doc.type}</td>
                    <td className="px-4 py-2 text-sm text-slate-900 font-mono">{doc.number}</td>
                    <td className="px-4 py-2 text-sm text-slate-900">{doc.issuingCountry || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {record.sanctionsPrograms.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Sanctions Programs</h2>
          <div className="space-y-3">
            {record.sanctionsPrograms.map((program, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                <p className="font-medium text-slate-900">{program.program}</p>
                {program.referenceInfo && (
                  <p className="text-sm text-slate-600 mt-1">Reference: {program.referenceInfo}</p>
                )}
                {program.listingDetails && (
                  <p className="text-sm text-slate-600 mt-1">{program.listingDetails}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Source Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">First Imported</span>
            <span className="text-slate-900">{new Date(record.firstImported).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Last Synchronized</span>
            <span className="text-slate-900">{new Date(record.lastSynchronized).toLocaleString()}</span>
          </div>
          {record.listingDate && (
            <div className="flex justify-between">
              <span className="text-slate-600">Listing Date</span>
              <span className="text-slate-900">{record.listingDate}</span>
            </div>
          )}
          {record.lastUpdate && (
            <div className="flex justify-between">
              <span className="text-slate-600">Last Source Update</span>
              <span className="text-slate-900">{record.lastUpdate}</span>
            </div>
          )}
          <div className="pt-3 border-t border-slate-200">
            <a
              href={record.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-600 hover:text-primary-800"
            >
              View Official UN Source <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> This record is imported from the UN Security Council Consolidated Sanctions List.
          The presence of a name match does not constitute a determination of identity. Always conduct thorough
          human review before making compliance decisions.
        </p>
      </div>
    </div>
  );
}
