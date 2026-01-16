function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle("DINO MOBILE SYSTEM")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Hàm lưu dữ liệu tổng quát
function addDataToSheet(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  sheet.appendRow(rowData);
  return true;
}

// Hàm xóa dữ liệu khi hoàn thành đơn hoặc xóa bảng tạm
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

// Hàm lấy toàn bộ dữ liệu để hiển thị khi load lại trang
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    temp: ss.getSheetByName('Luu_Tam').getDataRange().getValues().slice(1),
    track: ss.getSheetByName('Theo_Doi').getDataRange().getValues().slice(1)
  };
}

// Hàm cập nhật ghi chú hoặc trạng thái
function updateCell(sheetName, id, colIndex, newValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.getRange(i + 1, colIndex + 1).setValue(newValue);
      return true;
    }
  }
}