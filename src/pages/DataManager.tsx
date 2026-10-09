import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, triggerSync, clearRecordsCache } from '../api/client';
import { loadSanctionsXML, validateXML } from '../lib/xml-parser';
import { FileText, Upload, RefreshCw, CheckCircle, AlertCircle, Database, Users, Building2 } from 'lucide-react';

export function DataManager() {
  const queryClient = useQueryClient();
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [xmlContent, setXmlContent] = useState<string>('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      setUploadMessage({ type: 'success', text: 'XML recarregado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
    onError: (error) => {
      setUploadMessage({ type: 'error', text: `Erro ao recarregar: ${error.message}` });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      setUploadMessage({ type: 'error', text: 'Por favor, selecione um arquivo XML' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      if (!validateXML(content)) {
        setUploadMessage({ type: 'error', text: 'XML inválido. Verifique o formato do arquivo.' });
        return;
      }

      setXmlContent(content);
      setUploadMessage({ type: 'success', text: 'Arquivo XML carregado. Clique em "Recarregar Dados" para aplicar.' });
    };
    reader.readAsText(file);
  };

  const handleReload = () => {
    clearRecordsCache();
    syncMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Dados</h1>
        <p className="mt-2 text-slate-600">
          Gerencie o arquivo XML de sanções local
        </p>
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
      </div>

      {/* Upload de Arquivo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2 text-primary-600" />
          Carregar Arquivo XML
        </h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-2">
              Arraste um arquivo XML aqui ou clique para selecionar
            </p>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="hidden"
              id="xml-upload"
            />
            <label
              htmlFor="xml-upload"
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors"
            >
              Selecionar Arquivo XML
            </label>
          </div>

          {xmlContent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-2">
                ✅ Arquivo carregado com sucesso!
              </p>
              <p className="text-xs text-green-700">
                Tamanho: {(xmlContent.length / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

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
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📁 Sobre o Arquivo XML
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            O sistema utiliza um arquivo XML local localizado em:
          </p>
          <code className="block bg-blue-100 px-3 py-2 rounded text-xs font-mono">
            /archives/sanctions-list.xml
          </code>
          <p className="mt-3">
            <strong>Formato esperado:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Elementos <code>&lt;individual&gt;</code> para pessoas</li>
            <li>Elementos <code>&lt;entity&gt;</code> para organizações</li>
            <li>Campos: primaryName, alias, dateOfBirth, nationality, etc.</li>
            <li>Atributos: id, dateListed, lastUpdate</li>
          </ul>
          <p className="mt-3">
            <strong>Nota:</strong> Todos os dados são processados localmente. Nenhum dado é enviado para servidores externos.
          </p>
        </div>
      </div>

      {/* Exemplo de XML */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          📋 Exemplo de Estrutura XML
        </h2>
        <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
{`<?xml version="1.0" encoding="UTF-8"?>
<sanctionsList>
  <individual id="REG-001" dateListed="2020-01-01">
    <primaryName>John Smith</primaryName>
    <alias quality="good">Johnny Smith</alias>
    <dateOfBirth precision="EXACT">1960-01-01</dateOfBirth>
    <nationality>British</nationality>
    <program name="Program A">Details</program>
  </individual>
  
  <entity id="REG-002" dateListed="2021-01-01">
    <primaryName>Company Ltd</primaryName>
    <alias>CL</alias>
    <program name="Program B">Details</program>
  </entity>
</sanctionsList>`}
        </pre>
      </div>
    </div>
  );
}
