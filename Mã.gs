function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getAll') {
    return ContentService
      .createTextOutput(JSON.stringify(getAllData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('DINO MOBILE SYSTEM')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action;

    if (action === 'addData') {
      addDataToSheet(data.sheetName, data.rowData || []);
    } else if (action === 'deleteData') {
      deleteRow(data.sheetName, data.id);
    } else if (action === 'updateData') {
      updateTrackData(data.sheetName, data.id, data.rowData || []);
    } else if (action === 'updateTrackData') {
      updateTrackData(data.sheetName, data.id, data.rowData || []);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addDataToSheet(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  sheet.appendRow(rowData);
  return true;
}

function deleteRow(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    temp: getSheetRows(ss, 'Luu_Tam'),
    track: getSheetRows(ss, 'Theo_Doi'),
    saleTrack: getSheetRows(ss, 'Theo_Doi_Ban')
  };
}

function getSheetRows(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (!values || values.length === 0) return [];

  const firstCell = values[0][0];
  const firstCellText = String(firstCell || '').trim().toLowerCase();
  const hasHeader = firstCellText === 'id' || firstCellText === 'mã' || firstCellText === 'ma' || firstCellText === 'stt';

  if (hasHeader) {
    return values.slice(1);
  }

  return values;
}

function updateTrackData(sheetName, id, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      if (rowData && rowData.length) {
        sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      }
      return true;
    }
  }
  return false;
}
