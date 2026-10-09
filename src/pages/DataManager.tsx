import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, triggerSync, clearRecordsCache } from '../api/client';
import { validateXML, detectXMLFormat } from '../lib/xml-parser';
import { FileText, Upload, RefreshCw, CheckCircle, AlertCircle, Database, Users, Building2, FolderOpen, AlertTriangle } from 'lucide-react';

export function DataManager() {
  const queryClient = useQueryClient();
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [manifestFiles, setManifestFiles] = useState<string[]>([]);
  const [manifestError, setManifestError] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  // Carregar manifesto ao iniciar
  useEffect(() => {
    fetch('/archives/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifestFiles(data.files || []);
        setManifestError(null);
      })
      .catch(err => {
        setManifestError('Não foi possível carregar o manifesto');
      });
  }, []);

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      setUploadMessage({ type: 'success', text: 'Arquivos XML recarregados com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
    onError: (error: Error) => {
      setUploadMessage({ type: 'error', text: `Erro ao recarregar: ${error.message}` });
    },
  });

  const handleReload = () => {
    clearRecordsCache();
    syncMutation.mutate();
  };

  const hasData = stats && stats.totalRecords > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Dados</h1>
        <p className="mt-2 text-slate-600">
          Gerencie os arquivos XML de sanções na pasta <code className="bg-slate-100 px-2 py-0.5 rounded">archives/</code>
        </p>
      </div>

      {/* Aviso se não há dados */}
      {!statsLoading && !hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Nenhum arquivo XML carregado
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                Para começar a usar o sistema, você precisa adicionar arquivos XML na pasta <code className="bg-amber-100 px-1 rounded">public/archives/</code> e listá-los no arquivo <code className="bg-amber-100 px-1 rounded">manifest.json</code>.
              </p>
              <div className="bg-white rounded p-3 text-xs font-mono">
                <p className="text-slate-600 mb-1"># Passo 1: Coloque seus arquivos XML em public/archives/</p>
                <p className="text-slate-600 mb-1"># Passo 2: Edite public/archives/manifest.json</p>
                <p className="text-slate-600 mb-1"># Passo 3: Clique em "Recarregar Dados" abaixo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas Atuais */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary-600" />
          Dados Carregados
        </h2>
        
        {statsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total de Registros</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalRecords}</p>
                </div>
                <Database className="h-10 w-10 text-blue-400" />
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Indivíduos</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalIndividuals}</p>
                </div>
                <Users className="h-10 w-10 text-green-400" />
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Entidades</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.totalEntities}</p>
                </div>
                <Building2 className="h-10 w-10 text-purple-400" />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Arquivos no Manifesto */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <FolderOpen className="h-5 w-5 mr-2 text-primary-600" />
          Arquivos XML Configurados
        </h2>
        
        {manifestError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{manifestError}</p>
          </div>
        ) : manifestFiles.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <p className="text-sm text-slate-600">
              Nenhum arquivo configurado no manifesto.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Edite <code className="bg-slate-200 px-1 rounded">public/archives/manifest.json</code> para adicionar arquivos.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {manifestFiles.map((file, index) => (
              <div key={index} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <FileText className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{file}</p>
                  <p className="text-xs text-slate-500">public/archives/{file}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleReload}
            disabled={syncMutation.isPending}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {syncMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Recarregando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Dados
              </>
            )}
          </button>
        </div>

        {uploadMessage && (
          <div className={`mt-4 p-4 rounded-lg ${
            uploadMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              {uploadMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                uploadMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadMessage.text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📖 Como Usar
        </h3>
        <div className="text-sm text-blue-800 space-y-3">
          <div>
            <p className="font-medium mb-1">1. Adicione seus arquivos XML</p>
            <p className="text-xs ml-4">
              Coloque seus arquivos XML na pasta <code className="bg-blue-100 px-1 rounded">public/archives/</code>
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">2. Configure o manifesto</p>
            <p className="text-xs ml-4">
              Edite <code className="bg-blue-100 px-1 rounded">public/archives/manifest.json</code> e liste os nomes dos arquivos:
            </p>
            <pre className="bg-blue-100 p-2 rounded text-xs mt-1 overflow-x-auto">
{`{
  "files": [
    "meu-arquivo-1.xml",
    "meu-arquivo-2.xml"
  ]
}`}
            </pre>
          </div>
          <div>
            <p className="font-medium mb-1">3. Recarregue os dados</p>
            <p className="text-xs ml-4">
              Clique no botão "Recarregar Dados" acima
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">4. Faça suas buscas</p>
            <p className="text-xs ml-4">
              Acesse a página "Search" para buscar nos dados carregados
            </p>
          </div>
        </div>
      </div>

      {/* Formatos Suportados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          📋 Formatos XML Suportados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-2">Formato Oficial ONU</h3>
            <p className="text-xs text-slate-600 mb-2">Tags em MAIÚSCULAS</p>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
{`<INDIVIDUAL>
  <FIRST_NAME>JOHN</FIRST_NAME>
  <SECOND_NAME>SMITH</SECOND_NAME>
  <REFERENCE_NUMBER>QDi.001</REFERENCE_NUMBER>
  <INDIVIDUAL_ALIAS>
    <ALIAS_NAME>Johnny</ALIAS_NAME>
  </INDIVIDUAL_ALIAS>
</INDIVIDUAL>`}
            </pre>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-2">Formato Simplificado</h3>
            <p className="text-xs text-slate-600 mb-2">Tags em minúsculas</p>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
{`<individual id="REG-001">
  <primaryName>John Smith</primaryName>
  <alias>Johnny</alias>
  <nationality>British</nationality>
</individual>`}
            </pre>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          O sistema detecta automaticamente o formato de cada arquivo. Você pode misturar formatos na mesma pasta.
        </p>
      </div>
    </div>
  );
}
