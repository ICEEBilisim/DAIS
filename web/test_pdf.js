import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';

const pdfPath = '../Enabiz-Tahlilleri (4).pdf';
const arrayBuffer = fs.readFileSync(pdfPath).buffer;

const parseMedicalValues = (text) => {
    const knownTests = [
      { key: 'WBC', name: 'WBC (Beyaz Kan Hücresi)' },
      { key: 'Lökosit', name: 'WBC (Beyaz Kan Hücresi)' },
      { key: 'RBC', name: 'RBC (Kırmızı Kan Hücresi)' },
      { key: 'Eritrosit', name: 'RBC (Kırmızı Kan Hücresi)' },
      { key: 'HGB', name: 'HGB (Hemoglobin)' },
      { key: 'Hemoglobin', name: 'HGB (Hemoglobin)' },
      { key: 'PLT', name: 'PLT (Trombosit)' },
      { key: 'Trombosit', name: 'PLT (Trombosit)' },
      { key: 'ALT', name: 'ALT' },
      { key: 'AST', name: 'AST' },
      { key: 'Glukoz', name: 'Glukoz' },
      { key: 'Demir', name: 'Demir' },
      { key: 'Ferritin', name: 'Ferritin' },
      { key: 'Kolesterol', name: 'Kolesterol' },
      { key: 'Kalsiyum', name: 'Kalsiyum' },
      { key: 'Kreatinin', name: 'Kreatinin' },
      { key: 'TSH', name: 'TSH' },
      { key: 'Ürik Asit', name: 'Ürik Asit' },
      { key: 'Üre', name: 'Üre Azotu' },
      { key: 'B12', name: 'Vitamin B12' },
      { key: 'Folat', name: 'Folat' },
      { key: 'CRP', name: 'C-Reaktif Protein (CRP)' },
      { key: 'GGT', name: 'GGT' }
    ];

    const lines = text.split('\n');
    const newValues = [];
    let idCounter = 1;
    const foundNames = new Set(); // To avoid duplicates for same logical test

    for (const line of lines) {
      for (const test of knownTests) {
        if (!foundNames.has(test.name) && line.toUpperCase().includes(test.key.toUpperCase())) {
          const tokens = line.split(/\s+/);
          let val = null;
          let unit = '';
          
          for (let i = 0; i < tokens.length; i++) {
            if (/^[\d.,]+$/.test(tokens[i]) && tokens[i] !== '.' && tokens[i] !== ',') {
              val = tokens[i];
              if (i + 1 < tokens.length) {
                unit = tokens[i+1];
              }
              break;
            }
          }

          if (val !== null) {
            newValues.push({
              id: idCounter++,
              name: test.name,
              value: val,
              unit: unit
            });
            foundNames.add(test.name);
          }
        }
      }
    }
    return newValues;
  };

async function test() {
    console.log("Loading PDF...");
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    let lastY = -1;
    let textWithNewlines = '';
    for (const item of textContent.items) {
        if (lastY !== item.transform[5] && lastY !== -1) {
            textWithNewlines += '\n';
        }
        textWithNewlines += item.str + ' ';
        lastY = item.transform[5];
    }
    fullText += textWithNewlines + '\n';
    }
    
    console.log("Full text extracted length: ", fullText.length);
    console.log(fullText.substring(0, 500));
    
    const extractedValues = parseMedicalValues(fullText);
    console.log("Extracted values: ", extractedValues);
}

test().catch(console.error);
