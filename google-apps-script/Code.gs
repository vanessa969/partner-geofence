// Partner Geofence Submissions - Google Apps Script
// Deploy as Web App: Execute as "Me", Access: "Anyone"

const SHEET_ID = "YOUR_SPREADSHEET_ID_HERE";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    sheet.appendRow([
      data.businessName || "",
      data.address || "",
      data.businessType || "",
      data.contactEmail || "",
      data.centerLat || "",
      data.centerLng || "",
      data.position || "",
      data.pointCount || "",
      data.boundary || "",
      data.submittedAt || new Date().toISOString(),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this once to test writing to the sheet
function testWrite() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  sheet.appendRow([
    "Test Business", "123 Test St", "Dog Training Facility",
    "test@test.com", "40.123", "-83.456", "(-83.456,40.123)",
    "5", '{"type":"Polygon","coordinates":[]}', new Date().toISOString()
  ]);
  Logger.log("Test row added!");
}

// Run this once to set up headers
function setupHeaders() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const headers = [
    "Business Name",
    "Address",
    "Business Type",
    "Contact Email",
    "Center Lat",
    "Center Lng",
    "Position",
    "Point Count",
    "Boundary (GeoJSON)",
    "Submitted At"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  Logger.log("Headers set up!");
}
