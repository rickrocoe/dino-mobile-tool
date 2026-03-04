diff --git a/Mã.gs b/Mã.gs
index 47182b9e46d836ac6c1869c46f6776bb47142bca..02d8ad2a643fa73fb4fcc3b94bd5dfd7588d959f 100644
--- a/Mã.gs
+++ b/Mã.gs
@@ -1,51 +1,92 @@
-function doGet() {
-  return HtmlService.createTemplateFromFile('index')
-    .evaluate()
-    .setTitle("DINO MOBILE SYSTEM")
-    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
-    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
-}
-
-// Hàm lưu dữ liệu tổng quát
-function addDataToSheet(sheetName, rowData) {
-  const ss = SpreadsheetApp.getActiveSpreadsheet();
-  let sheet = ss.getSheetByName(sheetName);
-  sheet.appendRow(rowData);
-  return true;
-}
-
-// Hàm xóa dữ liệu khi hoàn thành đơn hoặc xóa bảng tạm
-function deleteRow(sheetName, id) {
-  const ss = SpreadsheetApp.getActiveSpreadsheet();
-  const sheet = ss.getSheetByName(sheetName);
-  const data = sheet.getDataRange().getValues();
-  for (let i = 1; i < data.length; i++) {
-    if (data[i][0].toString() === id.toString()) {
-      sheet.deleteRow(i + 1);
-      return true;
-    }
-  }
-  return false;
-}
-
-// Hàm lấy toàn bộ dữ liệu để hiển thị khi load lại trang
-function getAllData() {
-  const ss = SpreadsheetApp.getActiveSpreadsheet();
-  return {
-    temp: ss.getSheetByName('Luu_Tam').getDataRange().getValues().slice(1),
-    track: ss.getSheetByName('Theo_Doi').getDataRange().getValues().slice(1)
-  };
-}
-
-// Hàm cập nhật ghi chú hoặc trạng thái
-function updateCell(sheetName, id, colIndex, newValue) {
-  const ss = SpreadsheetApp.getActiveSpreadsheet();
-  const sheet = ss.getSheetByName(sheetName);
-  const data = sheet.getDataRange().getValues();
-  for (let i = 1; i < data.length; i++) {
-    if (data[i][0].toString() === id.toString()) {
-      sheet.getRange(i + 1, colIndex + 1).setValue(newValue);
-      return true;
-    }
-  }
-}
\ No newline at end of file
+function doGet(e) {
+  if (e && e.parameter && e.parameter.action === 'getAll') {
+    return ContentService
+      .createTextOutput(JSON.stringify(getAllData()))
+      .setMimeType(ContentService.MimeType.JSON);
+  }
+
+  return HtmlService.createTemplateFromFile('index')
+    .evaluate()
+    .setTitle('DINO MOBILE SYSTEM')
+    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
+    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
+}
+
+function doPost(e) {
+  try {
+    const data = JSON.parse(e.postData.contents || '{}');
+    const action = data.action;
+
+    if (action === 'addData') {
+      addDataToSheet(data.sheetName, data.rowData || []);
+    } else if (action === 'deleteData') {
+      deleteRow(data.sheetName, data.id);
+    } else if (action === 'updateData') {
+      updateTrackData(data.sheetName, data.id, data.rowData || []);
+    } else if (action === 'updateTrackData') {
+      updateTrackData(data.sheetName, data.id, data.rowData || []);
+    }
+
+    return ContentService
+      .createTextOutput(JSON.stringify({ success: true }))
+      .setMimeType(ContentService.MimeType.JSON);
+  } catch (error) {
+    return ContentService
+      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
+      .setMimeType(ContentService.MimeType.JSON);
+  }
+}
+
+function addDataToSheet(sheetName, rowData) {
+  const ss = SpreadsheetApp.getActiveSpreadsheet();
+  const sheet = ss.getSheetByName(sheetName);
+  sheet.appendRow(rowData);
+  return true;
+}
+
+function deleteRow(sheetName, id) {
+  const ss = SpreadsheetApp.getActiveSpreadsheet();
+  const sheet = ss.getSheetByName(sheetName);
+  const data = sheet.getDataRange().getValues();
+  for (let i = 1; i < data.length; i++) {
+    if (data[i][0].toString() === id.toString()) {
+      sheet.deleteRow(i + 1);
+      return true;
+    }
+  }
+  return false;
+}
+
+function getAllData() {
+  const ss = SpreadsheetApp.getActiveSpreadsheet();
+  return {
+    temp: getSheetRows(ss, 'Luu_Tam'),
+    track: getSheetRows(ss, 'Theo_Doi'),
+    saleTrack: getSheetRows(ss, 'Theo_Doi_Ban')
+  };
+}
+
+function getSheetRows(ss, sheetName) {
+  const sheet = ss.getSheetByName(sheetName);
+  if (!sheet) return [];
+  const lastRow = sheet.getLastRow();
+  const lastCol = sheet.getLastColumn();
+  if (lastRow < 2 || lastCol < 1) return [];
+  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
+}
+
+function updateTrackData(sheetName, id, rowData) {
+  const ss = SpreadsheetApp.getActiveSpreadsheet();
+  const sheet = ss.getSheetByName(sheetName);
+  const data = sheet.getDataRange().getValues();
+
+  for (let i = 1; i < data.length; i++) {
+    if (data[i][0].toString() === id.toString()) {
+      if (rowData && rowData.length) {
+        sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
+      }
+      return true;
+    }
+  }
+  return false;
+}
