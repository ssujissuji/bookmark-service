import { useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useBookmarksData } from '../BookmarksContext';
import { useConfirm } from '../ConfirmContext';
import { applyManualOrder } from '../utils/applyManualOrder';
import { findNodeById, findPathToNode } from '../utils/bookmarkTreeUtils';
import type { OutletContextType } from '../pages/DetailPage';

/**
 * 같은 부모를 공유하는 폴더끼리 순서를 재정렬한다.
 *
 * - 폴더↔폴더만 대상(북마크 드래그는 무시)
 * - 부모의 "전체 children"(폴더+북마크) 기준으로 재배치하므로 북마크 위치는 보존된다.
 * - recent/name 정렬 중이면 수동 정렬(manual) 전환 동의를 받고 전환한다.
 *
 * displayedFolderIds: 화면에 실제로 보이는 폴더 순서(홈 그리드처럼 정렬된 경우 전달).
 *   생략 시 크롬 네이티브 순서를 기준으로 사용(사이드바).
 */
export function useFolderReorder() {
  const { data, reloadBookmarks } = useBookmarksData();
  const confirm = useConfirm();
  const { t } = useTranslation();
  const { sortType, onChangeSort } = useOutletContext<OutletContextType>();

  return async function reorderFolder(
    draggedId: string,
    targetId: string,
    placeBelow: boolean,
    displayedFolderIds?: string[],
  ) {
    const dragged = String(draggedId);
    const target = String(targetId);
    if (dragged === target) return;

    const rootNodes = data?.[0]?.children ?? [];

    // 둘 다 폴더여야 함(북마크 드래그 제외)
    const draggedNode = findNodeById(rootNodes, dragged);
    const targetNode = findNodeById(rootNodes, target);
    if (!draggedNode || !targetNode) return;
    if (draggedNode.url || targetNode.url) return;

    // 같은 부모(형제)인지 확인
    const targetPath = findPathToNode(rootNodes, target);
    const draggedPath = findPathToNode(rootNodes, dragged);
    if (!targetPath || !draggedPath) return;
    const targetParent = targetPath[targetPath.length - 2];
    const draggedParent = draggedPath[draggedPath.length - 2];
    if (!targetParent || !draggedParent) return;
    const parentId = String(targetParent.id);
    if (String(draggedParent.id) !== parentId) return;

    const siblings: BookmarkTreeType[] = targetParent.children ?? [];
    const fullChildren = siblings.map((c) => String(c.id));
    const folderIds = siblings
      .filter((c) => !c.url)
      .map((c) => String(c.id));
    const folderSet = new Set(folderIds);

    // 화면에 보이는 폴더 순서(없으면 네이티브). 집합이 다르면 네이티브로 폴백.
    let displayed =
      displayedFolderIds?.map(String).filter((id) => folderSet.has(id)) ??
      folderIds;
    if (displayed.length !== folderIds.length) displayed = folderIds;

    // 드래그 적용 → 새 폴더 순서
    const without = displayed.filter((x) => x !== dragged);
    let insertAt = without.indexOf(target);
    if (insertAt === -1) return;
    if (placeBelow) insertAt += 1;
    without.splice(insertAt, 0, dragged);
    const newFolderSeq = without;

    // 전체 children에서 폴더 슬롯만 새 순서로 교체(북마크는 자리 유지)
    let fi = 0;
    const newFull = fullChildren.map((id) =>
      folderSet.has(id) ? newFolderSeq[fi++] : id,
    );
    if (newFull.join(' ') === fullChildren.join(' ')) return;

    if (sortType !== 'manual') {
      const ok = await confirm({
        title: t('sort.manual'),
        message: t('confirm.switchToManual'),
      });
      if (!ok) return;
      onChangeSort('manual');
    }

    try {
      await applyManualOrder(newFull, parentId, fullChildren);
      await reloadBookmarks();
      toast.success(t('toast.reordered'));
    } catch (err) {
      console.error('폴더 순서 변경 실패:', err);
      toast.error(t('toast.moveFailed'));
    }
  };
}
