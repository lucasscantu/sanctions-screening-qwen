# XML Guide - Local Data System

This system works with a local XML file containing the data list.

## File Structure

```
name-matching-system/
+-- public/
|   +-- archives/
|       +-- data-list.xml    <- XML file with data
+-- src/
|   +-- lib/
|   |   +-- xml-parser.ts    <- XML parser
|   +-- api/
|   |   +-- client.ts        <- API that uses XML
|   +-- pages/
|       +-- DataManager.tsx  <- Data management
```

## XML File Format

The XML file should follow this structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataList>
  <!-- Individuals -->
  <individual id="REG-001" dateListed="2020-01-01" lastUpdate="2024-01-15">
    <primaryName>John Smith</primaryName>
    <alias quality="good">Johnny Smith</alias>
    <alias>John A. Smith</alias>
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

  <!-- Entities -->
  <entity id="REG-002" dateListed="2021-01-01" lastUpdate="2024-01-15">
    <primaryName>Company Ltd</primaryName>
    <alias quality="good">CL</alias>
    <address>Singapore</address>
    <program name="Program Beta" reference="Trade compliance">
      Listed for regulatory violations
    </program>
  </entity>
</dataList>
```

## Elements and Attributes

### `<individual>` - Natural Person
**Attributes:**
- `id` (required): Unique identifier (e.g., "REG-001")
- `dateListed` (optional): Date of inclusion in the list
- `lastUpdate` (optional): Date of last update

**Child elements:**
- `<primaryName>` (required): Primary name
- `<alias>` (optional, multiple): Alternative names
  - Attribute `quality` (optional): "good", "low", etc.
- `<dateOfBirth>` (optional): Date of birth
  - Attribute `precision`: "EXACT", "YEAR_ONLY", "APPROXIMATE"
- `<placeOfBirth>` (optional): Place of birth
- `<nationality>` (optional): Nationality
- `<gender>` (optional): "M" or "F"
- `<document>` (optional, multiple): Identification documents
  - Attributes: `type`, `number`, `issuingCountry`
- `<address>` (optional, multiple): Addresses
- `<program>` (optional, multiple): Programs
  - Attributes: `name`, `reference`
  - Content: Listing details

### `<entity>` - Legal Entity
**Attributes:**
- `id` (required): Unique identifier
- `dateListed` (optional): Date of inclusion
- `lastUpdate` (optional): Date of last update

**Child elements:**
- `<primaryName>` (required): Primary name
- `<alias>` (optional, multiple): Alternative names
- `<address>` (optional, multiple): Addresses
- `<program>` (optional, multiple): Programs

## How to Use

### 1. Edit the XML File

The default file is at:
```
public/archives/data-list.xml
```

Edit this file with your data or replace it with an official XML file.

### 2. Reload Data

After editing the XML file:

1. Access the **"Data"** page in the menu
2. Click **"Reload Data"**
3. The system will reprocess the XML

### 3. Perform Searches

1. Access the **"Search"** page
2. Enter a name to search
3. The system will search in the loaded XML

## Statistics

The Dashboard shows:
- Total loaded records
- Number of individuals
- Number of entities
- Last synchronization date

## Search Examples

With the sample XML, try searching for:

- `John` -> Finds "John Smith"
- `Maria` -> Finds "Maria Elena Rodriguez"
- `Zhang` -> Finds "Chen Wei Zhang"
- `Global` -> Finds "Global Trading Corporation"
- `Ahmed` -> Finds "Ahmed Hassan Ibrahim"

## Internal Operation

1. **Loading**: XML is loaded via `fetch('/archives/data-list.xml')`
2. **Parsing**: `xml-parser.ts` converts XML to TypeScript objects
3. **Cache**: Data is kept in cache for performance
4. **Search**: `client.ts` uses cached data for searches
5. **Similarity**: Algorithms calculate similarity scores

## Security

- ✓ All data is processed locally
- ✓ No data is sent to external servers
- ✓ XML is validated before processing
- ✓ Parser is secure against XXE (XML External Entity)

## Validation

The system validates:
- Well-formed XML
- Expected structure
- Required fields
- Data types

## Updating Data

### Option 1: Edit the File
```bash
# Edit directly
nano public/archives/data-list.xml

# Or use your favorite editor
code public/archives/data-list.xml
```

### Option 2: Replace the File
```bash
# Copy a new XML file
cp my-new-file.xml public/archives/data-list.xml
```

### Option 3: Upload via Interface
1. Access the **"Data"** page
2. Click **"Select XML File"**
3. Choose your file
4. Click **"Reload Data"**

## Troubleshooting

### XML does not load
- Check if file is in `public/archives/`
- Check if name is `data-list.xml`
- Check if XML is valid (use an online validator)

### Data does not update
- Clear browser cache (Ctrl+Shift+R)
- Click "Reload Data" on Data page
- Check browser console for errors

### Search does not find results
- Check if XML was loaded correctly
- Check name spelling
- Try searching for part of the name
- Reduce minimum score in search

## Resources

- [XML Documentation](https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction)
- [DOMParser API](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
- [XPath](https://developer.mozilla.org/en-US/docs/Web/XPath)

## Important Notes

1. **Demo Data**: Included XML contains fictional data for testing
2. **Real Data**: For production use, replace with official data
3. **Privacy**: All data is processed locally
4. **Performance**: XML is loaded once and kept in cache

---

**Ready to use!**

Edit the file `public/archives/data-list.xml` with your data and start using the system.
