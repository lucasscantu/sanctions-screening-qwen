# 📚 Guia de Formatos XML Suportados

O sistema de triagem de sanções agora suporta **múltiplos arquivos XML** e **dois formatos diferentes**.

---

## 🎯 Novas Funcionalidades

✅ **Suporte ao formato oficial da ONU** (tags em MAIÚSCULAS)  
✅ **Suporte ao formato simplificado** (tags em minúsculas)  
✅ **Carregamento de múltiplos arquivos XML**  
✅ **Detecção automática de formato**  
✅ **Combinação de todos os registros**  

---

## 📂 Estrutura de Arquivos

```
public/archives/
├── manifest.json                    ← Lista de arquivos a carregar
├── sanctions-list.xml               ← Formato simplificado
├── un-official-sample.xml           ← Formato oficial ONU
├── seu-arquivo-1.xml                ← Adicione quantos quiser
└── seu-arquivo-2.xml
```

---

## 📋 Formato 1: Oficial da ONU

Este é o formato usado pela lista consolidada do Conselho de Segurança da ONU.

### Características
- Tags em **MAIÚSCULAS**: `<INDIVIDUAL>`, `<ENTITY>`, `<FIRST_NAME>`, etc.
- Nomes separados em partes: `FIRST_NAME`, `SECOND_NAME`, `THIRD_NAME`, `FOURTH_NAME`
- Aliases em `<INDIVIDUAL_ALIAS>` com `<QUALITY>` e `<ALIAS_NAME>`
- Datas em `<INDIVIDUAL_DATE_OF_BIRTH>` com `<TYPE_OF_DATE>` e `<DATE>`

### Exemplo Completo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DATAEXPORT>
  <INDIVIDUALS>
    <INDIVIDUAL>
      <DATAID>6908399</DATAID>
      <VERSIONNUM>1</VERSIONNUM>
      <FIRST_NAME>ABD AL-RAHMAN</FIRST_NAME>
      <SECOND_NAME>KHALAF</SECOND_NAME>
      <THIRD_NAME>UBAYD JUDAY</THIRD_NAME>
      <FOURTH_NAME>AL-ANIZI</FOURTH_NAME>
      <UN_LIST_TYPE>Al-Qaida</UN_LIST_TYPE>
      <REFERENCE_NUMBER>QDi.335</REFERENCE_NUMBER>
      <LISTED_ON>2014-09-23</LISTED_ON>
      <COMMENTS1>Provides support to Al-Qaida in Syria and Iraq</COMMENTS1>
      <NATIONALITY>
        <VALUE>Kuwait</VALUE>
      </NATIONALITY>
      <LIST_TYPE>
        <VALUE>UN List</VALUE>
      </LIST_TYPE>
      <LAST_DAY_UPDATED>
        <VALUE>2023-02-02</VALUE>
      </LAST_DAY_UPDATED>
      <INDIVIDUAL_ALIAS>
        <QUALITY>Good</QUALITY>
        <ALIAS_NAME>Abd al-Rahman Khalaf al-Anizi</ALIAS_NAME>
      </INDIVIDUAL_ALIAS>
      <INDIVIDUAL_ALIAS>
        <QUALITY>Low</QUALITY>
        <ALIAS_NAME>Abu Usamah al-Rahman</ALIAS_NAME>
      </INDIVIDUAL_ALIAS>
      <INDIVIDUAL_ADDRESS>
        <COUNTRY>Syrian Arab Republic</COUNTRY>
        <NOTE>located in since 2013</NOTE>
      </INDIVIDUAL_ADDRESS>
      <INDIVIDUAL_DATE_OF_BIRTH>
        <TYPE_OF_DATE>EXACT</TYPE_OF_DATE>
        <DATE>1973-03-06</DATE>
      </INDIVIDUAL_DATE_OF_BIRTH>
      <INDIVIDUAL_PLACE_OF_BIRTH>
        <COUNTRY>Kuwait</COUNTRY>
      </INDIVIDUAL_PLACE_OF_BIRTH>
      <INDIVIDUAL_DOCUMENT>
        <TYPE_OF_DOCUMENT>National Identification Number</TYPE_OF_DOCUMENT>
        <NUMBER>273030601222</NUMBER>
        <ISSUING_COUNTRY>Kuwait</ISSUING_COUNTRY>
      </INDIVIDUAL_DOCUMENT>
    </INDIVIDUAL>
  </INDIVIDUALS>

  <ENTITIES>
    <ENTITY>
      <DATAID>1500001</DATAID>
      <FIRST_NAME>GLOBAL</FIRST_NAME>
      <SECOND_NAME>TRADE</SECOND_NAME>
      <THIRD_NAME>SOLUTIONS</THIRD_NAME>
      <FOURTH_NAME>LTD</FOURTH_NAME>
      <UN_LIST_TYPE>Al-Qaida</UN_LIST_TYPE>
      <REFERENCE_NUMBER>QDe.150</REFERENCE_NUMBER>
      <LISTED_ON>2019-07-20</LISTED_ON>
      <ENTITY_ALIAS>
        <QUALITY>Good</QUALITY>
        <ALIAS_NAME>GTS Ltd</ALIAS_NAME>
      </ENTITY_ALIAS>
      <ENTITY_ADDRESS>
        <COUNTRY>United Arab Emirates</COUNTRY>
        <CITY>Dubai</CITY>
      </ENTITY_ADDRESS>
    </ENTITY>
  </ENTITIES>
</DATAEXPORT>
```

### Campos Suportados (Formato ONU)

#### INDIVIDUAL
- `DATAID` - Identificador único
- `FIRST_NAME`, `SECOND_NAME`, `THIRD_NAME`, `FOURTH_NAME` - Partes do nome
- `UN_LIST_TYPE` - Tipo de lista (Al-Qaida, Taliban, etc.)
- `REFERENCE_NUMBER` - Número de referência oficial
- `LISTED_ON` - Data de inclusão
- `COMMENTS1` - Comentários adicionais
- `NATIONALITY/VALUE` - Nacionalidade
- `INDIVIDUAL_ALIAS` - Aliases (múltiplos)
  - `QUALITY` - Qualidade (Good, Low, etc.)
  - `ALIAS_NAME` - Nome do alias
- `INDIVIDUAL_DATE_OF_BIRTH` - Data de nascimento
  - `TYPE_OF_DATE` - EXACT, YEAR, FROM, BETWEEN
  - `DATE` - Data ou ano
- `INDIVIDUAL_PLACE_OF_BIRTH` - Local de nascimento
  - `COUNTRY`, `CITY`, `STATE_PROVINCE`
- `INDIVIDUAL_DOCUMENT` - Documentos (múltiplos)
  - `TYPE_OF_DOCUMENT`, `NUMBER`, `ISSUING_COUNTRY`
- `INDIVIDUAL_ADDRESS` - Endereços (múltiplos)
  - `COUNTRY`, `CITY`, `STREET`, `NOTE`

#### ENTITY
- Mesmos campos básicos que INDIVIDUAL
- `ENTITY_ALIAS` em vez de `INDIVIDUAL_ALIAS`
- `ENTITY_ADDRESS` em vez de `INDIVIDUAL_ADDRESS`
- Sem data de nascimento ou documentos

---

## 📋 Formato 2: Simplificado

Formato mais simples e legível, ideal para listas customizadas.

### Características
- Tags em **minúsculas**: `<individual>`, `<entity>`, `<primaryName>`, etc.
- Nome completo em um único campo: `<primaryName>`
- Estrutura mais compacta

### Exemplo Completo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sanctionsList>
  <individual id="REG-001" dateListed="2020-01-01" lastUpdate="2024-01-15">
    <primaryName>John Alexander Smith</primaryName>
    <alias quality="good">Johnny Smith</alias>
    <alias quality="good">J. A. Smith</alias>
    <alias>John Smith</alias>
    <dateOfBirth precision="EXACT">1960-04-07</dateOfBirth>
    <placeOfBirth>London</placeOfBirth>
    <nationality>British</nationality>
    <gender>M</gender>
    <document type="Passport" number="D00012345" issuingCountry="UK"/>
    <address>London, UK</address>
    <program name="Program Alpha" reference="Financial regulations">
      Designated pursuant to resolution provisions
    </program>
  </individual>

  <entity id="REG-002" dateListed="2021-01-01" lastUpdate="2024-01-15">
    <primaryName>Global Trading Corporation</primaryName>
    <alias quality="good">GTC</alias>
    <alias>Global Trading Corp</alias>
    <address>Singapore</address>
    <program name="Program Beta" reference="Trade compliance">
      Listed for regulatory violations
    </program>
  </entity>
</sanctionsList>
```

### Campos Suportados (Formato Simplificado)

#### individual
- Atributos: `id`, `dateListed`, `lastUpdate`
- `<primaryName>` - Nome completo
- `<alias>` - Aliases (múltiplos, atributo opcional `quality`)
- `<dateOfBirth>` - Data de nascimento (atributo opcional `precision`)
- `<placeOfBirth>` - Local de nascimento
- `<nationality>` - Nacionalidade
- `<gender>` - Gênero (M/F)
- `<document>` - Documentos (atributos: `type`, `number`, `issuingCountry`)
- `<address>` - Endereços (múltiplos)
- `<program>` - Programas de sanção (atributos: `name`, `reference`)

#### entity
- Atributos: `id`, `dateListed`, `lastUpdate`
- `<primaryName>` - Nome completo
- `<alias>` - Aliases (múltiplos)
- `<address>` - Endereços (múltiplos)
- `<program>` - Programas de sanção

---

## 🔄 Como Usar Múltiplos Arquivos

### Passo 1: Adicionar arquivos XML

Coloque seus arquivos XML na pasta `public/archives/`:

```bash
# Exemplo
cp lista-oficial-onu.xml public/archives/
cp lista-ofac.xml public/archives/
cp lista-eu.xml public/archives/
cp minha-lista-custom.xml public/archives/
```

### Passo 2: Atualizar o manifesto

Edite o arquivo `public/archives/manifest.json`:

```json
{
  "files": [
    "sanctions-list.xml",
    "un-official-sample.xml",
    "lista-oficial-onu.xml",
    "lista-ofac.xml",
    "lista-eu.xml",
    "minha-lista-custom.xml"
  ],
  "description": "Lista de arquivos XML de sanções",
  "lastUpdated": "2024-12-01"
}
```

### Passo 3: Recarregar os dados

1. Acesse a página **"Data"** no sistema
2. Clique em **"Recarregar Dados"**
3. O sistema carregará todos os arquivos listados no manifesto

### Passo 4: Verificar

O Dashboard mostrará o total de registros de **todos os arquivos combinados**.

---

## 🔍 Detecção Automática de Formato

O sistema detecta automaticamente qual formato cada arquivo usa:

```typescript
// Formato oficial ONU detectado por tags em MAIÚSCULAS
if (xmlContent.includes('<INDIVIDUAL>') || xmlContent.includes('<ENTITY>')) {
  return 'UN_OFFICIAL';
}

// Formato simplificado detectado por tags em minúsculas
if (xmlContent.includes('<individual>') || xmlContent.includes('<entity>')) {
  return 'SIMPLE';
}
```

Você pode **misturar formatos** na mesma pasta! O sistema processa cada arquivo corretamente.

---

## 📊 Exemplos de Uso

### Exemplo 1: Lista Oficial da ONU

Baixe o XML oficial de: https://scsanctions.un.org/resources/xml/en/consolidated_list.xml

Salve como `public/archives/un-consolidated-list.xml` e adicione ao manifesto.

### Exemplo 2: Lista OFAC (EUA)

Converta a lista SDN da OFAC para o formato XML e salve em `public/archives/ofac-sdn.xml`.

### Exemplo 3: Lista da UE

Baixe o XML da UE e salve em `public/archives/eu-sanctions.xml`.

### Exemplo 4: Lista Customizada

Crie sua própria lista no formato simplificado:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sanctionsList>
  <individual id="CUSTOM-001" dateListed="2024-01-01">
    <primaryName>João da Silva</primaryName>
    <alias quality="good">João Silva</alias>
    <nationality>Brasileiro</nationality>
    <program name="Lista Interna">Inadimplência grave</program>
  </individual>
</sanctionsList>
```

---

## 🎯 Como o Sistema Processa os Dados

1. **Leitura do Manifesto**: Lê `manifest.json` para saber quais arquivos carregar
2. **Carregamento Sequencial**: Carrega cada arquivo XML listado
3. **Detecção de Formato**: Identifica automaticamente o formato de cada arquivo
4. **Parsing**: Converte XML em objetos TypeScript
5. **Combinação**: Junta todos os registros em uma única lista
6. **Cache**: Mantém em memória para buscas rápidas
7. **Busca**: Pesquisa em todos os registros combinados

---

## ⚠️ Considerações Importantes

### IDs Únicos
- O sistema gera IDs únicos baseados em `DATAID` ou `REFERENCE_NUMBER`
- Se houver duplicatas, os registros serão sobrescritos
- Use IDs únicos em cada arquivo

### Performance
- Arquivos muito grandes (>10MB) podem causar lentidão
- Recomenda-se dividir listas grandes em múltiplos arquivos
- O sistema carrega todos os dados na memória

### Validação
- XMLs mal formados são ignorados (com aviso no console)
- Campos obrigatórios ausentes resultam em registros incompletos
- O sistema é tolerante a dados faltantes

---

## 🧪 Testando o Sistema

### Teste 1: Formato Oficial ONU

Busque por: `ABD AL-RAHMAN`  
Resultado esperado: Encontra "ABD AL-RAHMAN KHALAF UBAYD JUDAY AL-ANIZI"

### Teste 2: Formato Simplificado

Busque por: `John`  
Resultado esperado: Encontra "John Alexander Smith"

### Teste 3: Transliteração

Busque por: `Mohammed`  
Resultado esperado: Encontra variações como "MOHAMMED IBRAHIM AL-SHAMMARI"

### Teste 4: Ordem de Nomes

Busque por: `Wei Zhang`  
Resultado esperado: Encontra "ZHANG WEI" (ordem invertida)

---

## 📚 Recursos Adicionais

- [XML_GUIDE.md](./XML_GUIDE.md) - Guia original (formato simplificado)
- [README.md](./README.md) - Documentação principal
- [TESTING.md](./TESTING.md) - Guia de testes

---

## 🆘 Troubleshooting

### Problema: Arquivo não é carregado

**Solução:**
1. Verifique se o arquivo está em `public/archives/`
2. Verifique se está listado em `manifest.json`
3. Verifique se o XML é válido (use um validador online)
4. Abra o console do navegador para ver erros

### Problema: Registros não aparecem

**Solução:**
1. Clique em "Recarregar Dados" na página Data
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se o formato do XML está correto
4. Verifique os logs no console

### Problema: Busca não encontra resultados

**Solução:**
1. Verifique se os dados foram carregados (Dashboard mostra total)
2. Tente buscar por parte do nome
3. Reduza o score mínimo na busca
4. Verifique a ortografia

---

## ✅ Status

```
✅ Formato Oficial ONU: Suportado
✅ Formato Simplificado: Suportado
✅ Múltiplos Arquivos: Suportado
✅ Detecção Automática: Funcionando
✅ Combinação de Dados: Funcionando
✅ Build: Sucesso
```

---

**Pronto para usar!** 🎉

Agora você pode carregar quantos arquivos XML quiser, nos dois formatos suportados, e o sistema combinará todos os dados para busca unificada.
