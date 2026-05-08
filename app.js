const STORAGE_KEY = "build-board-prototype-v9";
const SYNC_CONFIG_KEY = "build-board-sync-config-v1";

const STATUS_OPTIONS = ["정상", "이슈 있음", "완료 확인 대기", "완료"];
const ACTION_OPTIONS = [
  "없음",
  "개발 확인 필요",
  "리더 확인 요청",
  "QA/빌드 확인 필요",
  "아트 폴리싱 진행중",
  "전투 밸런스 확인 필요",
  "보상 확정 필요",
];
const MANAGEMENT_PART = "관리";
const PART_OPTIONS = ["시스템", "밸런스", "설정", "콘텐츠", "라이브", "시나리오", MANAGEMENT_PART];
const WORK_PART_OPTIONS = PART_OPTIONS.filter((part) => part !== MANAGEMENT_PART);
const PART_COLOR_MAP = {
  시스템: "blue",
  밸런스: "violet",
  설정: "gray",
  콘텐츠: "orange",
  라이브: "green",
  시나리오: "teal",
  [MANAGEMENT_PART]: "black",
};
const PHASE_OPTIONS = ["개발중", "개발 완료", "업데이트 완료"];
const DEFAULT_LEADER_FILTERS = {
  owner: "전체",
  part: "전체",
  status: "전체",
  action: "전체",
  quick: "전체",
};
const DEFAULT_SYNC_CONFIG = {
  mode: "sheet",
  webAppUrl: "https://script.google.com/a/macros/nm-fc.com/s/AKfycbzF2zr9Gvc7Ty538pqP83EuJbGFPfD5fMPfKiRkY2RbTWslS12cJhf-pydxJbcgn6aOhQ/exec",
  status: "configured",
  message: "",
  lastSyncedAt: "",
};
const memberNameCollator = new Intl.Collator("ko-KR", { sensitivity: "base" });

const sampleData = {
  currentUserId: "",
  currentBuildId: "",
  theme: "light",
  route: "myTickets",
  myStatusFilter: "전체",
  leaderFilters: { ...DEFAULT_LEADER_FILTERS },
  builds: [],
  members: [],
  tickets: [],
  checkins: [],
};

function createSampleMembers() {
  const seeds = [
    ["M001", "민수", "시스템", "MS"],
    ["M002", "지아", "시스템", "JA"],
    ["M003", "태준", "시스템", "TJ"],
    ["M004", "유진", "시스템", "YJ"],
    ["M005", "현우", "시스템", "HW"],
    ["M006", "서연", "밸런스", "SY"],
    ["M007", "도윤", "밸런스", "DY"],
    ["M008", "예린", "밸런스", "YR"],
    ["M009", "준호", "밸런스", "JH"],
    ["M010", "채원", "밸런스", "CW"],
    ["M011", "하린", "설정", "HR"],
    ["M012", "수빈", "설정", "SB"],
    ["M013", "지훈", "설정", "JH"],
    ["M014", "나은", "설정", "NE"],
    ["M015", "도현", "콘텐츠", "DH"],
    ["M016", "가은", "콘텐츠", "GE"],
    ["M017", "시우", "콘텐츠", "SW"],
    ["M018", "유나", "콘텐츠", "YN"],
    ["M019", "정민", "콘텐츠", "JM"],
    ["M020", "지현", "라이브", "JH"],
    ["M021", "태희", "라이브", "TH"],
    ["M022", "서준", "라이브", "SJ"],
    ["M023", "다인", "라이브", "DI"],
    ["M024", "은호", "라이브", "EH"],
    ["M025", "은서", "시나리오", "ES"],
    ["M026", "하윤", "시나리오", "HY"],
    ["M027", "재윤", "시나리오", "JY"],
    ["M028", "소율", "시나리오", "SY"],
    ["M029", "성지훈", MANAGEMENT_PART, "SH"],
    ["M030", "윤서", MANAGEMENT_PART, "YS"],
  ];

  return seeds.map(([id, name, part, initials]) => ({
    id,
    name,
    part,
    role: roleForPart(part),
    initials,
    color: colorForPart(part),
    isActive: true,
  }));
}

function createSampleTickets() {
  const names = [
    "신규 이벤트 미션",
    "출석 보상 개편",
    "신규 성장 패키지",
    "전투 패스 시즌 갱신",
    "복귀 유저 캠페인",
    "신규 보스 밸런스",
    "업적 시스템 개선",
    "시나리오 컷신 검수",
    "상점 추천 상품 정리",
    "길드 협동전 보상",
    "초보자 동선 개선",
    "장비 강화 비용 조정",
    "월드맵 퀘스트 추가",
    "랭킹전 매칭 룰 보정",
    "신규 코스튬 노출",
    "이벤트 교환소 구성",
    "메인 로비 배너 교체",
    "튜토리얼 스킵 정책",
    "푸시 알림 문구 정리",
    "던전 주간 제한 리셋",
    "레이드 보스 패턴 수정",
    "캐릭터 성장 가이드",
    "스토리 챕터 12 검수",
    "상점 가격표 정리",
    "시즌 미션 UI 문구",
    "아레나 점수 보정",
    "신규 패키지 상품",
    "라이브 쿠폰 지급",
    "이벤트 알림 팝업",
    "보상 수령 연출 확인",
    "장비 세트 효과 설명",
    "월간 로그인 보너스",
    "신규 지역 해금 조건",
    "전투 튜닝 2차 확인",
    "콘텐츠 오픈 스케줄",
    "시나리오 대사 윤문",
    "콜라보 이벤트 배너",
    "길드 상점 상품 교체",
    "업데이트 공지 문구",
    "QA 빌드 확인 항목",
  ];
  const ownerIds = [
    "M001",
    "M006",
    "M011",
    "M015",
    "M020",
    "M025",
    "M002",
    "M007",
    "M012",
    "M016",
    "M021",
    "M026",
    "M003",
    "M008",
    "M013",
    "M017",
    "M022",
    "M027",
    "M004",
    "M009",
    "M014",
    "M018",
    "M023",
    "M028",
    "M005",
    "M010",
    "M019",
    "M024",
  ];
  const supportOwnerPool = ["M006", "M011", "M015", "M020", "M025", "M001", "M007", "M012", "M016", "M021", "M026", "M002"];
  const statusPattern = ["정상", "이슈 있음", "정상", "완료 확인 대기", "정상", "완료", "이슈 있음", "정상", "완료 확인 대기", "정상"];
  const issueActions = ["개발 확인 필요", "리더 확인 요청", "전투 밸런스 확인 필요", "보상 확정 필요", "아트 폴리싱 진행중"];
  const normalActions = ["없음", "없음", "아트 폴리싱 진행중", "없음", "보상 확정 필요"];
  const workOwners = [
    "서버 김OO, 클라 박OO",
    "클라 이OO, UI팀",
    "아트팀, 클라 최OO",
    "서버 박OO, QA",
    "운영팀, 데이터팀",
    "전투 기획, 서버 한OO",
  ];
  const memoByAction = {
    "없음": "",
    "개발 확인 필요": "구현 결과가 기획 의도와 다른 부분이 있어 개발 확인이 필요합니다.",
    "리더 확인 요청": "범위와 우선순위 판단이 필요해 리더 확인을 요청합니다.",
    "QA/빌드 확인 필요": "빌드 반영 후 실제 동작과 보상 지급 흐름을 확인해야 합니다.",
    "아트 폴리싱 진행중": "최종 리소스 톤과 연출 느낌을 맞추는 중입니다.",
    "전투 밸런스 확인 필요": "난이도와 수치 체감 확인 후 조정안 확정이 필요합니다.",
    "보상 확정 필요": "보상 구성과 수량이 최종 확정 전입니다.",
  };

  return names.map((name, index) => {
    const number = index + 1;
    const status = statusPattern[index % statusPattern.length];
    const ownerId = ownerIds[index % ownerIds.length];
    const supportCursor = Math.floor(index / 4);
    const supportOwnerIds =
      index % 10 === 0
        ? [supportOwnerPool[supportCursor % supportOwnerPool.length], supportOwnerPool[(supportCursor + 5) % supportOwnerPool.length]]
        : index % 4 === 0
          ? [supportOwnerPool[supportCursor % supportOwnerPool.length]]
          : [];
    const action =
      status === "완료"
        ? "없음"
        : status === "완료 확인 대기"
          ? "QA/빌드 확인 필요"
          : status === "이슈 있음"
            ? issueActions[index % issueActions.length]
            : normalActions[index % normalActions.length];
    const checkedDay = index % 9 === 0 ? "2026-04-26" : index % 5 === 0 ? "2026-04-28" : index % 4 === 0 ? "2026-04-29" : "2026-04-30";
    const changedDay = status === "정상" ? "2026-04-25" : index % 2 === 0 ? "2026-04-28" : "2026-04-29";

    return {
      id: `T${String(number).padStart(3, "0")}`,
      buildId: "B001",
      sourceUrl: `https://example.com/source/test-ticket-${String(number).padStart(3, "0")}`,
      name,
      ownerId,
      supportOwnerIds: supportOwnerIds.filter((id) => id !== ownerId),
      workOwner: workOwners[index % workOwners.length],
      status,
      action,
      memo: memoByAction[action],
      lastStatusChangedAt: `${changedDay}T${String(10 + (index % 8)).padStart(2, "0")}:20:00+09:00`,
      lastCheckedAt: `${checkedDay}T17:${String(10 + (index % 45)).padStart(2, "0")}:00+09:00`,
      createdAt: `2026-04-${String(15 + (index % 10)).padStart(2, "0")}T14:00:00+09:00`,
      updatedAt: `${checkedDay}T17:${String(10 + (index % 45)).padStart(2, "0")}:00+09:00`,
      isArchived: false,
    };
  });
}

const hasStoredLocalState = Boolean(localStorage.getItem(STORAGE_KEY));
let state = normalizeState(loadState());
let memberInlineNotice = null;
let syncConfig = normalizeSyncConfig(loadSyncConfig());
let isApplyingRemoteState = false;
let remoteSaveTimer = null;
let lastSharedSignature = "";
let hasPendingSharedSave = false;

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(sampleData);

  try {
    return JSON.parse(stored);
  } catch {
    return structuredClone(sampleData);
  }
}

function loadSyncConfig() {
  const stored = localStorage.getItem(SYNC_CONFIG_KEY);
  if (!stored) return structuredClone(DEFAULT_SYNC_CONFIG);

  try {
    return JSON.parse(stored);
  } catch {
    return structuredClone(DEFAULT_SYNC_CONFIG);
  }
}

function normalizeSyncConfig(config) {
  const normalized = {
    ...DEFAULT_SYNC_CONFIG,
    ...(config || {}),
  };
  normalized.mode = normalized.mode === "sheet" ? "sheet" : "local";
  normalized.webAppUrl = String(normalized.webAppUrl || "").trim();
  return normalized;
}

function saveSyncConfig() {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(syncConfig));
}

function normalizeState(data) {
  data.leaderFilters = {
    ...DEFAULT_LEADER_FILTERS,
    ...(data.leaderFilters || {}),
  };
  data.builds = Array.isArray(data.builds) ? data.builds : [];
  data.members = Array.isArray(data.members) ? data.members : [];
  data.tickets = Array.isArray(data.tickets) ? data.tickets : [];
  data.checkins = Array.isArray(data.checkins) ? data.checkins : [];
  data.currentBuildId = data.currentBuildId || data.builds[0]?.id || "";
  data.currentUserId = data.currentUserId || data.members[0]?.id || "";
  data.theme = data.theme === "dark" ? "dark" : "light";
  data.route = data.route || "myTickets";
  data.myStatusFilter = data.myStatusFilter || "전체";
  data.builds.forEach((build) => {
    build.isArchived = toBooleanValue(build.isArchived);
  });
  if (Array.isArray(data.members)) {
    data.members.forEach((member) => {
      member.role = roleForPart(member.part);
      member.color = colorForPart(member.part);
      member.isActive = member.isActive !== false && String(member.isActive).toUpperCase() !== "FALSE";
    });
  }
  data.tickets.forEach((ticket) => {
    ticket.supportOwnerIds = Array.isArray(ticket.supportOwnerIds) ? ticket.supportOwnerIds : splitIdList(ticket.supportOwnerIds);
    ticket.isArchived = toBooleanValue(ticket.isArchived);
    const p = Number(ticket.progress);
    ticket.progress = Number.isFinite(p) ? Math.max(0, Math.min(100, Math.round(p))) : 0;
  });
  return data;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (hasPendingSharedSave) queueRemoteSaveIfNeeded();
}

function getSharedState() {
  return {
    currentBuildId: state.currentBuildId,
    builds: state.builds.map((build) => ({
      id: build.id,
      name: build.name,
      devDueDate: build.devDueDate,
      updateDate: build.updateDate || "",
      currentPhase: build.currentPhase,
      createdAt: build.createdAt || "",
      updatedAt: build.updatedAt || "",
      isArchived: Boolean(build.isArchived),
    })),
    members: state.members.map((member) => ({
      id: member.id,
      name: member.name,
      part: member.part,
      role: roleForPart(member.part),
      initials: member.initials,
      isActive: member.isActive !== false,
      createdAt: member.createdAt || "",
      updatedAt: member.updatedAt || "",
    })),
    tickets: state.tickets.map((ticket) => ({
      id: ticket.id,
      buildId: ticket.buildId,
      sourceUrl: ticket.sourceUrl,
      name: ticket.name,
      ownerId: ticket.ownerId,
      supportOwnerIds: ticket.supportOwnerIds || [],
      workOwner: ticket.workOwner,
      progress: ticket.progress || 0,
      status: ticket.status,
      action: ticket.action,
      memo: ticket.memo || "",
      lastStatusChangedAt: ticket.lastStatusChangedAt || "",
      lastCheckedAt: ticket.lastCheckedAt || "",
      createdAt: ticket.createdAt || "",
      updatedAt: ticket.updatedAt || "",
      isArchived: Boolean(ticket.isArchived),
    })),
    checkins: state.checkins.map((checkin) => ({
      id: checkin.id,
      ticketId: checkin.ticketId,
      memberId: checkin.memberId,
      checkinType: checkin.checkinType,
      previousStatus: checkin.previousStatus,
      newStatus: checkin.newStatus,
      previousAction: checkin.previousAction,
      newAction: checkin.newAction,
      memo: checkin.memo || "",
      checkedAt: checkin.checkedAt,
    })),
  };
}

function sharedStateSignature() {
  return JSON.stringify(getSharedState());
}

function applySharedState(remoteState) {
  const personalState = {
    currentUserId: state.currentUserId,
    theme: state.theme,
    route: state.route,
    myStatusFilter: state.myStatusFilter,
    leaderFilters: { ...state.leaderFilters },
  };
  const nextState = normalizeState({
    ...state,
    ...personalState,
    currentBuildId: remoteState.currentBuildId || state.currentBuildId,
    builds: Array.isArray(remoteState.builds) ? remoteState.builds : state.builds,
    members: Array.isArray(remoteState.members) ? remoteState.members : state.members,
    tickets: Array.isArray(remoteState.tickets) ? remoteState.tickets : state.tickets,
    checkins: Array.isArray(remoteState.checkins) ? remoteState.checkins : state.checkins,
  });

  if (!nextState.builds.some((build) => build.id === nextState.currentBuildId && !build.isArchived)) {
    nextState.currentBuildId = nextState.builds.find((build) => !build.isArchived)?.id || nextState.builds[0]?.id || "";
  }
  if (!nextState.members.some((member) => member.id === nextState.currentUserId && member.isActive)) {
    nextState.currentUserId = nextState.members.find((member) => member.isActive)?.id || "";
  }

  state = nextState;
  lastSharedSignature = sharedStateSignature();
}

function rowTimestamp(row) {
  const value = row?.updatedAt || row?.checkedAt || row?.createdAt || "";
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function mergeRowsByRecentId(remoteRows = [], localRows = []) {
  const merged = new Map();
  remoteRows.forEach((row) => {
    if (row?.id) merged.set(row.id, row);
  });
  localRows.forEach((row) => {
    if (!row?.id) return;
    const existing = merged.get(row.id);
    if (!existing || rowTimestamp(row) >= rowTimestamp(existing)) {
      merged.set(row.id, row);
    }
  });
  return [...merged.values()];
}

function mergeCheckins(remoteRows = [], localRows = []) {
  const merged = new Map();
  [...remoteRows, ...localRows].forEach((row) => {
    if (row?.id && !merged.has(row.id)) merged.set(row.id, row);
  });
  return [...merged.values()].sort((a, b) => rowTimestamp(a) - rowTimestamp(b));
}

function mergeSharedStates(localState, remoteState = {}) {
  const merged = {
    currentBuildId: remoteState.currentBuildId || localState.currentBuildId || "",
    builds: mergeRowsByRecentId(remoteState.builds || [], localState.builds || []),
    members: mergeRowsByRecentId(remoteState.members || [], localState.members || []),
    tickets: mergeRowsByRecentId(remoteState.tickets || [], localState.tickets || []),
    checkins: mergeCheckins(remoteState.checkins || [], localState.checkins || []),
  };

  if (!merged.builds.some((build) => build.id === merged.currentBuildId && !toBooleanValue(build.isArchived))) {
    merged.currentBuildId = merged.builds.find((build) => !toBooleanValue(build.isArchived))?.id || merged.builds[0]?.id || "";
  }

  return merged;
}

function splitIdList(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toBooleanValue(value) {
  return value === true || String(value).toUpperCase() === "TRUE";
}

function queueRemoteSaveIfNeeded() {
  if (isApplyingRemoteState || syncConfig.mode !== "sheet" || !syncConfig.webAppUrl) return;
  const nextSignature = sharedStateSignature();
  if (nextSignature === lastSharedSignature) return;

  lastSharedSignature = nextSignature;
  hasPendingSharedSave = false;
  setSyncStatus("saving", "변경 내용을 Google Sheet에 저장 중입니다.");
  window.clearTimeout(remoteSaveTimer);
  remoteSaveTimer = window.setTimeout(() => {
    pushSharedStateToSheet({ silent: true });
  }, 700);
}

function currentBuild() {
  const build = state.builds.find((item) => item.id === state.currentBuildId && !item.isArchived);
  return build || state.builds.find((item) => !item.isArchived) || state.builds[0];
}

function currentUser() {
  return getMember(state.currentUserId);
}

function currentUserIsLeader() {
  return currentUser()?.role === "리더";
}

function roleForPart(part) {
  return part === MANAGEMENT_PART ? "리더" : "기획자";
}

function colorForPart(part) {
  return PART_COLOR_MAP[part] || "gray";
}

function ensureRouteForRole() {
  state.route = currentUserIsLeader() ? "leader" : "myTickets";
}

function nowIso() {
  return new Date().toISOString();
}

function toDate(value) {
  return value ? new Date(value) : null;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysBetween(from, to) {
  const ms = startOfDay(to) - startOfDay(from);
  return Math.floor(ms / 86400000);
}

function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "-";

  const now = new Date();
  const diff = daysBetween(date, now);
  const time = date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  if (diff === 0) return `오늘 ${time}`;
  if (diff === 1) return `어제 ${time}`;
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) + ` ${time}`;
}

function formatDateOnly(value) {
  const date = toDate(value);
  if (!date) return "-";
  const now = new Date();
  const diff = daysBetween(date, now);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

function getDevDueText() {
  const diff = getDevDueDelta();
  if (diff === null) return "-";
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";
  return `D+${Math.abs(diff)}`;
}

function getDevDueDelta() {
  const build = currentBuild();
  if (!build?.devDueDate) return null;
  const dateStr = String(build.devDueDate).trim().slice(0, 10);
  const due = toDate(`${dateStr}T23:59:59`);
  if (!due || isNaN(due.getTime())) return null;
  const now = new Date();
  return Math.ceil((startOfDay(due) - startOfDay(now)) / 86400000);
}

function slug(value) {
  return String(value).replace(/\s+/g, "-").replace(/\//g, "-");
}

function getMember(id) {
  return state.members.find((member) => member.id === id);
}

function activeMembers() {
  return state.members.filter((member) => member.isActive);
}

function activeWorkMembers() {
  return activeMembers().filter((member) => member.part !== MANAGEMENT_PART);
}

function sortedMembers(members) {
  return [...members].sort((a, b) => {
    const partRankA = PART_OPTIONS.indexOf(a.part);
    const partRankB = PART_OPTIONS.indexOf(b.part);
    const safeRankA = partRankA === -1 ? PART_OPTIONS.length : partRankA;
    const safeRankB = partRankB === -1 ? PART_OPTIONS.length : partRankB;
    return safeRankA - safeRankB || memberNameCollator.compare(a.name, b.name);
  });
}

function sortedActiveMembers() {
  return sortedMembers(activeMembers());
}

function sortedActiveWorkMembers() {
  return sortedMembers(activeWorkMembers());
}

function activeTickets() {
  const build = currentBuild();
  if (!build) return [];
  return state.tickets.filter((ticket) => !ticket.isArchived && ticket.buildId === build.id);
}

function ownerTickets(ownerId = state.currentUserId) {
  return activeTickets().filter((ticket) => ticket.ownerId === ownerId || ticket.supportOwnerIds?.includes(ownerId));
}

function isStale(ticket) {
  const checked = toDate(ticket.lastCheckedAt);
  if (!checked || ticket.status === "완료") return false;
  return daysBetween(checked, new Date()) >= 2;
}

function isCheckedToday(ticket) {
  const checked = toDate(ticket.lastCheckedAt);
  return checked ? daysBetween(checked, new Date()) === 0 : false;
}

function needsTodayCheck(ticket) {
  if (ticket.status === "완료" || isCheckedToday(ticket)) return false;
  return ticket.status === "이슈 있음" || ticket.status === "완료 확인 대기" || isStale(ticket);
}

function recommendedActionForStatus(status) {
  if (status === "이슈 있음") return "개발 확인 필요";
  if (status === "완료 확인 대기") return "QA/빌드 확인 필요";
  return "없음";
}

function recommendationTextForStatus(status) {
  if (status === "이슈 있음") return "추천: 개발 확인 필요. 이슈 종류에 따라 리더 확인, 보상, 밸런스 등으로 바꿔도 됩니다.";
  if (status === "완료 확인 대기") return "추천: QA/빌드 확인 필요. 실제 빌드나 QA에서 기획 의도대로 동작하는지 확인하는 단계입니다.";
  if (status === "완료") return "추천: 없음. 이번 단계에서 추가로 챙길 내용이 없을 때 사용합니다.";
  return "추천: 없음. 흐름이 정상이고 별도 요청이 없을 때 사용합니다.";
}

function statusBadgeClass(status) {
  if (status === "정상") return "normal";
  if (status === "이슈 있음") return "issue";
  if (status === "완료 확인 대기") return "waiting";
  return "done";
}

function actionBadgeClass(action) {
  if (action === "없음") return "action-none";
  if (action === "리더 확인 요청") return "action-leader";
  if (action === "개발 확인 필요") return "action-dev";
  if (action === "QA/빌드 확인 필요") return "action-qa";
  if (action === "아트 폴리싱 진행중") return "action-art";
  if (action === "전투 밸런스 확인 필요") return "action-balance";
  if (action === "보상 확정 필요") return "action-reward";
  return "action-default";
}

function sortTickets(tickets) {
  const rank = (ticket) => {
    if (ticket.action === "리더 확인 요청") return 1;
    if (ticket.status === "이슈 있음") return 2;
    if (isStale(ticket)) return 3;
    if (ticket.status === "완료 확인 대기") return 4;
    if (ticket.status === "정상") return 5;
    return 6;
  };
  return [...tickets].sort((a, b) => rank(a) - rank(b) || new Date(b.updatedAt) - new Date(a.updatedAt));
}

function optionList(options, selected = "") {
  return options.map((option) => `<option ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildSheetUrl(action, params = {}) {
  const baseUrl = syncConfig.webAppUrl.trim();
  const query = new URLSearchParams({ action, ...params });
  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${query.toString()}`;
}

function sheetJsonpRequest(action) {
  if (!syncConfig.webAppUrl) return Promise.reject(new Error("Apps Script URL이 비어 있습니다."));

  return new Promise((resolve, reject) => {
    const callbackName = `__buildBoardSheetCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheet 응답 시간이 초과되었습니다."));
    }, 20000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      if (!payload?.ok) {
        reject(new Error(payload?.message || "Google Sheet 요청에 실패했습니다."));
        return;
      }
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Apps Script URL을 불러오지 못했습니다. Web App URL이 /exec로 끝나는지, 현재 브라우저가 회사 Google 계정으로 접근 가능한지 확인해 주세요."));
    };
    script.src = buildSheetUrl(action, { callback: callbackName });
    document.body.appendChild(script);
  });
}

function postSheetPayload(payload) {
  if (!syncConfig.webAppUrl) return Promise.reject(new Error("Apps Script URL이 비어 있습니다."));

  return new Promise((resolve, reject) => {
    const frameName = `sheetPostFrame_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const iframe = document.createElement("iframe");
    const form = document.createElement("form");
    const actionInput = document.createElement("input");
    const payloadInput = document.createElement("input");
    let submitted = false;
    let resolved = false;
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheet 저장 응답 시간이 초과되었습니다."));
    }, 15000);

    function cleanup() {
      if (resolved) return;
      resolved = true;
      window.clearTimeout(timeout);
      form.remove();
      iframe.remove();
    }

    function finish() {
      if (resolved) return;
      cleanup();
      resolve();
    }

    iframe.name = frameName;
    iframe.hidden = true;
    iframe.addEventListener("load", () => {
      if (!submitted) return;
      window.setTimeout(finish, 250);
    });

    form.method = "POST";
    form.action = syncConfig.webAppUrl;
    form.target = frameName;
    form.hidden = true;

    actionInput.type = "hidden";
    actionInput.name = "action";
    actionInput.value = payload.action || "";

    payloadInput.type = "hidden";
    payloadInput.name = "payload";
    payloadInput.value = JSON.stringify(payload);

    form.append(actionInput, payloadInput);
    document.body.append(iframe, form);
    window.setTimeout(() => {
      submitted = true;
      form.submit();
      window.setTimeout(finish, 4000);
    }, 50);
  });
}

function formatSyncTime(value) {
  return value ? formatDateTime(value) : "";
}

function setSyncStatus(status, message = "", updateSyncedAt = false) {
  syncConfig.status = status;
  syncConfig.message = message;
  if (updateSyncedAt) syncConfig.lastSyncedAt = nowIso();
  saveSyncConfig();
  renderSyncStatus();
}

function renderSyncStatus() {
  const syncModeLabel = document.getElementById("syncModeLabel");
  const syncDot = document.getElementById("syncDot");
  const storageMode = document.getElementById("storageMode");
  const sheetWebAppUrl = document.getElementById("sheetWebAppUrl");
  const statusCard = document.getElementById("syncStatusCard");
  const statusTitle = document.getElementById("syncStatusTitle");
  const statusDescription = document.getElementById("syncStatusDescription");
  if (!syncModeLabel || !syncDot) return;

  const isSheet = syncConfig.mode === "sheet";
  const status = isSheet ? syncConfig.status : "local";
  const mainSyncButtons = ["loadSheetStateMain", "pushLocalStateMain"].map((id) => document.getElementById(id)).filter(Boolean);
  const canUseMainSync = isSheet && Boolean(syncConfig.webAppUrl) && status !== "saving";
  syncModeLabel.textContent = isSheet ? (status === "error" ? "연결 오류" : status === "saving" ? "시트 저장 중" : "시트 연결") : "브라우저 저장";
  syncDot.className = `sync-dot ${status}`;
  mainSyncButtons.forEach((button) => {
    button.disabled = !canUseMainSync;
    button.title = canUseMainSync ? "" : "데이터 연결에서 Google Sheet를 먼저 설정해 주세요.";
  });

  if (storageMode) storageMode.value = syncConfig.mode;
  if (sheetWebAppUrl && document.activeElement !== sheetWebAppUrl) sheetWebAppUrl.value = syncConfig.webAppUrl;
  if (!statusCard || !statusTitle || !statusDescription) return;

  statusCard.className = `sync-status-card ${status}`;
  if (!isSheet) {
    statusTitle.textContent = "브라우저에 저장 중";
    statusDescription.textContent = "이 PC의 브라우저에만 저장됩니다. 팀원과 동시에 쓰려면 Google Sheet 연결을 설정합니다.";
    return;
  }

  if (!syncConfig.webAppUrl) {
    statusTitle.textContent = "Google Sheet URL 필요";
    statusDescription.textContent = "Apps Script Web App URL을 입력한 뒤 연결 확인을 눌러 주세요.";
    return;
  }

  if (status === "saving") {
    statusTitle.textContent = "Google Sheet에 저장 중";
    statusDescription.textContent = syncConfig.message || "변경 내용을 저장하고 있습니다.";
    return;
  }

  if (status === "error") {
    statusTitle.textContent = "연결 확인 필요";
    statusDescription.textContent = syncConfig.message || "저장 또는 불러오기에 실패했습니다.";
    return;
  }

  const syncedAt = formatSyncTime(syncConfig.lastSyncedAt);
  statusTitle.textContent = "Google Sheet 연결 준비됨";
  statusDescription.textContent = syncedAt ? `마지막 동기화: ${syncedAt}` : "연결 확인 또는 불러오기를 먼저 실행해 주세요.";
}

function readSyncForm() {
  syncConfig.mode = document.getElementById("storageMode").value;
  syncConfig.webAppUrl = document.getElementById("sheetWebAppUrl").value.trim();
  if (syncConfig.mode === "local") {
    syncConfig.status = "local";
    syncConfig.message = "";
  } else if (!syncConfig.webAppUrl) {
    syncConfig.status = "error";
    syncConfig.message = "Apps Script Web App URL을 입력해 주세요.";
  } else if (syncConfig.status === "local") {
    syncConfig.status = "configured";
    syncConfig.message = "";
  }
  saveSyncConfig();
  renderSyncStatus();
}

function setSyncButtonsDisabled(disabled) {
  ["testSheetConnection", "openSheetTestUrl", "loadSheetState", "pushLocalState"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.disabled = disabled;
  });
  ["loadSheetStateMain", "pushLocalStateMain"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.disabled = disabled || syncConfig.mode !== "sheet" || !syncConfig.webAppUrl;
  });
}

async function testSheetConnection() {
  readSyncForm();
  if (syncConfig.mode !== "sheet" || !syncConfig.webAppUrl) {
    setSyncStatus("error", "Google Sheet 연결을 선택하고 Apps Script URL을 입력해 주세요.");
    showToast("Apps Script URL을 입력해 주세요.");
    return;
  }

  setSyncButtonsDisabled(true);
  setSyncStatus("saving", "연결을 확인하고 있습니다.");
  try {
    await sheetJsonpRequest("schema");
    setSyncStatus("synced", "Google Sheet 연결을 확인했습니다.", true);
    showToast("Google Sheet 연결을 확인했습니다.");
  } catch (error) {
    setSyncStatus("error", error.message);
    showToast("연결 확인에 실패했습니다.");
  } finally {
    setSyncButtonsDisabled(false);
  }
}

function openSheetTestUrl() {
  readSyncForm();
  if (syncConfig.mode !== "sheet" || !syncConfig.webAppUrl) {
    setSyncStatus("error", "Google Sheet 연결을 선택하고 Apps Script URL을 입력해 주세요.");
    showToast("Apps Script URL을 입력해 주세요.");
    return;
  }
  window.open(buildSheetUrl("health"), "_blank", "noopener,noreferrer");
}

async function loadSharedStateFromSheet() {
  readSyncForm();
  if (syncConfig.mode !== "sheet" || !syncConfig.webAppUrl) {
    setSyncStatus("error", "Google Sheet 연결을 선택하고 Apps Script URL을 입력해 주세요.");
    showToast("Apps Script URL을 입력해 주세요.");
    return;
  }

  const confirmed = window.confirm("Google Sheet 데이터를 불러오면 현재 브라우저의 공용 데이터가 시트 기준으로 바뀝니다. 계속할까요?");
  if (!confirmed) return;

  setSyncButtonsDisabled(true);
  setSyncStatus("saving", "Google Sheet에서 데이터를 불러오는 중입니다.");
  try {
    const payload = await sheetJsonpRequest("getState");
    if (!payload.state?.builds?.length || !payload.state?.members?.length) {
      throw new Error("시트에 빌드/팀원 데이터가 없습니다. 먼저 현재 데이터를 시트로 저장해 주세요.");
    }
    isApplyingRemoteState = true;
    applySharedState(payload.state || {});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    isApplyingRemoteState = false;
    setSyncStatus("synced", "Google Sheet에서 데이터를 불러왔습니다.", true);
    showToast("시트 데이터를 불러왔습니다.");
    render();
  } catch (error) {
    isApplyingRemoteState = false;
    setSyncStatus("error", error.message);
    showToast("시트 불러오기에 실패했습니다.");
  } finally {
    setSyncButtonsDisabled(false);
  }
}

async function autoLoadSharedStateFromSheet() {
  if (syncConfig.mode !== "sheet" || !syncConfig.webAppUrl) return;

  setSyncStatus("saving", "Google Sheet에서 데이터를 불러오는 중입니다.");
  try {
    const payload = await sheetJsonpRequest("getState");
    if (!payload.state?.builds?.length || !payload.state?.members?.length) {
      setSyncStatus("configured", "시트에 초기 데이터가 없습니다. 먼저 시트에 저장해 주세요.");
      return;
    }
    isApplyingRemoteState = true;
    applySharedState(payload.state || {});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    isApplyingRemoteState = false;
    setSyncStatus("synced", "Google Sheet에서 데이터를 불러왔습니다.", true);
    showToast("시트 데이터를 자동으로 불러왔습니다.");
    render();
  } catch {
    isApplyingRemoteState = false;
    setSyncStatus("configured", "자동 불러오기를 건너뛰었습니다. 필요하면 시트 불러오기를 눌러 주세요.");
  }
}

async function pushSharedStateToSheet(options = {}) {
  readSyncForm();
  if (syncConfig.mode !== "sheet" || !syncConfig.webAppUrl) {
    if (!options.silent) {
      setSyncStatus("error", "Google Sheet 연결을 선택하고 Apps Script URL을 입력해 주세요.");
      showToast("Apps Script URL을 입력해 주세요.");
    }
    return false;
  }

  setSyncButtonsDisabled(true);
  setSyncStatus("saving", "시트 최신 데이터와 합친 뒤 저장 중입니다.");
  try {
    const localState = getSharedState();
    const remotePayload = await sheetJsonpRequest("getState");
    const mergedState = mergeSharedStates(localState, remotePayload.state || {});
    isApplyingRemoteState = true;
    applySharedState(mergedState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    isApplyingRemoteState = false;
    await postSheetPayload({ action: "saveState", state: mergedState });
    setSyncStatus("synced", "현재 데이터를 Google Sheet에 저장했습니다.", true);
    lastSharedSignature = sharedStateSignature();
    if (!options.silent) {
      showToast("현재 데이터를 시트에 저장했습니다.");
      render();
    }
    return true;
  } catch (error) {
    isApplyingRemoteState = false;
    lastSharedSignature = "";
    if (options.silent) hasPendingSharedSave = true;
    setSyncStatus("error", error.message);
    if (!options.silent) showToast("시트 저장에 실패했습니다.");
    return false;
  } finally {
    setSyncButtonsDisabled(false);
  }
}

function render(options = {}) {
  if (options.remote) hasPendingSharedSave = true;

  ensureRouteForRole();
  renderTheme();
  renderSyncStatus();
  renderBuildInfo();
  renderUserPicker();
  renderTabs();
  renderMyTickets();
  renderLeaderDashboard();
  renderRegisterFormOptions();
  renderBuilds();
  renderMembers();
  saveState();
}

function openDialog(id, focusSelector = "") {
  const dialog = document.getElementById(id);
  if (!dialog) return;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  dialog.querySelector(".modal-scroll")?.scrollTo({ top: 0 });

  window.setTimeout(() => {
    const focusTarget = focusSelector ? dialog.querySelector(focusSelector) : dialog.querySelector("input, select, textarea, button");
    focusTarget?.focus({ preventScroll: true });
  }, 0);
}

function renderTheme() {
  document.body.dataset.theme = state.theme === "dark" ? "dark" : "light";
  document.getElementById("themeIcon").textContent = state.theme === "dark" ? "☀" : "☾";
  document.getElementById("themeLabel").textContent = state.theme === "dark" ? "라이트 모드" : "나이트 모드";
  document.getElementById("themeToggle").title = state.theme === "dark" ? "라이트 모드" : "나이트 모드";
}

function renderBuildInfo() {
  const build = currentBuild();
  if (!build) {
    document.getElementById("buildName").textContent = "빌드 없음";
    document.getElementById("devDueText").textContent = "-";
    document.getElementById("currentPhase").textContent = "-";
    return;
  }
  const dueDelta = getDevDueDelta();
  const buildStrip = document.querySelector(".build-strip");
  document.getElementById("buildName").textContent = build.name;
  document.getElementById("devDueText").textContent = getDevDueText();
  document.getElementById("currentPhase").textContent = build.currentPhase;
  buildStrip.classList.toggle("is-due-soon", dueDelta !== null && dueDelta >= 0 && dueDelta <= 7);
  buildStrip.classList.toggle("is-overdue", dueDelta !== null && dueDelta < 0);
}

function renderUserPicker() {
  const currentUser = document.getElementById("currentUser");
  const before = currentUser.value || state.currentUserId;
  currentUser.innerHTML = sortedActiveMembers()
    .map((member) => `<option value="${member.id}" ${member.id === before ? "selected" : ""}>${member.name} (${member.part})</option>`)
    .join("");
  if (!activeMembers().some((member) => member.id === state.currentUserId)) {
    state.currentUserId = activeMembers()[0]?.id || "";
  }
  currentUser.value = state.currentUserId;
}

function renderTabs() {
  const leader = currentUserIsLeader();
  document.getElementById("myTicketsTab").hidden = leader;
  document.getElementById("leaderTab").hidden = !leader;
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.route === state.route);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${state.route}`);
  });
}

function renderMyTickets() {
  const tickets = ownerTickets();
  const summary = {
    normal: tickets.filter((ticket) => ticket.status === "정상").length,
    issue: tickets.filter((ticket) => ticket.status === "이슈 있음").length,
    waiting: tickets.filter((ticket) => ticket.status === "완료 확인 대기").length,
    done: tickets.filter((ticket) => ticket.status === "완료").length,
    leader: tickets.filter((ticket) => ticket.action === "리더 확인 요청").length,
    stale: tickets.filter(isStale).length,
  };

  document.getElementById("mySummary").innerHTML = [
    summaryTile("정상 진행중", summary.normal, "normal"),
    summaryTile("이슈 있음", summary.issue, "issue"),
    summaryTile("리더 확인 요청", summary.leader, "leader"),
    summaryTile("완료 확인 대기", summary.waiting, "waiting"),
    summaryTile("완료", summary.done, "done"),
    summaryTile("2일 이상 확인 없음", summary.stale, "stale"),
  ].join("");

  const filters = ["전체", "정상 진행중", "이슈 있음", "리더 확인 요청", "완료 확인 대기", "완료", "2일 이상 확인 없음"];
  document.getElementById("myStatusFilters").innerHTML = filters
    .map((filter) => `<button class="filter-chip ${state.myStatusFilter === filter ? "is-active" : ""}" type="button" data-my-filter="${filter}">${filter}</button>`)
    .join("");

  const filtered = tickets.filter((ticket) => {
    if (state.myStatusFilter === "전체") return true;
    if (state.myStatusFilter === "정상 진행중") return ticket.status === "정상";
    if (state.myStatusFilter === "리더 확인 요청") return ticket.action === "리더 확인 요청";
    if (state.myStatusFilter === "2일 이상 확인 없음") return isStale(ticket);
    return ticket.status === state.myStatusFilter;
  });

  renderTicketList(document.getElementById("myTicketList"), sortTickets(filtered), { mode: "my" });
}

function renderLeaderDashboard() {
  if (state.leaderFilters.part !== "전체" && !WORK_PART_OPTIONS.includes(state.leaderFilters.part)) {
    state.leaderFilters.part = "전체";
  }

  const allTickets = activeTickets();
  const tickets = applyLeaderFilters(allTickets);
  const summary = {
    normal: allTickets.filter((ticket) => ticket.status === "정상").length,
    issue: allTickets.filter((ticket) => ticket.status === "이슈 있음").length,
    leader: allTickets.filter((ticket) => ticket.action === "리더 확인 요청").length,
    waiting: allTickets.filter((ticket) => ticket.status === "완료 확인 대기").length,
    done: allTickets.filter((ticket) => ticket.status === "완료").length,
    stale: allTickets.filter(isStale).length,
  };

  document.getElementById("leaderSummary").innerHTML = [
    summaryTile("정상 진행중", summary.normal, "normal", { scope: "leader", active: isLeaderSummaryActive("정상 진행중") }),
    summaryTile("이슈 있음", summary.issue, "issue", { scope: "leader", active: isLeaderSummaryActive("이슈 있음") }),
    summaryTile("리더 확인 요청", summary.leader, "leader", { scope: "leader", active: isLeaderSummaryActive("리더 확인 요청") }),
    summaryTile("완료 확인 대기", summary.waiting, "waiting", { scope: "leader", active: isLeaderSummaryActive("완료 확인 대기") }),
    summaryTile("완료", summary.done, "done", { scope: "leader", active: isLeaderSummaryActive("완료") }),
    summaryTile("2일 이상 확인 없음", summary.stale, "stale", { scope: "leader", active: isLeaderSummaryActive("2일 이상 확인 없음") }),
  ].join("");

  fillSelect("leaderOwnerFilter", ["전체", ...sortedActiveWorkMembers().map((member) => member.name)], state.leaderFilters.owner);
  fillSelect("leaderPartFilter", ["전체", ...WORK_PART_OPTIONS], state.leaderFilters.part);
  fillSelect("leaderStatusFilter", ["전체", ...STATUS_OPTIONS], state.leaderFilters.status);
  fillSelect("leaderActionFilter", ["전체", ...ACTION_OPTIONS], state.leaderFilters.action);

  renderTicketList(document.getElementById("leaderTicketList"), sortTickets(tickets), { mode: "leader" });
}

function applyLeaderFilters(tickets) {
  return tickets.filter((ticket) => {
    const owner = getMember(ticket.ownerId);
    const supportOwners = (ticket.supportOwnerIds || []).map(getMember).filter(Boolean);
    const plannerNames = [owner?.name, ...supportOwners.map((member) => member.name)].filter(Boolean);
    const plannerParts = [owner?.part, ...supportOwners.map((member) => member.part)].filter(Boolean);
    if (state.leaderFilters.owner !== "전체" && !plannerNames.includes(state.leaderFilters.owner)) return false;
    if (state.leaderFilters.part !== "전체" && !plannerParts.includes(state.leaderFilters.part)) return false;
    if (state.leaderFilters.status !== "전체" && ticket.status !== state.leaderFilters.status) return false;
    if (state.leaderFilters.action !== "전체" && ticket.action !== state.leaderFilters.action) return false;
    if (state.leaderFilters.quick === "2일 이상 확인 없음" && !isStale(ticket)) return false;
    return true;
  });
}

function leaderSummaryTarget(label) {
  if (label === "정상 진행중") return { key: "status", value: "정상" };
  if (label === "이슈 있음") return { key: "status", value: "이슈 있음" };
  if (label === "완료 확인 대기") return { key: "status", value: "완료 확인 대기" };
  if (label === "완료") return { key: "status", value: "완료" };
  if (label === "리더 확인 요청") return { key: "action", value: "리더 확인 요청" };
  if (label === "2일 이상 확인 없음") return { key: "quick", value: "2일 이상 확인 없음" };
  return null;
}

function isLeaderSummaryActive(label) {
  const target = leaderSummaryTarget(label);
  if (!target) return false;

  const filters = { ...state.leaderFilters };
  const targetMatches = filters[target.key] === target.value;
  filters[target.key] = DEFAULT_LEADER_FILTERS[target.key];
  const othersDefault = Object.keys(DEFAULT_LEADER_FILTERS).every((key) => filters[key] === DEFAULT_LEADER_FILTERS[key]);
  return targetMatches && othersDefault;
}

function applySummaryFilter(scope, label) {
  if (scope !== "leader") return;

  const target = leaderSummaryTarget(label);
  if (!target) return;

  if (isLeaderSummaryActive(label)) {
    state.leaderFilters = { ...DEFAULT_LEADER_FILTERS };
  } else {
    state.leaderFilters = { ...DEFAULT_LEADER_FILTERS, [target.key]: target.value };
  }
  render();
}

function renderRegisterFormOptions() {
  const selectedOwnerId = defaultTicketOwnerId();
  document.getElementById("ticketOwner").innerHTML = sortedActiveWorkMembers()
    .map((member) => `<option value="${member.id}" ${member.id === selectedOwnerId ? "selected" : ""}>${member.name} (${member.part})</option>`)
    .join("");
  renderSupportOwnerList("supportOwners", sortedActiveWorkMembers().filter((member) => member.id !== selectedOwnerId));
  document.getElementById("initialStatus").innerHTML = optionList(STATUS_OPTIONS, "정상");
  document.getElementById("initialAction").innerHTML = optionList(ACTION_OPTIONS, "없음");
}

function refreshRegisterSupportOwners() {
  const ownerId = document.getElementById("ticketOwner").value;
  const selected = getSelectedValues("supportOwners").filter((id) => id !== ownerId);
  renderSupportOwnerList("supportOwners", sortedActiveWorkMembers().filter((member) => member.id !== ownerId), selected);
}

function resetTicketRegisterForm() {
  window.setTimeout(() => {
    const ownerId = defaultTicketOwnerId();
    document.getElementById("ticketOwner").value = ownerId;
    document.getElementById("initialStatus").value = "정상";
    document.getElementById("initialAction").value = "없음";
    renderSupportOwnerList("supportOwners", sortedActiveWorkMembers().filter((member) => member.id !== ownerId), []);
  }, 0);
}

function refreshEditSupportOwners() {
  const ownerId = document.getElementById("editTicketOwner").value;
  const selected = getSelectedValues("editSupportOwners").filter((id) => id !== ownerId);
  renderSupportOwnerList("editSupportOwners", sortedActiveWorkMembers().filter((member) => member.id !== ownerId), selected);
}

function renderBuilds() {
  document.getElementById("buildPhaseInput").innerHTML = optionList(PHASE_OPTIONS, "개발중");
  const visibleBuilds = state.builds.filter((build) => !build.isArchived);
  document.getElementById("buildList").innerHTML = visibleBuilds.length
    ? [...visibleBuilds]
    .sort((a, b) => new Date(b.devDueDate) - new Date(a.devDueDate))
    .map((build) => {
      const isCurrent = build.id === state.currentBuildId;
      const buildTickets = state.tickets.filter((ticket) => ticket.buildId === build.id && !ticket.isArchived);
      const ticketCount = buildTickets.length;
      const normalCount = buildTickets.filter((ticket) => ticket.status === "정상").length;
      const issueCount = buildTickets.filter((ticket) => ticket.status === "이슈 있음").length;
      const waitingCount = buildTickets.filter((ticket) => ticket.status === "완료 확인 대기").length;
      const doneCount = buildTickets.filter((ticket) => ticket.status === "완료").length;
      const staleCount = buildTickets.filter(isStale).length;
      return `
        <article class="build-card ${isCurrent ? "is-current" : ""}" data-select-build="${build.id}" tabindex="0" role="button" aria-label="${escapeHtml(build.name)} 보기">
          <div>
            <strong>${escapeHtml(build.name)}</strong>
            <p class="muted">개발 마감: ${escapeHtml(build.devDueDate)} / 단계: ${escapeHtml(build.currentPhase)} / 티켓 ${ticketCount}개</p>
            <div class="build-metrics">
              <span>정상 ${normalCount}</span>
              <span>이슈 ${issueCount}</span>
              <span>완료 확인 ${waitingCount}</span>
              <span>완료 ${doneCount}</span>
              <span>미확인 ${staleCount}</span>
            </div>
            ${isCurrent ? `<span class="current-build-badge">현재 보는 중</span>` : ""}
          </div>
          <div class="build-card-actions">
            <button class="small-action" type="button" data-edit-build="${build.id}">수정</button>
            <button class="small-action danger-action" type="button" data-delete-build="${build.id}">삭제</button>
          </div>
        </article>
      `;
    })
    .join("")
    : emptyState("등록된 빌드가 없습니다.", "오른쪽 새 빌드 만들기에서 빌드명과 개발 마감일을 입력하면 보드가 만들어집니다.");
}

function renderMembers() {
  document.getElementById("memberPart").innerHTML = optionList(PART_OPTIONS, PART_OPTIONS[0]);
  syncMemberRoleForPart();

  const members = sortedMembers(state.members);
  document.getElementById("memberList").innerHTML = members.length
    ? members
    .map((member) => {
      const inlineNotice =
        memberInlineNotice?.memberId === member.id
          ? `<div class="member-inline-notice ${memberInlineNotice.type}">${escapeHtml(memberInlineNotice.message)}</div>`
          : "";
      return `
        <article class="member-card ${member.isActive ? "" : "is-inactive"}">
          <span class="avatar ${member.color}">${escapeHtml(member.initials)}</span>
          <div>
            <strong>${escapeHtml(member.name)}</strong>
            <div class="member-meta">파트: ${escapeHtml(member.part)} / 역할: ${escapeHtml(member.role)} / 상태: ${member.isActive ? "사용 중" : "사용 중지"}</div>
          </div>
          <div class="member-actions">
            ${
              member.isActive
                ? `<button class="small-action" type="button" data-edit-member="${member.id}">수정</button>`
                : `<button class="small-action danger-action" type="button" data-delete-member="${member.id}">삭제</button>`
            }
            <button class="small-action" type="button" data-toggle-member="${member.id}">${member.isActive ? "사용 중지" : "다시 사용"}</button>
          </div>
          ${inlineNotice}
        </article>
      `;
    })
    .join("")
    : emptyState("등록된 기획팀 멤버가 없습니다.", "왼쪽 멤버 정보에서 이름, 파트, 이니셜을 입력해 추가할 수 있습니다.");
}

function summaryTile(label, value, type, options = {}) {
  if (options.scope) {
    return `
      <button class="summary-tile ${type} is-clickable ${options.active ? "is-active" : ""}" type="button" data-summary-scope="${escapeHtml(options.scope)}" data-summary-filter="${escapeHtml(label)}" aria-pressed="${options.active ? "true" : "false"}">
        <span class="label">${escapeHtml(label)}</span>
        <strong>${value}</strong>
      </button>
    `;
  }

  return `
    <div class="summary-tile ${type}">
      <span class="label">${escapeHtml(label)}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function fillSelect(id, options, selected) {
  const select = document.getElementById(id);
  select.innerHTML = optionList(options, selected);
  select.value = selected;
}

function getSelectedValues(id) {
  const element = document.getElementById(id);
  if (element.selectedOptions) {
    return Array.from(element.selectedOptions).map((option) => option.value);
  }
  try {
    return JSON.parse(element.dataset.selectedValues || "[]");
  } catch {
    return [];
  }
}

function setSelectedValues(id, values) {
  const element = document.getElementById(id);
  const selected = new Set(values);
  if (element.options) {
    Array.from(element.options).forEach((option) => {
      option.selected = selected.has(option.value);
    });
    return;
  }
  element.dataset.selectedValues = JSON.stringify([...selected]);
}

function renderSupportOwnerList(id, members, selectedValues = []) {
  const container = document.getElementById(id);
  const availableIds = new Set(members.map((member) => member.id));
  const safeSelectedValues = selectedValues.filter((value) => availableIds.has(value));
  const selected = new Set(safeSelectedValues);
  container.dataset.selectedValues = JSON.stringify(safeSelectedValues);

  if (!members.length) {
    container.innerHTML = `<p class="support-empty">추가 담당자로 선택할 기획자가 없습니다.</p>`;
    return;
  }

  let currentPart = "";
  const selectedMembers = members.filter((member) => selected.has(member.id));
  const selectedChips = selectedMembers.length
    ? selectedMembers
        .map(
          (member) => `
            <button class="support-chip" type="button" data-support-toggle="${member.id}" aria-label="${escapeHtml(member.name)} 선택 해제">
              ${escapeHtml(member.name)}
              <span aria-hidden="true">×</span>
            </button>
          `
        )
        .join("")
    : `<span class="support-empty">선택 없음</span>`;

  const optionButtons = members
    .map((member) => {
      const partHeading = member.part !== currentPart ? `<span class="support-part-label">${escapeHtml(member.part)}</span>` : "";
      currentPart = member.part;
      return `
        ${partHeading}
        <button class="support-owner-option ${selected.has(member.id) ? "is-selected" : ""}" type="button" data-support-toggle="${member.id}" aria-pressed="${selected.has(member.id)}">
          ${escapeHtml(member.name)}
        </button>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="support-selected-row">
      <span class="support-selected-label">선택됨</span>
      <div class="support-chip-row">${selectedChips}</div>
    </div>
    <div class="support-option-grid">${optionButtons}</div>
  `;
}

function supportOwnerMembersFor(id) {
  const ownerId = id === "editSupportOwners" ? document.getElementById("editTicketOwner").value : document.getElementById("ticketOwner").value;
  return sortedActiveWorkMembers().filter((member) => member.id !== ownerId);
}

function toggleSupportOwner(containerId, memberId) {
  const optionGrid = document.querySelector(`#${containerId} .support-option-grid`);
  const previousScrollTop = optionGrid?.scrollTop || 0;
  const selected = new Set(getSelectedValues(containerId));
  if (selected.has(memberId)) {
    selected.delete(memberId);
  } else {
    selected.add(memberId);
  }
  renderSupportOwnerList(containerId, supportOwnerMembersFor(containerId), [...selected]);
  const nextOptionGrid = document.querySelector(`#${containerId} .support-option-grid`);
  if (nextOptionGrid) nextOptionGrid.scrollTop = previousScrollTop;
}

function defaultTicketOwnerId() {
  const members = sortedActiveWorkMembers();
  return members.some((member) => member.id === state.currentUserId) ? state.currentUserId : members[0]?.id || "";
}

function renderTicketList(container, tickets, { mode }) {
  if (!tickets.length) {
    container.innerHTML = emptyTicketState(mode);
    return;
  }

  container.innerHTML = tickets.map((ticket) => renderTicketCard(ticket, mode)).join("");
}

function emptyState(title, description, actionHtml = "") {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(description)}</p>
      ${actionHtml ? `<div class="empty-actions">${actionHtml}</div>` : ""}
    </div>
  `;
}

function emptyTicketState(mode) {
  if (mode === "my") {
    if (ownerTickets().length) {
      return emptyState(
        "이 필터에 해당하는 내 티켓이 없습니다.",
        "다른 상태를 확인하려면 전체 필터로 돌아가면 됩니다.",
        `<button class="secondary-action" type="button" data-my-filter="전체">전체 보기</button>`
      );
    }

    return emptyState(
      "현재 사용자에게 배정된 티켓이 없습니다.",
      "티켓 등록에서 업무 링크를 추가하거나, 현재 사용자가 맞는지 확인해 주세요.",
      `<button class="secondary-action" type="button" data-empty-action="register">티켓 등록 열기</button>`
    );
  }

  const filtersActive = Object.keys(DEFAULT_LEADER_FILTERS).some((key) => state.leaderFilters[key] !== DEFAULT_LEADER_FILTERS[key]);
  if (filtersActive) {
    return emptyState(
      "현재 필터에 해당하는 티켓이 없습니다.",
      "기획자, 파트, 상태, 다음 액션 조건을 줄이면 다시 확인할 수 있습니다.",
      `<button class="secondary-action" type="button" data-reset-leader-filters>필터 초기화</button>`
    );
  }

  return emptyState("이번 빌드에 등록된 티켓이 없습니다.", "티켓 등록에서 이번 빌드에 챙길 업무 링크를 추가해 주세요.");
}

function renderTicketCard(ticket, mode) {
  const owner = getMember(ticket.ownerId) || {};
  const supportOwners = (ticket.supportOwnerIds || []).map(getMember).filter(Boolean);
  const plannerLine = supportOwners.length
    ? `${owner.name || "-"} / 추가: ${supportOwners.map((member) => member.name).join(", ")}`
    : owner.name || "-";
  const stale = isStale(ticket);
  const shouldCheckToday = needsTodayCheck(ticket);
  const statusClass = `status-${slug(ticket.status)}`;
  const memo = ticket.memo?.trim() || "남긴 메모 없음";
  const leaderLine = mode === "leader" ? `<span>담당 기획자</span><p>${escapeHtml(plannerLine)} / ${escapeHtml(owner.part || "-")}</p>` : "";
  const detailClass = leaderLine ? "has-leader" : "";
  const actionButtons =
    mode === "my"
      ? `
        <button class="secondary-action" type="button" data-no-change="${ticket.id}">변동 없음</button>
        <button class="secondary-action" type="button" data-open-state="${ticket.id}">상태 변경</button>
        <button class="secondary-action" type="button" data-open-ticket-edit="${ticket.id}">담당/작업 수정</button>
        <button class="secondary-action" type="button" data-copy-ticket="${ticket.id}">보고 복사</button>
      `
      : "";

  return `
    <article class="ticket-card ${statusClass}">
      <div class="ticket-head">
        <div class="ticket-title-line">
          <span class="avatar ${owner.color || "gray"}">${escapeHtml(owner.initials || "-")}</span>
          <a class="title-link-action" href="${escapeHtml(ticket.sourceUrl)}" target="_blank" rel="noreferrer" title="업무 링크 열기" aria-label="업무 링크 열기">
            <span class="external-link-glyph" aria-hidden="true"></span>
          </a>
          <div class="ticket-title">
            <h3>${escapeHtml(ticket.name)}</h3>
            <div class="ticket-meta">기획: ${escapeHtml(plannerLine)} / 작업: ${escapeHtml(ticket.workOwner)}</div>
          </div>
        </div>
        <div class="badge-row">
          ${shouldCheckToday ? `<span class="badge today-check">오늘 확인 필요</span>` : ""}
          <span class="badge ${statusBadgeClass(ticket.status)}">${escapeHtml(ticket.status)}</span>
          <span class="badge action-badge ${actionBadgeClass(ticket.action)}">${escapeHtml(ticket.action)}</span>
          ${stale ? `<span class="badge stale">2일 이상 확인 없음</span>` : ""}
        </div>
      </div>

      <div class="ticket-body ${detailClass}">
        ${leaderLine ? `<div class="info-block">${leaderLine}</div>` : ""}
        <div class="info-block action-info ${actionBadgeClass(ticket.action)}">
          <span>다음 액션</span>
          <p>${escapeHtml(ticket.action)}</p>
        </div>
        <div class="info-block">
          <span>작업 진행도</span>
          <p class="progress-cell">
            <span class="progress-bar-track"><span class="progress-bar-fill" style="width:${ticket.progress ?? 0}%"></span></span>
            <span class="progress-pct">${ticket.progress ?? 0}%</span>
          </p>
        </div>
        <div class="info-block">
          <span>마지막 확인</span>
          <p>${formatDateTime(ticket.lastCheckedAt)}</p>
        </div>
        <div class="info-block">
          <span>마지막 상태 변경</span>
          <p>${formatDateOnly(ticket.lastStatusChangedAt)}</p>
        </div>
        <div class="info-block full">
          <span>메모</span>
          <p>${escapeHtml(memo)}</p>
        </div>
      </div>

      <div class="ticket-actions">
        ${actionButtons}
      </div>
    </article>
  `;
}

function openStateDialog(ticketId) {
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return;

  document.getElementById("stateTicketId").value = ticket.id;
  document.getElementById("stateTicketName").textContent = ticket.name;
  document.getElementById("stateStatus").innerHTML = optionList(STATUS_OPTIONS, ticket.status);
  document.getElementById("stateAction").innerHTML = optionList(ACTION_OPTIONS, ticket.action);
  document.getElementById("stateMemo").value = ticket.memo || "";
  const progress = ticket.progress ?? 0;
  document.getElementById("stateProgress").value = progress;
  document.getElementById("progressValue").textContent = `${progress}%`;
  renderActionRecommendHint();
  updateStatePreview();
  openDialog("stateDialog", "#stateStatus");
}

function renderActionRecommendHint() {
  document.getElementById("actionRecommendHint").textContent = recommendationTextForStatus(document.getElementById("stateStatus").value);
}

function applyRecommendedAction() {
  const recommended = recommendedActionForStatus(document.getElementById("stateStatus").value);
  document.getElementById("stateAction").value = recommended;
  renderActionRecommendHint();
  updateStatePreview();
}

function updateStatePreview() {
  const ticket = state.tickets.find((item) => item.id === document.getElementById("stateTicketId").value);
  if (!ticket) return;

  const previewTicket = {
    ...ticket,
    status: document.getElementById("stateStatus").value,
    action: document.getElementById("stateAction").value,
    memo: document.getElementById("stateMemo").value,
    progress: Number(document.getElementById("stateProgress").value),
    lastCheckedAt: nowIso(),
  };
  renderActionRecommendHint();
  document.getElementById("statePreview").textContent = buildTicketReport(previewTicket);
}

function handleStateSave(event) {
  event.preventDefault();
  const ticketId = document.getElementById("stateTicketId").value;
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return;

  const newStatus = document.getElementById("stateStatus").value;
  const newAction = document.getElementById("stateAction").value;
  const newMemo = document.getElementById("stateMemo").value.trim();

  if ((newStatus === "이슈 있음" || newAction === "리더 확인 요청") && !newMemo) {
    showToast("이슈나 리더 확인 요청에는 메모를 남겨 주세요.");
    return;
  }

  const changed = ticket.status !== newStatus || ticket.action !== newAction || (ticket.memo || "") !== newMemo;
  const timestamp = nowIso();
  const previous = { status: ticket.status, action: ticket.action };

  ticket.status = newStatus;
  ticket.action = newAction;
  ticket.memo = newMemo;
  ticket.progress = Number(document.getElementById("stateProgress").value);
  ticket.lastCheckedAt = timestamp;
  ticket.updatedAt = timestamp;
  if (changed) ticket.lastStatusChangedAt = timestamp;

  state.checkins.push({
    id: createId("C"),
    ticketId: ticket.id,
    memberId: state.currentUserId,
    checkinType: changed ? "상태 변경" : "변동 없음",
    previousStatus: previous.status,
    newStatus,
    previousAction: previous.action,
    newAction,
    memo: newMemo,
    checkedAt: timestamp,
  });

  document.getElementById("stateDialog").close();
  showToast(changed ? "상태를 저장했습니다." : "마지막 확인일을 갱신했습니다.");
  render({ remote: true });
}

function markNoChange(ticketId) {
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return;

  const timestamp = nowIso();
  ticket.lastCheckedAt = timestamp;
  ticket.updatedAt = timestamp;
  state.checkins.push({
    id: createId("C"),
    ticketId: ticket.id,
    memberId: state.currentUserId,
    checkinType: "변동 없음",
    previousStatus: ticket.status,
    newStatus: ticket.status,
    previousAction: ticket.action,
    newAction: ticket.action,
    memo: ticket.memo || "",
    checkedAt: timestamp,
  });
  showToast("변동 없음으로 확인했습니다.");
  render({ remote: true });
}

function createId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function buildTodayReport() {
  const myTickets = sortTickets(activeTickets().filter((ticket) => ticket.ownerId === state.currentUserId));
  const owner = getMember(state.currentUserId);
  const header = `[${currentBuild().name} 담당 티켓 공유 - ${owner?.name || "담당자"}]`;
  const body = myTickets.map(buildTicketReport).join("\n\n");
  return `${header}\n\n${body || "등록된 담당 티켓이 없습니다."}`;
}

function buildTicketReport(ticket) {
  const progress = ticket.progress ?? 0;
  const progressText = `진행도: ${progress}%`;
  const lines = [`- ${ticket.name} (${progressText})`];
  const checkedText = formatDateTime(ticket.lastCheckedAt);
  const statusChangedText = formatDateOnly(ticket.lastStatusChangedAt);

  if (ticket.status === "완료") {
    lines.push("  완료");
    if (ticket.memo?.trim()) lines.push(`  메모: ${ticket.memo.trim()}`);
    lines.push(`  업무 링크: ${ticket.sourceUrl}`);
    return lines.join("\n");
  }

  if (ticket.status === "정상") {
    const statusLine = ticket.action === "없음" ? "정상 진행 중" : `정상 진행 중 / ${ticket.action}`;
    lines.push(`  ${statusLine}`);
    if (ticket.memo?.trim()) lines.push(`  메모: ${ticket.memo.trim()}`);
    lines.push(`  확인: ${checkedText}`);
    lines.push(`  업무 링크: ${ticket.sourceUrl}`);
    return lines.join("\n");
  }

  lines.push(`  ${ticket.status} / ${ticket.action}`);
  if (ticket.memo?.trim()) lines.push(`  내용: ${ticket.memo.trim()}`);
  lines.push(`  확인: ${checkedText} / 상태 변경: ${statusChangedText}`);
  lines.push(`  업무 링크: ${ticket.sourceUrl}`);
  return lines.join("\n");
}

function openReportDialog(text, title = "일일 업무 공유") {
  document.getElementById("reportTitle").textContent = title;
  document.getElementById("reportText").value = text;
  openDialog("reportDialog", "#reportText");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("복사했습니다.");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("복사했습니다.");
  }
}

function inferToastTone(message) {
  if (/실패|오류|입력|없습니다|삭제할 수|필요|요청|이슈|먼저/.test(message)) return "warning";
  if (/저장|등록|수정|복사|확인|불러왔|삭제|전환|갱신|사용/.test(message)) return "success";
  return "info";
}

function showToast(message, tone = "") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${tone || inferToastTone(message)} is-visible`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function handleTicketSubmit(event) {
  event.preventDefault();
  const sourceUrl = document.getElementById("ticketUrl").value.trim();
  const ownerId = document.getElementById("ticketOwner").value;
  if (!ownerId) {
    showToast("담당 기획자로 사용할 멤버가 없습니다.");
    return;
  }

  if (state.tickets.some((ticket) => ticket.sourceUrl === sourceUrl && !ticket.isArchived)) {
    showToast("이미 등록된 업무 링크입니다.");
    return;
  }

  const timestamp = nowIso();
  const ticket = {
    id: createId("T"),
    buildId: currentBuild().id,
    sourceUrl,
    name: document.getElementById("ticketName").value.trim(),
    ownerId,
    supportOwnerIds: getSelectedValues("supportOwners").filter((id) => id !== ownerId),
    workOwner: document.getElementById("workOwner").value.trim(),
    status: document.getElementById("initialStatus").value,
    action: document.getElementById("initialAction").value,
    memo: document.getElementById("initialMemo").value.trim(),
    lastStatusChangedAt: timestamp,
    lastCheckedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    isArchived: false,
  };

  state.tickets.push(ticket);
  event.target.reset();
  showToast("티켓을 등록했습니다.");
  render({ remote: true });
}

function handleMemberSubmit(event) {
  event.preventDefault();
  const editingId = document.getElementById("editingMemberId").value;
  const part = document.getElementById("memberPart").value;
  const timestamp = nowIso();
  const payload = {
    name: document.getElementById("memberName").value.trim(),
    part,
    role: roleForPart(part),
    initials: document.getElementById("memberInitials").value.trim().toUpperCase(),
    color: colorForPart(part),
    updatedAt: timestamp,
  };

  if (editingId) {
    const member = getMember(editingId);
    Object.assign(member, payload);
    showToast("멤버 정보를 수정했습니다.");
  } else {
    state.members.push({
      id: createId("M"),
      ...payload,
      isActive: true,
      createdAt: timestamp,
    });
    showToast("멤버를 추가했습니다.");
  }

  clearMemberForm();
  render({ remote: true });
}

function editMember(memberId) {
  const member = getMember(memberId);
  if (!member) return;
  document.getElementById("editingMemberId").value = member.id;
  document.getElementById("memberName").value = member.name;
  document.getElementById("memberPart").value = member.part;
  document.getElementById("memberRole").value = member.role;
  document.getElementById("memberInitials").value = member.initials;
  document.getElementById("saveMember").textContent = "수정 저장";
  syncMemberRoleForPart();
  document.getElementById("memberName").focus();
}

function clearMemberForm() {
  document.getElementById("memberForm").reset();
  document.getElementById("editingMemberId").value = "";
  document.getElementById("saveMember").textContent = "멤버 추가";
  syncMemberRoleForPart();
}

function showMemberNotice(message, type = "info") {
  const notice = document.getElementById("memberNotice");
  notice.textContent = message;
  notice.className = `member-notice ${type}`;
  notice.hidden = false;
}

function showMemberInlineNotice(memberId, message, type = "info") {
  memberInlineNotice = { memberId, message, type };
  renderMembers();
}

function clearMemberNotice() {
  memberInlineNotice = null;
  const notice = document.getElementById("memberNotice");
  notice.textContent = "";
  notice.hidden = true;
}

function syncMemberRoleForPart() {
  const roleSelect = document.getElementById("memberRole");
  roleSelect.value = roleForPart(document.getElementById("memberPart").value);
  roleSelect.disabled = true;
}

function toggleMember(memberId) {
  const member = getMember(memberId);
  if (!member) return;
  member.isActive = !member.isActive;
  member.updatedAt = nowIso();
  memberInlineNotice = member.isActive
    ? null
    : { memberId: member.id, message: "사용 중지했습니다. 필요하면 삭제할 수 있습니다.", type: "info" };
  showToast(member.isActive ? "다시 사용으로 바꿨습니다." : "사용 중지했습니다.");
  render({ remote: true });
}

function memberHasTicket(memberId) {
  return state.tickets.some((ticket) => ticket.ownerId === memberId || ticket.supportOwnerIds?.includes(memberId));
}

function deleteMember(memberId) {
  const member = getMember(memberId);
  if (!member) return;

  if (member.isActive) {
    showMemberInlineNotice(member.id, "먼저 사용 중지로 바꾼 뒤 삭제할 수 있습니다.", "warning");
    return;
  }

  if (memberHasTicket(member.id)) {
    showMemberInlineNotice(member.id, "담당자로 등록된 티켓이 있습니다. 먼저 담당/작업 수정을 통해 다른 담당자로 변경해 주세요.", "warning");
    return;
  }

  const confirmed = window.confirm(`${member.name} 멤버를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`);
  if (!confirmed) return;

  state.members = state.members.filter((item) => item.id !== member.id);
  memberInlineNotice = null;
  if (state.currentUserId === member.id) {
    state.currentUserId = activeMembers()[0]?.id || "";
  }
  clearMemberForm();
  showToast("멤버를 삭제했습니다.");
  render({ remote: true });
  showMemberNotice("멤버를 삭제했습니다.", "success");
}

function selectBuild(buildId) {
  if (!state.builds.some((build) => build.id === buildId)) return;
  state.currentBuildId = buildId;
  state.myStatusFilter = "전체";
  state.leaderFilters = { ...DEFAULT_LEADER_FILTERS };
  showToast(`${currentBuild().name} 보드로 전환했습니다.`);
  render();
}

function editBuild(buildId) {
  const build = state.builds.find((item) => item.id === buildId);
  if (!build) return;
  document.getElementById("editingBuildId").value = build.id;
  document.getElementById("buildNameInput").value = build.name;
  document.getElementById("buildPhaseInput").value = build.currentPhase;
  document.getElementById("devDueInput").value = build.devDueDate;
  document.getElementById("updateDateInput").value = build.updateDate || "";
  document.getElementById("buildFormTitle").textContent = "빌드 정보 수정";
  document.getElementById("saveBuild").textContent = "수정 저장";
  document.getElementById("buildNameInput").focus();
}

function clearBuildForm() {
  document.getElementById("buildForm").reset();
  document.getElementById("editingBuildId").value = "";
  document.getElementById("buildFormTitle").textContent = "새 빌드 만들기";
  document.getElementById("saveBuild").textContent = "빌드 만들기";
  document.getElementById("buildPhaseInput").value = "개발중";
}

function handleBuildSubmit(event) {
  event.preventDefault();
  const editingId = document.getElementById("editingBuildId").value;
  const timestamp = nowIso();
  const payload = {
    name: document.getElementById("buildNameInput").value.trim(),
    currentPhase: document.getElementById("buildPhaseInput").value,
    devDueDate: document.getElementById("devDueInput").value,
    updateDate: document.getElementById("updateDateInput").value,
    updatedAt: timestamp,
  };

  if (editingId) {
    const build = state.builds.find((item) => item.id === editingId);
    Object.assign(build, payload);
    showToast("빌드 정보를 수정했습니다.");
  } else {
    const build = {
      id: createId("B"),
      devStartDate: "",
      devReviewDate: "",
      ...payload,
      createdAt: timestamp,
      isArchived: false,
    };
    state.builds.push(build);
    state.currentBuildId = build.id;
    showToast(`${build.name} 보드를 만들었습니다.`);
  }

  clearBuildForm();
  render({ remote: true });
}

function deleteBuild(buildId) {
  const build = state.builds.find((item) => item.id === buildId);
  if (!build) return;
  const visibleBuilds = state.builds.filter((item) => !item.isArchived);

  if (visibleBuilds.length <= 1) {
    showToast("마지막 빌드는 삭제할 수 없습니다.");
    return;
  }

  const linkedTicketCount = state.tickets.filter((ticket) => ticket.buildId === build.id).length;
  const ticketMessage = linkedTicketCount > 0 ? `\n연결된 티켓 ${linkedTicketCount}개도 함께 삭제됩니다.` : "";
  const confirmed = window.confirm(`${build.name} 빌드를 삭제할까요?${ticketMessage}\n이 작업은 되돌릴 수 없습니다.`);
  if (!confirmed) return;

  const timestamp = nowIso();
  build.isArchived = true;
  build.updatedAt = timestamp;
  state.tickets
    .filter((ticket) => ticket.buildId === build.id)
    .forEach((ticket) => {
      ticket.isArchived = true;
      ticket.updatedAt = timestamp;
    });

  if (state.currentBuildId === build.id) {
    const nextBuild = visibleBuilds.filter((item) => item.id !== build.id).sort((a, b) => new Date(b.devDueDate) - new Date(a.devDueDate))[0];
    state.currentBuildId = nextBuild.id;
  }

  clearBuildForm();
  showToast(`${build.name} 빌드를 삭제했습니다.`);
  render({ remote: true });
}

function openTicketEditDialog(ticketId) {
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return;
  const assignableMembers = sortedActiveWorkMembers();
  const editOwnerOptions = assignableMembers.some((member) => member.id === ticket.ownerId)
    ? assignableMembers
    : [getMember(ticket.ownerId), ...assignableMembers].filter(Boolean);
  const supportOptions = assignableMembers.filter((member) => member.id !== ticket.ownerId);

  document.getElementById("editTicketId").value = ticket.id;
  document.getElementById("editTicketNameLabel").textContent = ticket.name;
  document.getElementById("editTicketName").value = ticket.name;
  document.getElementById("editTicketOwner").innerHTML = sortedMembers(editOwnerOptions)
    .map((member) => `<option value="${member.id}">${member.name} (${member.part})</option>`)
    .join("");
  document.getElementById("editTicketOwner").value = ticket.ownerId;
  renderSupportOwnerList("editSupportOwners", supportOptions, ticket.supportOwnerIds || []);
  document.getElementById("editWorkOwner").value = ticket.workOwner;
  openDialog("ticketEditDialog", "#editTicketName");
}

function handleTicketEditSubmit(event) {
  event.preventDefault();
  const ticket = state.tickets.find((item) => item.id === document.getElementById("editTicketId").value);
  if (!ticket) return;

  const ownerId = document.getElementById("editTicketOwner").value;
  ticket.name = document.getElementById("editTicketName").value.trim();
  ticket.ownerId = ownerId;
  ticket.supportOwnerIds = getSelectedValues("editSupportOwners").filter((id) => id !== ownerId);
  ticket.workOwner = document.getElementById("editWorkOwner").value.trim();
  ticket.updatedAt = nowIso();

  document.getElementById("ticketEditDialog").close();
  showToast("담당/작업자 정보를 수정했습니다.");
  render({ remote: true });
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-guide]")) {
    openDialog("guideDialog");
    return;
  }

  if (event.target.closest("#openSyncDialog")) {
    renderSyncStatus();
    openDialog("syncDialog", "#storageMode");
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    state.route = routeButton.dataset.route;
    render();
    return;
  }

  if (event.target.closest("#openRegisterDialog")) {
    document.getElementById("ticketForm").reset();
    renderRegisterFormOptions();
    document.getElementById("ticketOwner").value = defaultTicketOwnerId();
    refreshRegisterSupportOwners();
    openDialog("registerDialog", "#ticketUrl");
    return;
  }

  if (event.target.closest("#openMembersDialog")) {
    clearMemberForm();
    clearMemberNotice();
    openDialog("membersDialog", "#memberName");
    return;
  }

  const emptyActionButton = event.target.closest("[data-empty-action]");
  if (emptyActionButton?.dataset.emptyAction === "register") {
    document.getElementById("ticketForm").reset();
    renderRegisterFormOptions();
    document.getElementById("ticketOwner").value = defaultTicketOwnerId();
    refreshRegisterSupportOwners();
    openDialog("registerDialog", "#ticketUrl");
    return;
  }

  if (event.target.closest("[data-reset-leader-filters]")) {
    state.leaderFilters = { ...DEFAULT_LEADER_FILTERS };
    render();
    return;
  }

  const supportToggle = event.target.closest("[data-support-toggle]");
  if (supportToggle) {
    const container = supportToggle.closest(".support-owner-list");
    if (container) toggleSupportOwner(container.id, supportToggle.dataset.supportToggle);
    return;
  }

  const summaryShortcut = event.target.closest("[data-summary-scope]");
  if (summaryShortcut) {
    applySummaryFilter(summaryShortcut.dataset.summaryScope, summaryShortcut.dataset.summaryFilter);
    return;
  }

  const filterButton = event.target.closest("[data-my-filter]");
  if (filterButton) {
    state.myStatusFilter = filterButton.dataset.myFilter;
    render();
    return;
  }

  const noChangeButton = event.target.closest("[data-no-change]");
  if (noChangeButton) {
    markNoChange(noChangeButton.dataset.noChange);
    return;
  }

  const openStateButton = event.target.closest("[data-open-state]");
  if (openStateButton) {
    openStateDialog(openStateButton.dataset.openState);
    return;
  }

  const openTicketEditButton = event.target.closest("[data-open-ticket-edit]");
  if (openTicketEditButton) {
    openTicketEditDialog(openTicketEditButton.dataset.openTicketEdit);
    return;
  }

  const copyTicketButton = event.target.closest("[data-copy-ticket]");
  if (copyTicketButton) {
    const ticket = state.tickets.find((item) => item.id === copyTicketButton.dataset.copyTicket);
    if (ticket) openReportDialog(buildTicketReport(ticket), "티켓 보고 복사");
    return;
  }

  const closeButton = event.target.closest("[data-close-dialog]");
  if (closeButton) {
    document.getElementById(closeButton.dataset.closeDialog)?.close();
    return;
  }

  const editBuildButton = event.target.closest("[data-edit-build]");
  if (editBuildButton) {
    editBuild(editBuildButton.dataset.editBuild);
    return;
  }

  const deleteBuildButton = event.target.closest("[data-delete-build]");
  if (deleteBuildButton) {
    deleteBuild(deleteBuildButton.dataset.deleteBuild);
    return;
  }

  const selectBuildButton = event.target.closest("[data-select-build]");
  if (selectBuildButton) {
    selectBuild(selectBuildButton.dataset.selectBuild);
    return;
  }

  const editButton = event.target.closest("[data-edit-member]");
  if (editButton) {
    editMember(editButton.dataset.editMember);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-member]");
  if (deleteButton) {
    deleteMember(deleteButton.dataset.deleteMember);
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-member]");
  if (toggleButton) {
    toggleMember(toggleButton.dataset.toggleMember);
  }
});

document.getElementById("currentUser").addEventListener("change", (event) => {
  state.currentUserId = event.target.value;
  state.myStatusFilter = "전체";
  render();
});

document.getElementById("themeToggle").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  render();
});

document.getElementById("leaderOwnerFilter").addEventListener("change", (event) => {
  state.leaderFilters.owner = event.target.value;
  state.leaderFilters.quick = "전체";
  render();
});

document.getElementById("leaderPartFilter").addEventListener("change", (event) => {
  state.leaderFilters.part = event.target.value;
  state.leaderFilters.quick = "전체";
  render();
});

document.getElementById("leaderStatusFilter").addEventListener("change", (event) => {
  state.leaderFilters.status = event.target.value;
  state.leaderFilters.quick = "전체";
  render();
});

document.getElementById("leaderActionFilter").addEventListener("change", (event) => {
  state.leaderFilters.action = event.target.value;
  state.leaderFilters.quick = "전체";
  render();
});

document.getElementById("stateStatus").addEventListener("change", applyRecommendedAction);
document.getElementById("stateAction").addEventListener("change", updateStatePreview);
document.getElementById("stateMemo").addEventListener("input", updateStatePreview);
document.getElementById("stateProgress").addEventListener("input", () => {
  const val = document.getElementById("stateProgress").value;
  document.getElementById("progressValue").textContent = `${val}%`;
  updateStatePreview();
});
document.getElementById("stateForm").addEventListener("submit", handleStateSave);
document.getElementById("ticketOwner").addEventListener("change", refreshRegisterSupportOwners);
document.getElementById("editTicketOwner").addEventListener("change", refreshEditSupportOwners);
document.getElementById("ticketForm").addEventListener("submit", handleTicketSubmit);
document.getElementById("ticketForm").addEventListener("reset", resetTicketRegisterForm);
document.getElementById("ticketEditForm").addEventListener("submit", handleTicketEditSubmit);
document.getElementById("memberForm").addEventListener("submit", handleMemberSubmit);
document.getElementById("memberPart").addEventListener("change", syncMemberRoleForPart);
document.getElementById("cancelMemberEdit").addEventListener("click", clearMemberForm);
document.getElementById("buildForm").addEventListener("submit", handleBuildSubmit);
document.getElementById("cancelBuildEdit").addEventListener("click", clearBuildForm);
document.getElementById("openBuilds").addEventListener("click", () => {
  clearBuildForm();
  openDialog("buildDialog", "#buildNameInput");
});

document.getElementById("buildList").addEventListener("keydown", (event) => {
  const card = event.target.closest("[data-select-build]");
  if (!card) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectBuild(card.dataset.selectBuild);
  }
});

document.getElementById("copyTodayReport").addEventListener("click", () => {
  openReportDialog(buildTodayReport());
});

document.getElementById("copyReportText").addEventListener("click", () => {
  copyText(document.getElementById("reportText").value);
});

document.getElementById("syncForm").addEventListener("submit", (event) => {
  event.preventDefault();
  readSyncForm();
  if (syncConfig.mode === "sheet" && !syncConfig.webAppUrl) {
    setSyncStatus("error", "Apps Script Web App URL을 입력해 주세요.");
    showToast("Apps Script URL을 입력해 주세요.");
    return;
  }
  if (syncConfig.mode === "local") {
    setSyncStatus("local", "");
    showToast("브라우저 저장으로 설정했습니다.");
    return;
  }
  setSyncStatus(syncConfig.status === "error" ? "configured" : syncConfig.status, "Google Sheet 연결 설정을 저장했습니다.");
  showToast("데이터 연결 설정을 저장했습니다.");
});

document.getElementById("testSheetConnection").addEventListener("click", testSheetConnection);
document.getElementById("openSheetTestUrl").addEventListener("click", openSheetTestUrl);
document.getElementById("loadSheetState").addEventListener("click", loadSharedStateFromSheet);
document.getElementById("pushLocalState").addEventListener("click", () => {
  const confirmed = window.confirm("현재 브라우저의 빌드/팀원/티켓 데이터를 Google Sheet에 저장할까요?");
  if (confirmed) pushSharedStateToSheet();
});
document.getElementById("loadSheetStateMain").addEventListener("click", loadSharedStateFromSheet);
document.getElementById("pushLocalStateMain").addEventListener("click", () => {
  pushSharedStateToSheet();
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedOutside) dialog.close();
  });
});

lastSharedSignature = sharedStateSignature();
render();
if (!hasStoredLocalState && syncConfig.mode === "sheet" && syncConfig.webAppUrl) {
  window.setTimeout(autoLoadSharedStateFromSheet, 300);
}
