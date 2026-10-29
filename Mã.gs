/**
 * DINO MOBILE SYSTEM — Apps Script backend
 * Compatible with the existing index.html API actions:
 *   GET  ?action=getAll
 *   POST {action:addData|deleteData|updateData, ...}
 * The extension uses addData to insert a manually approved item into Luu_Tam.
 */
function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || '').trim();
  if (action === 'getAll') {
    return jsonOutput_(getAllData());
  }

  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('DINO MOBILE SYSTEM')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    const action = String(data.action || '').trim();
    let result;

    if (action === 'addData') {
      result = addDataToSheet(data.sheetName, data.rowData);
    } else if (action === 'deleteData') {
      result = deleteRow(data.sheetName, data.id);
    } else if (action === 'updateData') {
      result = updateTrackedRow(data);
    } else {
      throw new Error('Action không được hỗ trợ: ' + action);
    }

    return jsonOutput_({ ok: true, result: result });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Không tìm thấy bảng tính được liên kết với Apps Script.');
  return ss;
}

function getSheet_(sheetName) {
  const allowed = ['Luu_Tam', 'Theo_Doi'];
  if (allowed.indexOf(sheetName) === -1) throw new Error('Tên sheet không hợp lệ: ' + sheetName);
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Không tìm thấy sheet "' + sheetName + '". Hãy giữ nguyên tên sheet Luu_Tam và Theo_Doi.');
  return sheet;
}

function addDataToSheet(sheetName, rowData) {
  const sheet = getSheet_(sheetName);
  if (!Array.isArray(rowData) || rowData.length === 0) throw new Error('rowData phải là một mảng có dữ liệu.');
  sheet.appendRow(rowData);
  return true;
}

function deleteRow(sheetName, id) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function getAllData() {
  const ss = getSpreadsheet_();
  const tempSheet = ss.getSheetByName('Luu_Tam');
  const trackSheet = ss.getSheetByName('Theo_Doi');
  const tempRows = tempSheet && tempSheet.getLastRow() > 1
    ? tempSheet.getRange(2, 1, tempSheet.getLastRow() - 1, Math.max(7, tempSheet.getLastColumn())).getValues()
    : [];
  const trackRows = trackSheet && trackSheet.getLastRow() > 1
    ? trackSheet.getRange(2, 1, trackSheet.getLastRow() - 1, Math.max(7, trackSheet.getLastColumn())).getValues()
    : [];
  return {
    // The existing index.html renders object properties (item.name, item.link, etc.),
    // so convert the sheet rows to the same object shape expected by its UI.
    temp: tempRows.map(function (r) {
      return { id: r[0], name: r[1], link: r[2], dv: r[3], cn: r[4], total: r[5], rem: r[6] };
    }),
    track: trackRows.map(function (r) {
      return { id: r[0], name: r[1], link: r[2], dv: r[3], rem: r[4], status: r[5], note: r[6] };
    })
  };
}

function updateTrackedRow(data) {
  const sheet = getSheet_(data.sheetName || 'Theo_Doi');
  const rows = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.id)) {
      // Keep the existing Theo_Doi layout: id, name, link, dv, rem, status, note.
      if (data.rem !== undefined) sheet.getRange(i + 1, 5).setValue(data.rem);
      if (data.status !== undefined) sheet.getRange(i + 1, 6).setValue(data.status);
      if (data.note !== undefined) sheet.getRange(i + 1, 7).setValue(data.note);
      return true;
    }
  }
  return false;
}

// Retained helper for compatibility with any existing scripts that call it directly.
function updateCell(sheetName, id, colIndex, newValue) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i + 1, Number(colIndex) + 1).setValue(newValue);
      return true;
    }
  }
  return false;
}
