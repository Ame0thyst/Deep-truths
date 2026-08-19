/**
 * LDR Deep Talk Backend — Gilang & Erika (PWA & Web App API Engine)
 */

// Silakan masukkan ID Spreadsheet Anda di bawah ini jika sudah ada:
// (Contoh: https://docs.google.com/spreadsheets/d/ID_SPREADSHEET_ANDA/edit)
const SPREADSHEET_ID = "1OXwT69qI2cVRph0r3j0UjRrDAfAdBmjbQYBVtlgtjnQ"; 

function doGet(e) {
  // Jika dipanggil via API eksternal (PWA Fetch / JSONP) untuk mengambil data pertanyaan
  if (e && e.parameter && e.parameter.action === 'get') {
    try {
      const questions = getQuestions();
      const payload = JSON.stringify({ success: true, data: questions });
      
      if (e.parameter.callback) {
        return ContentService.createTextOutput(e.parameter.callback + '(' + payload + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      
      return ContentService.createTextOutput(payload)
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      const errPayload = JSON.stringify({ success: false, error: err.toString(), data: [] });
      if (e.parameter.callback) {
        return ContentService.createTextOutput(e.parameter.callback + '(' + errPayload + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(errPayload)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Deep Talk — Gilang & Erika')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .addMetaTag('theme-color', '#FBF8F2')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    let result;
    
    if (data.action === 'add') {
      result = addCustomQuestion(data);
    } else {
      result = { success: false, error: "Action tidak dikenal." };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi helper pintar untuk membuka/mendapatkan Spreadsheet
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch(e) {
      Logger.log("Error opening SPREADSHEET_ID: " + e);
    }
  }

  // Coba getActiveSpreadsheet jika container-bound
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch(e) {}

  // Jika standalone script dan ID belum diisi, buat Spreadsheet otomatis di Google Drive
  try {
    const newSs = SpreadsheetApp.create('Deep Truths — Bank Pertanyaan');
    Logger.log('Spreadsheet baru dibuat otomatis: ' + newSs.getId());
    return newSs;
  } catch(e) {
    Logger.log('Gagal membuat Spreadsheet: ' + e);
    return null;
  }
}

// Mengambil seluruh bank pertanyaan dari Google Spreadsheet
function getQuestions() {
  try {
    const ss = getSpreadsheet();
    if (!ss) return getFallbackQuestionsArray();

    let sheet = ss.getSheetByName('Questions') || ss.getSheets()[0];
    if (!sheet || sheet.getLastRow() < 1) {
      resetAndFixSpreadsheet(ss);
      sheet = ss.getSheetByName('Questions') || ss.getSheets()[0];
    }

    const data = sheet.getDataRange().getValues();
    const cleanList = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const [colId, colCategory, colLevel, colQuestion, colAuthor] = row;
      const questionText = String(colQuestion || '').trim();

      if (questionText !== '') {
        cleanList.push({
          id: String(colId || ('TRUTH-' + (100 + i))).trim(),
          category: String(colCategory || 'General').trim(),
          level: String(colLevel || 'Level 1').trim(),
          question: questionText,
          addedBy: String(colAuthor || 'System').trim()
        });
      }
    }

    return cleanList.length > 0 ? cleanList : getFallbackQuestionsArray();
  } catch (err) {
    Logger.log('Error getQuestions: ' + err);
    return getFallbackQuestionsArray();
  }
}

// Menambah pertanyaan kustom baru ke Spreadsheet
function addCustomQuestion(payload) {
  try {
    const ss = getSpreadsheet();
    if (!ss) return { success: false, error: "Tidak dapat mengakses Spreadsheet." };

    let sheet = ss.getSheetByName('Questions') || ss.getSheets()[0];
    if (!sheet) {
      sheet = ss.insertSheet('Questions');
      sheet.appendRow(['ID', 'Category', 'Level', 'Question', 'AddedBy']);
    }
    const id = 'TRUTH-' + Math.floor(500 + Math.random() * 499);
    sheet.appendRow([id, payload.category || 'Custom', payload.level || 'Level 2', payload.question, payload.addedBy || 'Pasangan']);
    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// Reset dan isi default pertanyaan di Spreadsheet
function resetAndFixSpreadsheet(ssInstance) {
  const ss = ssInstance || getSpreadsheet();
  if (!ss) return;

  let sheet = ss.getSheetByName('Questions');
  if (!sheet) sheet = ss.insertSheet('Questions');
  sheet.clear();

  const headers = ['ID', 'Category', 'Level', 'Question', 'AddedBy'];
  const initialData = getFallbackQuestionsArray().map(q => [q.id, q.category, q.level, q.question, q.addedBy]);

  sheet.appendRow(headers);
  initialData.forEach(row => sheet.appendRow(row));
  sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#fdfbf7');
}

function getFallbackQuestionsArray() {
  return [
    { id: 'TRUTH-101', category: 'Nostalgia', level: 'Level 1', question: 'Apa first impression kamu waktu pertama kali kenal atau ketemu aku?', addedBy: 'System' },
    { id: 'TRUTH-102', category: 'Nostalgia', level: 'Level 1', question: 'Momen apa di awal hubungan kita yang paling sering bikin kamu senyum-senyum sendiri kalau diingat?', addedBy: 'System' },
    { id: 'TRUTH-103', category: 'Kebiasaan', level: 'Level 1', question: 'Menurut kamu, kebiasaan lucu atau unik apa dari aku yang baru kamu sadari setelah pacaran?', addedBy: 'System' },
    { id: 'TRUTH-104', category: 'Nostalgia', level: 'Level 1', question: 'Kapan momen spesifik yang bikin kamu sadar kalau kamu beneran jatuh cinta sama aku?', addedBy: 'System' },
    { id: 'TRUTH-201', category: 'Feelings', level: 'Level 2', question: 'Hal apa dari kondisi LDR kita saat ini yang paling sering bikin kamu cemas atau overthinking?', addedBy: 'System' },
    { id: 'TRUTH-202', category: 'Apresiasi', level: 'Level 2', question: 'Sifat atau perlakuan apa dari aku yang paling membuat kamu merasa dihargai dan disayang?', addedBy: 'System' },
    { id: 'TRUTH-203', category: 'Feelings', level: 'Level 2', question: 'Kalau kamu lagi capek atau sedih saat LDR, respon seperti apa dari aku yang paling kamu butuhkan?', addedBy: 'System' },
    { id: 'TRUTH-204', category: 'Vulnerability', level: 'Level 2', question: 'Ada nggak hal yang selama ini ragu kamu omongin ke aku karena takut bikin salah paham?', addedBy: 'System' },
    { id: 'TRUTH-205', category: 'Feelings', level: 'Level 2', question: 'Momen apa dalam seminggu terakhir ini di mana kamu merasa paling kangen sama kehadiran aku?', addedBy: 'System' },
    { id: 'TRUTH-301', category: 'Future', level: 'Level 3', question: 'Apa hal nomor satu yang paling pengen kita capai bersama dalam 1-2 tahun ke depan?', addedBy: 'System' },
    { id: 'TRUTH-302', category: 'Future', level: 'Level 3', question: 'Kalau masa LDR kita selesai dan kita tinggal satu kota, rutinitas apa yang paling kamu impikan bareng aku?', addedBy: 'System' },
    { id: 'TRUTH-303', category: 'Commitment', level: 'Level 3', question: 'Bagaimana cara kita menyelesaikan masalah yang menurut kamu paling baik dan perlu kita pertahankan?', addedBy: 'System' },
    { id: 'TRUTH-304', category: 'Future', level: 'Level 3', question: 'Apa ketakutan terbesar kamu tentang masa depan hubungan kita, dan gimana cara kita bisa hadapi itu bareng?', addedBy: 'System' },
    { id: 'TRUTH-401', category: 'Romantic', level: 'Level 4', question: 'Apa bentuk perhatian kecil dari aku yang paling bikin hati kamu berdebar?', addedBy: 'System' },
    { id: 'TRUTH-402', category: 'Romantic', level: 'Level 4', question: 'Satu hal paling menarik dan memikat dari aku menurut sudut pandang kamu itu apa?', addedBy: 'System' },
    { id: 'TRUTH-403', category: 'Romantic', level: 'Level 4', question: 'Lagu atau tempat apa yang setiap kali kamu lihat selalu bikin kamu langsung kepikiran aku?', addedBy: 'System' }
  ];
}
