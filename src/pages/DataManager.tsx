import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDashboardStats, 
  triggerSync, 
  clearRecordsCache,
  parseXMLContent,
  addUploadedRecords,
  clearUploadedRecords
} from '../api/client';
import { validateXML, detectXMLFormat } from '../lib/xml-parser';
import { FileText, Upload, RefreshCw, CheckCircle, AlertCircle, Database, Users, Building2, FolderOpen, AlertTriangle, Trash2 } from 'lucide-react';

export function DataManager() {
  const queryClient = useQueryClient();
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      setUploadMessage({ type: 'success', text: 'Dados recarregados com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
    onError: (error: Error) => {
      setUploadMessage({ type: 'error', text: `Erro ao recarregar: ${error.message}` });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newUploadedFiles: string[] = [];
    let totalRecords = 0;
    let hasError = false;

    Array.from(files).forEach((file) => {
      if (!file.name.endsWith('.xml')) {
        setUploadMessage({ 
          type: 'error', 
          text: `Arquivo inválido: ${file.name}. Apenas arquivos XML são aceitos.` 
        });
        hasError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          if (!validateXML(content)) {
            setUploadMessage({ 
              type: 'error', 
              text: `XML inválido: ${file.name}. Verifique o formato do arquivo.` 
            });
            hasError = true;
            return;
          }

          const format = detectXMLFormat(content);
          const records = parseXMLContent(content);
          
          if (records.length === 0) {
            setUploadMessage({ 
              type: 'error', 
              text: `Nenhum registro encontrado em: ${file.name}` 
            });
            hasError = true;
            return;
          }

          addUploadedRecords(records);
          totalRecords += records.length;
          newUploadedFiles.push(file.name);
          setUploadedFiles(prev => [...prev, file.name]);

          if (!hasError) {
            setUploadMessage({ 
              type: 'success', 
              text: `Arquivo "${file.name}" carregado com sucesso! ${records.length} registros adicionados (formato: ${format === 'UN_OFFICIAL' ? 'Oficial ONU' : 'Simplificado'})` 
            });
          }

          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        } catch (err) {
          setUploadMessage({ 
            type: 'error', 
            text: `Erro ao processar ${file.name}: ${err instanceof Error ? err.message : 'Erro desconhecido'}` 
          });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleReload = () => {
    clearRecordsCache();
    syncMutation.mutate();
  };

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados carregados?')) {
      clearUploadedRecords();
      setUploadedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setUploadMessage({ type: 'success', text: 'Todos os dados foram limpos.' });
    }
  };

  const hasData = stats && stats.totalRecords > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Dados</h1>
        <p className="mt-2 text-slate-600">
          Carregue arquivos XML de sanções do seu computador
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
              <p className="text-sm text-amber-800">
                Use o campo abaixo para selecionar e carregar arquivos XML do seu computador.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload de Arquivo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2 text-primary-600" />
          Carregar Arquivo XML
        </h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              Selecione um ou mais arquivos XML do seu computador
            </p>
            <input
              type="file"
              accept=".xml"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="xml-upload"
            />
            <label
              htmlFor="xml-upload"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors font-medium"
            >
              Selecionar Arquivo(s) XML
            </label>
          </div>

          {uploadMessage && (
            <div className={`p-4 rounded-lg ${
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
      </div>

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

        {hasData && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleReload}
              disabled={syncMutation.isPending}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
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
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Tudo
            </button>
          </div>
        )}
      </div>

      {/* Arquivos Carregados na Sessão */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FolderOpen className="h-5 w-5 mr-2 text-primary-600" />
            Arquivos Carregados Nesta Sessão
          </h2>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <FileText className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{file}</p>
                  <p className="text-xs text-slate-500">Carregado via upload</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}

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
          O sistema detecta automaticamente o formato de cada arquivo. Você pode carregar múltiplos arquivos com formatos diferentes.
        </p>
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          ℹ️ Informações
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Processamento Local:</strong> Todos os arquivos são processados localmente no seu navegador. Nenhum dado é enviado para servidores externos.
          </p>
          <p>
            <strong>Sessão Atual:</strong> Os dados carregados via upload são mantidos apenas durante a sessão atual do navegador. Ao recarregar a página, os dados serão perdidos.
          </p>
          <p>
            <strong>Busca Unificada:</strong> Todos os registros carregados são combinados e podem ser pesquisados juntos na página "Search".
          </p>
        </div>
      </div>
    </div>
  );
}
