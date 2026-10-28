/**
 * 화면에 보이는 순서(orderedIds)를 크롬 북마크의 실제 순서로 반영한다.
 *
 * 각 항목을 index 0, 1, 2...로 "왼쪽부터 순차 지정"하므로, 매 이동은 항상
 * 현재 위치보다 같거나 앞선 index로만 일어난다. 크롬 `move`의 off-by-one
 * (같은 폴더 안에서 더 뒤 index로 옮길 때 한 칸 밀리는 문제)은 "뒤로 이동"에서만
 * 발생하므로, 이 방식은 보정 없이 항상 정확하다.
 *
 * currentOrder를 주면 이미 일치하는 앞부분(prefix)은 건너뛰어 불필요한 move를 줄인다.
 */
export async function applyManualOrder(
  orderedIds: string[],
  parentId: string,
  currentOrder?: string[],
) {
  let start = 0;
  if (currentOrder) {
    while (
      start < orderedIds.length &&
      orderedIds[start] === currentOrder[start]
    ) {
      start += 1;
    }
  }

  for (let i = start; i < orderedIds.length; i += 1) {
    await chrome.bookmarks.move(orderedIds[i], { parentId, index: i });
  }
}
