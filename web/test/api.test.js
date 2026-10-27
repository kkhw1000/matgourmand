import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "../src/api.js";
import { mapStore } from "../src/storeData.js";

// 식당 목록에 필요한 지역·테마·가격·예약 가능 상태가 API 데이터에서 유지되는지 확인한다.
test("식당 API 응답이 목록 화면에서 사용할 정보로 변환된다", () => {
  const store = mapStore({
    id: 7,
    name: "성수 비스트로",
    address: "서울 성수동",
    description: "프렌치 다이닝",
    region: "성수",
    theme: "프렌치",
    averagePrice: 40000,
    status: "OPEN"
  });

  assert.equal(store.id, "7");
  assert.equal(store.region, "성수");
  assert.equal(store.theme, "프렌치");
  assert.equal(store.averagePrice, 40000);
  assert.equal(store.availableNow, true);
});

// 예약 상세 API의 성공 응답에서 화면이 사용할 data만 전달되는지 확인한다.
test("예약 API가 성공 응답의 데이터만 반환한다", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ success: true, data: { id: 42, status: "PENDING" } })
  });
  try {
    assert.deepEqual(await apiRequest("/api/reservations/42"), { id: 42, status: "PENDING" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// 시간대가 마감된 경우 서버 오류 메시지가 사용자에게 표시될 수 있도록 전달되는지 확인한다.
test("예약 API 오류는 서버 메시지로 전달된다", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    json: async () => ({ success: false, message: "선택한 시간대의 잔여석이 부족합니다." })
  });
  try {
    await assert.rejects(apiRequest("/api/reservations"), /잔여석이 부족합니다/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
