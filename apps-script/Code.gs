const SPREADSHEET_ID = "";

const SHEET_COLUMNS = {
  Settings: ["key", "value", "updatedAt"],
  Builds: ["id", "name", "devDueDate", "updateDate", "currentPhase", "createdAt", "updatedAt", "isArchived"],
  Members: ["id", "name", "part", "role", "initials", "isActive", "createdAt", "updatedAt"],
  Tickets: [
    "id",
    "buildId",
    "sourceUrl",
    "name",
    "ownerId",
    "supportOwnerIds",
    "workOwner",
    "status",
    "action",
    "memo",
    "lastStatusChangedAt",
    "lastCheckedAt",
    "createdAt",
    "updatedAt",
    "isArchived",
  ],
  Checkins: ["id", "ticketId", "memberId", "checkinType", "previousStatus", "newStatus", "previousAction", "newAction", "memo", "checkedAt"],
};

function doGet(event) {
  const params = (event && event.parameter) || {};
  const action = params.action || "getState";

  try {
    if (action === "health") return healthResponse(true);
    if (action === "schema") return jsonResponse({ ok: true, sheets: SHEET_COLUMNS }, params.callback);
    if (action === "getState") return jsonResponse({ ok: true, state: loadState() }, params.callback);
    return jsonResponse({ ok: false, message: "Unknown action" }, params.callback);
  } catch (error) {
    if (action === "health") return healthResponse(false, error.message);
    return jsonResponse({ ok: false, message: error.message }, params.callback);
  }
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const body = parseRequestBody(event);
    if (body.action === "initSheets") {
      ensureSheets();
      return jsonResponse({ ok: true });
    }

    if (body.action === "saveState") {
      saveState(body.state || {});
      return jsonResponse({ ok: true, state: loadState() });
    }

    return jsonResponse({ ok: false, message: "Unknown action" });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function parseRequestBody(event) {
  if (event.parameter && event.parameter.payload) return JSON.parse(event.parameter.payload);
  if (event.postData && event.postData.contents) return JSON.parse(event.postData.contents || "{}");
  return {};
}

function loadState() {
  ensureSheets();
  const settingsRows = readRows("Settings");
  const settings = settingsRows.reduce((result, row) => {
    result[row.key] = row.value;
    return result;
  }, {});

  return {
    schemaVersion: settings.schemaVersion || "1",
    currentBuildId: settings.currentBuildId || "",
    builds: readRows("Builds").map((row) => ({
      ...row,
      isArchived: toBoolean(row.isArchived),
    })),
    members: readRows("Members").map((row) => ({
      ...row,
      isActive: toBoolean(row.isActive),
    })),
    tickets: readRows("Tickets").map((row) => ({
      ...row,
      supportOwnerIds: splitIds(row.supportOwnerIds),
      isArchived: toBoolean(row.isArchived),
    })),
    checkins: readRows("Checkins"),
  };
}

function saveState(state) {
  ensureSheets();
  const now = new Date().toISOString();
  writeRows("Settings", [
    { key: "schemaVersion", value: "1", updatedAt: now },
    { key: "currentBuildId", value: state.currentBuildId || "", updatedAt: now },
  ]);
  writeRows("Builds", state.builds || []);
  writeRows("Members", state.members || []);
  writeRows(
    "Tickets",
    (state.tickets || []).map((ticket) => ({
      ...ticket,
      supportOwnerIds: joinIds(ticket.supportOwnerIds),
    })),
  );
  writeRows("Checkins", state.checkins || []);
}

function ensureSheets() {
  const spreadsheet = getSpreadsheet();
  Object.entries(SHEET_COLUMNS).forEach(([sheetName, columns]) => {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
    const headerRange = sheet.getRange(1, 1, 1, columns.length);
    const currentHeader = headerRange.getValues()[0];
    const needsHeader = columns.some((column, index) => currentHeader[index] !== column);
    if (needsHeader) {
      headerRange.setValues([columns]);
      sheet.setFrozenRows(1);
    }
  });
}

function readRows(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  const columns = SHEET_COLUMNS[sheetName];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet
    .getRange(2, 1, lastRow - 1, columns.length)
    .getValues()
    .filter((row) => row.some((value) => value !== ""))
    .map((values) =>
      columns.reduce((row, column, index) => {
        row[column] = normalizeCell(values[index]);
        return row;
      }, {}),
    );
}

function writeRows(sheetName, rows) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  const columns = SHEET_COLUMNS[sheetName];
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  if (!rows.length) return;

  const values = rows.map((row) => columns.map((column) => stringifyCell(row[column])));
  sheet.getRange(2, 1, values.length, columns.length).setValues(values);
}

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function normalizeCell(value) {
  if (value instanceof Date) return value.toISOString();
  return value === null || value === undefined ? "" : String(value);
}

function stringifyCell(value) {
  if (Array.isArray(value)) return joinIds(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return value === null || value === undefined ? "" : value;
}

function splitIds(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinIds(value) {
  return Array.isArray(value) ? value.join("|") : String(value || "");
}

function toBoolean(value) {
  return String(value).toUpperCase() === "TRUE";
}

function healthResponse(ok, message) {
  const sheetNames = Object.keys(SHEET_COLUMNS);
  const title = ok ? "연결 정상입니다" : "연결은 되었지만 확인이 필요합니다";
  const toneClass = ok ? "ok" : "warn";
  const checklist = ok
    ? [
        "Apps Script 실행 가능",
        "Google Sheet 접근 가능",
        "필요한 시트 확인됨",
      ]
    : [
        "Apps Script는 열렸습니다",
        "Google Sheet 접근 또는 시트 구성을 확인해 주세요",
      ];

  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>빌드 일정/진행 보드 연결 확인</title>
    <style>
      body {
        margin: 0;
        background: #f5f6f8;
        color: #17202a;
        font-family: "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif;
      }
      main {
        max-width: 720px;
        margin: 48px auto;
        padding: 0 20px;
      }
      .card {
        border: 1px solid #d9dee5;
        border-radius: 12px;
        background: #fff;
        padding: 28px;
        box-shadow: 0 16px 32px rgba(24, 35, 54, 0.08);
      }
      .badge {
        display: inline-flex;
        border-radius: 999px;
        padding: 6px 10px;
        font-weight: 800;
        font-size: 13px;
        margin-bottom: 14px;
      }
      .ok .badge {
        background: #eaf7f0;
        color: #11643f;
      }
      .warn .badge {
        background: #fff5e9;
        color: #8a4d13;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
      }
      p {
        margin: 0;
        color: #66717f;
        line-height: 1.6;
      }
      h2 {
        margin: 24px 0 10px;
        font-size: 17px;
      }
      ul {
        margin: 0;
        padding-left: 20px;
        line-height: 1.9;
      }
      .sheets {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .sheet {
        border: 1px solid #d9dee5;
        border-radius: 999px;
        padding: 6px 10px;
        background: #f0f3f5;
        font-size: 13px;
        font-weight: 800;
      }
      .message {
        border-radius: 8px;
        background: #fff5e9;
        color: #8a4d13;
        padding: 12px;
        margin-top: 16px;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="card ${toneClass}">
        <span class="badge">빌드 일정/진행 보드</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${ok ? "이 창을 닫고 보드에서 연결 확인 또는 시트에 저장을 진행하세요." : "아래 내용을 확인한 뒤 다시 시도해 주세요."}</p>

        <h2>확인된 항목</h2>
        <ul>${checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>

        <h2>필요한 시트</h2>
        <div class="sheets">${sheetNames.map((name) => `<span class="sheet">${escapeHtml(name)}</span>`).join("")}</div>

        ${message ? `<div class="message">${escapeHtml(message)}</div>` : ""}
      </section>
    </main>
  </body>
</html>`;

  return HtmlService.createHtmlOutput(html).setTitle("빌드 일정/진행 보드 연결 확인");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(payload, callback) {
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(payload)});`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
