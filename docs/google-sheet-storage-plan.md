# Google Sheet 저장소 설계 v1

이 문서는 `빌드 일정/진행 보드`를 팀원이 함께 쓰기 위해 Google Sheet에 어떤 데이터를 저장할지 정리한 기준안입니다.

## 기본 방향

- 기존 관리 툴은 그대로 사용하고, 이 보드는 기획자 체크와 리더 확인용 데이터만 저장합니다.
- 사람이 직접 시트를 자주 수정하기보다, 앱 화면에서 입력한 내용이 시트에 쌓이는 구조를 기준으로 합니다.
- 색상은 저장하지 않습니다. 색상은 앱에서 파트 기준으로 자동 결정합니다.
- 삭제는 즉시 행 삭제보다 `isArchived` 또는 `isActive` 값으로 숨기는 방식을 우선 사용합니다.
- 여러 명을 한 칸에 저장해야 하는 값은 `|`로 구분합니다. 예: `M002|M003`

## 시트 구성

Google Sheet 파일 하나 안에 아래 탭을 만듭니다.

| 시트명 | 용도 |
| --- | --- |
| `Settings` | 현재 빌드, 스키마 버전 같은 전역 설정 |
| `Builds` | 월간 업데이트 보드 정보 |
| `Members` | 기획팀/관리자 명단 |
| `Tickets` | 빌드별 담당 티켓과 현재 상태 |
| `Checkins` | 변동 없음, 상태 변경 같은 일일 확인 기록 |

## Settings

| 컬럼 | 설명 | 예시 |
| --- | --- | --- |
| `key` | 설정 이름 | `currentBuildId` |
| `value` | 설정 값 | `B001` |
| `updatedAt` | 수정 시간 | `2026-04-30T18:00:00+09:00` |

필수 값:

- `schemaVersion`: 현재는 `1`
- `currentBuildId`: 앱에서 기본으로 열 빌드 ID

## Builds

| 컬럼 | 설명 |
| --- | --- |
| `id` | 빌드 ID. 예: `B001` |
| `name` | 빌드명. 예: `5월 업데이트` |
| `devDueDate` | 개발 마감일 |
| `updateDate` | 업데이트 예정일 |
| `currentPhase` | `개발중`, `개발 완료`, `업데이트 완료` |
| `createdAt` | 생성 시간 |
| `updatedAt` | 수정 시간 |
| `isArchived` | 숨김 여부. `TRUE` 또는 `FALSE` |

지금 화면에서 쓰지 않는 `개발 시작일`, `리뷰일`은 Google Sheet 저장소에서는 제외합니다.

## Members

| 컬럼 | 설명 |
| --- | --- |
| `id` | 멤버 ID. 예: `M001` |
| `name` | 이름 |
| `part` | `시스템`, `밸런스`, `설정`, `콘텐츠`, `라이브`, `시나리오`, `관리` |
| `role` | `기획자`, `리더` |
| `initials` | 아바타에 표시할 이니셜 |
| `isActive` | 사용 여부. `TRUE` 또는 `FALSE` |
| `createdAt` | 생성 시간 |
| `updatedAt` | 수정 시간 |

규칙:

- `part`가 `관리`면 role은 자동으로 `리더`입니다.
- `part`가 `관리`가 아니면 role은 자동으로 `기획자`입니다.
- `관리` 파트는 업무 담당자/파트 필터에는 나오지 않습니다.

## Tickets

| 컬럼 | 설명 |
| --- | --- |
| `id` | 티켓 ID. 예: `T001` |
| `buildId` | 연결된 빌드 ID |
| `sourceUrl` | 기존 관리 툴 링크 |
| `name` | 티켓명 |
| `ownerId` | 담당 기획자 ID |
| `supportOwnerIds` | 추가 담당 기획자 ID 목록. 예: `M002|M003` |
| `workOwner` | 작업 담당/파트 메모 |
| `status` | `정상`, `이슈 있음`, `완료 확인 대기`, `완료` |
| `action` | 다음 액션 |
| `memo` | 현재 메모 |
| `lastStatusChangedAt` | 마지막 상태 변경 시간 |
| `lastCheckedAt` | 마지막 확인 시간 |
| `createdAt` | 생성 시간 |
| `updatedAt` | 수정 시간 |
| `isArchived` | 숨김 여부. `TRUE` 또는 `FALSE` |

다음 액션 값:

- `없음`
- `개발 확인 필요`
- `리더 확인 요청`
- `QA/빌드 확인 필요`
- `아트 폴리싱 진행중`
- `전투 밸런스 확인 필요`
- `보상 확정 필요`

## Checkins

| 컬럼 | 설명 |
| --- | --- |
| `id` | 기록 ID. 예: `C001` |
| `ticketId` | 대상 티켓 ID |
| `memberId` | 확인한 멤버 ID |
| `checkinType` | `변동 없음`, `상태 변경` |
| `previousStatus` | 이전 상태 |
| `newStatus` | 변경 후 상태 |
| `previousAction` | 이전 다음 액션 |
| `newAction` | 변경 후 다음 액션 |
| `memo` | 당시 메모 |
| `checkedAt` | 확인 시간 |

`Checkins`는 리더가 과거 흐름을 확인하거나, 나중에 "이번 빌드에서 이슈가 몇 번 발생했는지" 같은 분석을 할 때 사용합니다.

## 동기화 기준

- 앱 실행 시 `Settings`, `Builds`, `Members`, `Tickets`, `Checkins`를 읽어 화면 상태를 만듭니다.
- 티켓 등록, 상태 변경, 변동 없음, 담당자 변경, 빌드 변경, 멤버 변경 시 Google Sheet에 저장합니다.
- 저장에 실패하면 화면에는 실패 안내를 띄우고, 사용자가 다시 시도할 수 있게 합니다.
- 저장할 때는 먼저 시트 최신 데이터를 읽고 로컬 데이터와 합친 뒤 저장합니다. `Builds`, `Members`, `Tickets`는 `updatedAt`이 더 최신인 행을 남기고, `Checkins`는 ID 기준으로 합칩니다.
- 같은 티켓을 동시에 수정하면 더 최근 `updatedAt`을 가진 내용이 남습니다.

## 다음 구현 단계

1. Google Sheet에 템플릿 시트 5개를 만듭니다.
2. Apps Script 웹앱을 만들어 시트를 읽고 쓰는 API를 붙입니다.
3. 현재 `localStorage` 저장소를 Google Sheet API 저장소로 교체합니다.
4. 2~3명으로 실제 입력 테스트를 합니다.
