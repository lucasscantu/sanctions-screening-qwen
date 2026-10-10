import { useState, useEffect } from 'react';
import { ollamaClient } from '../lib/ollama-client';

export function ModelSelector() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    setLoading(true);
    const isAvailable = await ollamaClient.checkAvailability();
    setAvailable(isAvailable);
    
    if (isAvailable) {
      const modelList = await ollamaClient.getAvailableModels();
      setModels(modelList.map(m => m.name));
      setSelectedModel(ollamaClient.getModel());
    }
    setLoading(false);
  }

  function handleModelChange(model: string) {
    ollamaClient.setModel(model);
    setSelectedModel(model);
  }

  if (loading) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg">
        <p className="text-sm text-slate-600">Verificando disponibilidade...</p>
      </div>
    );
  }

  if (!available) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm font-medium text-red-800 mb-2">
          Serviço de IA não disponível
        </p>
        <p className="text-xs text-red-700">
          Certifique-se de que o serviço está rodando localmente.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Modelo de IA Local
      </label>
      <select
        value={selectedModel}
        onChange={(e) => handleModelChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        {models.map(model => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>
      <p className="text-xs text-slate-500 mt-2">
        {models.length} modelo(s) disponível(is)
      </p>
    </div>
  );
}
