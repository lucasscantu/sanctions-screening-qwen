# Supported XML Formats Guide

The name matching system now supports **multiple XML files** and **two different formats**.

---

## New Features

- **Support for official format** (tags in UPPERCASE)
- **Support for simplified format** (tags in lowercase)
- **Loading of multiple XML files**
- **Automatic format detection**
- **Combination of all records**

---

## File Structure

```
public/archives/
+-- manifest.json                    <- List of files to load
+-- data-list.xml                    <- Simplified format
+-- official-sample.xml              <- Official format
+-- your-file-1.xml                  <- Add as many as you want
+-- your-file-2.xml
```

---

## Format 1: Official Format

This is the format used by official consolidated lists.

### Characteristics
- Tags in **UPPERCASE**: `<INDIVIDUAL>`, `<ENTITY>`, `<FIRST_NAME>`, etc.
- Names separated into parts: `FIRST_NAME`, `SECOND_NAME`, `THIRD_NAME`, `FOURTH_NAME`
- Aliases in `<INDIVIDUAL_ALIAS>` with `<QUALITY>` and `<ALIAS_NAME>`
- Dates in `<INDIVIDUAL_DATE_OF_BIRTH>` with `<TYPE_OF_DATE>` and `<DATE>`

### Complete Example

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

### Supported Fields (Official Format)

#### INDIVIDUAL
- `DATAID` - Unique identifier
- `FIRST_NAME`, `SECOND_NAME`, `THIRD_NAME`, `FOURTH_NAME` - Name parts
- `UN_LIST_TYPE` - List type
- `REFERENCE_NUMBER` - Official reference number
- `LISTED_ON` - Listing date
- `COMMENTS1` - Additional comments
- `NATIONALITY/VALUE` - Nationality
- `INDIVIDUAL_ALIAS` - Aliases (multiple)
  - `QUALITY` - Quality (Good, Low, etc.)
  - `ALIAS_NAME` - Alias name
- `INDIVIDUAL_DATE_OF_BIRTH` - Date of birth
  - `TYPE_OF_DATE` - EXACT, YEAR, FROM, BETWEEN
  - `DATE` - Date or year
- `INDIVIDUAL_PLACE_OF_BIRTH` - Place of birth
  - `COUNTRY`, `CITY`, `STATE_PROVINCE`
- `INDIVIDUAL_DOCUMENT` - Documents (multiple)
  - `TYPE_OF_DOCUMENT`, `NUMBER`, `ISSUING_COUNTRY`
- `INDIVIDUAL_ADDRESS` - Addresses (multiple)
  - `COUNTRY`, `CITY`, `STREET`, `NOTE`

#### ENTITY
- Same basic fields as INDIVIDUAL
- `ENTITY_ALIAS` instead of `INDIVIDUAL_ALIAS`
- `ENTITY_ADDRESS` instead of `INDIVIDUAL_ADDRESS`
- No date of birth or documents

---

## Format 2: Simplified Format

Simpler and more readable format, ideal for custom lists.

### Characteristics
- Tags in **lowercase**: `<individual>`, `<entity>`, `<primaryName>`, etc.
- Full name in a single field: `<primaryName>`
- More compact structure

### Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataList>
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
</dataList>
```

### Supported Fields (Simplified Format)

#### individual
- Attributes: `id`, `dateListed`, `lastUpdate`
- `<primaryName>` - Full name
- `<alias>` - Aliases (multiple, optional attribute `quality`)
- `<dateOfBirth>` - Date of birth (optional attribute `precision`)
- `<placeOfBirth>` - Place of birth
- `<nationality>` - Nationality
- `<gender>` - Gender (M/F)
- `<document>` - Documents (attributes: `type`, `number`, `issuingCountry`)
- `<address>` - Addresses (multiple)
- `<program>` - Programs (attributes: `name`, `reference`)

#### entity
- Attributes: `id`, `dateListed`, `lastUpdate`
- `<primaryName>` - Full name
- `<alias>` - Aliases (multiple)
- `<address>` - Addresses (multiple)
- `<program>` - Programs

---

## How to Use Multiple Files

### Step 1: Add XML files

Place your XML files in the `public/archives/` folder:

```bash
# Example
cp official-list.xml public/archives/
cp custom-list.xml public/archives/
```

### Step 2: Update the manifest

Edit the file `public/archives/manifest.json`:

```json
{
  "files": [
    "data-list.xml",
    "official-list.xml",
    "custom-list.xml"
  ],
  "description": "List of XML files to load",
  "lastUpdated": "2024-12-01"
}
```

### Step 3: Reload data

1. Access the **"Data"** page in the system
2. Click **"Reload Data"**
3. The system will load all files listed in the manifest

### Step 4: Verify

The Dashboard will show the total of records from **all combined files**.

---

## Automatic Format Detection

The system automatically detects which format each file uses:

```typescript
// Official format detected by UPPERCASE tags
if (xmlContent.includes('<INDIVIDUAL>') || xmlContent.includes('<ENTITY>')) {
  return 'OFFICIAL';
}

// Simplified format detected by lowercase tags
if (xmlContent.includes('<individual>') || xmlContent.includes('<entity>')) {
  return 'SIMPLIFIED';
}
```

You can **mix formats** in the same folder! The system processes each file correctly.

---

## Usage Examples

### Example 1: Official List

Download the official XML and save as `public/archives/official-list.xml`, then add to manifest.

### Example 2: Custom List

Create your own list in simplified format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataList>
  <individual id="CUSTOM-001" dateListed="2024-01-01">
    <primaryName>John Doe</primaryName>
    <alias quality="good">Johnny Doe</alias>
    <nationality>American</nationality>
    <program name="Internal List">Non-compliance</program>
  </individual>
</dataList>
```

---

## How the System Processes Data

1. **Reading Manifest**: Reads `manifest.json` to know which files to load
2. **Sequential Loading**: Loads each listed XML file
3. **Format Detection**: Automatically identifies the format of each file
4. **Parsing**: Converts XML to TypeScript objects
5. **Combination**: Joins all records into a single list
6. **Cache**: Keeps in memory for fast searches
7. **Search**: Searches all combined records

---

## Important Considerations

### Unique IDs
- System generates unique IDs based on `DATAID` or `REFERENCE_NUMBER`
- If there are duplicates, records will be overwritten
- Use unique IDs in each file

### Performance
- Very large files (>10MB) may cause slowness
- Recommended to divide large lists into multiple files
- System loads all data into memory

### Validation
- Malformed XMLs are ignored (with console warning)
- Missing required fields result in incomplete records
- System is tolerant to missing data

---

## Troubleshooting

### Problem: File is not loaded

**Solution:**
1. Check if file is in `public/archives/`
2. Check if it's listed in `manifest.json`
3. Check if XML is valid (use online validator)
4. Open browser console to see errors

### Problem: Records do not appear

**Solution:**
1. Click "Reload Data" on Data page
2. Clear browser cache (Ctrl+Shift+R)
3. Check if XML format is correct
4. Check logs in console

### Problem: Search does not find results

**Solution:**
1. Check if data was loaded (Dashboard shows total)
2. Try searching for part of the name
3. Reduce minimum score in search
4. Check spelling

---

## Additional Resources

- [XML_GUIDE.md](./XML_GUIDE.md) - Original guide (simplified format)
- [README.md](./README.md) - Main documentation
- [TESTING.md](./TESTING.md) - Testing guide

---

## Status

```
✓ Official Format: Supported
✓ Simplified Format: Supported
✓ Multiple Files: Supported
✓ Automatic Detection: Working
✓ Data Combination: Working
✓ Build: Success
```

---

**Ready to use!**

Now you can load as many XML files as you want, in both supported formats, and the system will combine all data for unified search.
