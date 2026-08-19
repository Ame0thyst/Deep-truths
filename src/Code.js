/**
 * LDR Deep Talk Backend — Gilang & Erika (Robust Destructuring Parser)
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Deep Talk — Gilang & Erika')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Mengambil seluruh bank pertanyaan dari Google Spreadsheet
function getQuestions() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Questions');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      resetAndFixSpreadsheet();
      sheet = ss.getSheetByName('Questions');
    }

    const data = sheet.getDataRange().getValues();
    const cleanList = [];

    // Baca mulai baris ke-2 (melewati baris header)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // Destructuring array untuk membaca kolom secara presisi tanpa risiko tertukar
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

    return cleanList;
  } catch (err) {
    Logger.log('Error getQuestions: ' + err);
    return [];
  }
}

// Menambah pertanyaan kustom baru ke Spreadsheet
function addCustomQuestion(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Questions');
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

// Fungsi reset untuk memastikan susunan kolom di Spreadsheet bersih
function resetAndFixSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Questions');
  if (!sheet) sheet = ss.insertSheet('Questions');
  sheet.clear();

  const headers = ['ID', 'Category', 'Level', 'Question', 'AddedBy'];
  const initialData = [
    // Level 1: Ice Breaker & Nostalgia
    ['TRUTH-101', 'Nostalgia', 'Level 1', 'Apa first impression kamu waktu pertama kali kenal atau ketemu aku?', 'System'],
    ['TRUTH-102', 'Nostalgia', 'Level 1', 'Momen apa di awal hubungan kita yang paling sering bikin kamu senyum-senyum sendiri kalau diingat?', 'System'],
    ['TRUTH-103', 'Kebiasaan', 'Level 1', 'Menurut kamu, kebiasaan lucu atau unik apa dari aku yang baru kamu sadari setelah pacaran?', 'System'],
    ['TRUTH-104', 'Nostalgia', 'Level 1', 'Kapan momen spesifik yang bikin kamu sadar kalau kamu beneran jatuh cinta sama aku?', 'System'],
    
    // Level 2: Feelings & Vulnerability
    ['TRUTH-201', 'Feelings', 'Level 2', 'Hal apa dari kondisi LDR kita saat ini yang paling sering bikin kamu cemas atau overthinking?', 'System'],
    ['TRUTH-202', 'Apresiasi', 'Level 2', 'Sifat atau perlakuan apa dari aku yang paling membuat kamu merasa dihargai dan disayang?', 'System'],
    ['TRUTH-203', 'Feelings', 'Level 2', 'Kalau kamu lagi capek atau sedih saat LDR, respon seperti apa dari aku yang paling kamu butuhkan?', 'System'],
    ['TRUTH-204', 'Vulnerability', 'Level 2', 'Ada nggak hal yang selama ini ragu kamu omongin ke aku karena takut bikin salah paham?', 'System'],
    ['TRUTH-205', 'Feelings', 'Level 2', 'Momen apa dalam seminggu terakhir ini di mana kamu merasa paling kangen sama kehadiran aku?', 'System'],

    // Level 3: Future & Commitment
    ['TRUTH-301', 'Future', 'Level 3', 'Apa hal nomor satu yang paling pengen kita capai bersama dalam 1-2 tahun ke depan?', 'System'],
    ['TRUTH-302', 'Future', 'Level 3', 'Kalau masa LDR kita selesai dan kita tinggal satu kota, rutinitas apa yang paling kamu impikan bareng aku?', 'System'],
    ['TRUTH-303', 'Commitment', 'Level 3', 'Bagaimana cara kita menyelesaikan masalah yang menurut kamu paling baik dan perlu kita pertahankan?', 'System'],
    ['TRUTH-304', 'Future', 'Level 3', 'Apa ketakutan terbesar kamu tentang masa depan hubungan kita, dan gimana cara kita bisa hadapi itu bareng?', 'System'],

    // Level 4: Romantic & Intimate
    ['TRUTH-401', 'Romantic', 'Level 4', 'Apa bentuk perhatian kecil dari aku yang paling bikin hati kamu berdebar?', 'System'],
    ['TRUTH-402', 'Romantic', 'Level 4', 'Satu hal paling menarik dan memikat dari aku menurut sudut pandang kamu itu apa?', 'System'],
    ['TRUTH-403', 'Romantic', 'Level 4', 'Lagu atau tempat apa yang setiap kali kamu lihat selalu bikin kamu langsung kepikiran aku?', 'System']
  ];

  sheet.appendRow(headers);
  initialData.forEach(row => sheet.appendRow(row));
  sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#fdfbf7');
  Logger.log('Spreadsheet berhasil direset dan diisi ulang!');
}