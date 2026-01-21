import { useEffect, useRef } from 'react';

type UseDragGhostDnDOptions = {
  draggedId?: string;

  payloadPrefix: 'folder' | 'bookmark';

  disabled?: boolean;

  onDragStartUI?: () => void;
  onDragEndUI?: () => void;

  /** 고스트 이미지 튜닝 */
  ghost?: {
    scale?: number; // 고스트 크기 (0~1)
    opacity?: number; // 고스트 투명도 (0~1)
    blurPx?: number;
    grayscale?: boolean;
    offsetX?: number; // setDragImage 오프셋
    offsetY?: number;
  };
};

export function useDragGhostDnD({
  draggedId,
  payloadPrefix,
  disabled = false,
  onDragStartUI,
  onDragEndUI,
  ghost,
}: UseDragGhostDnDOptions) {
  const dragImageRef = useRef<HTMLElement | null>(null);

  const cleanupGhost = () => {
    if (dragImageRef.current) {
      dragImageRef.current.remove();
      dragImageRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupGhost();
  }, []);

  const onDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (disabled) return;
    if (!draggedId) return;

    onDragStartUI?.();

    cleanupGhost();

    e.dataTransfer.setData(
      'text/plain',
      `${payloadPrefix}:${String(draggedId)}`,
    );
    e.dataTransfer.effectAllowed = 'move';

    try {
      const origin = e.currentTarget as HTMLElement;

      const scale = ghost?.scale ?? 0.6;
      const opacity = ghost?.opacity ?? 0.15;
      const blurPx = ghost?.blurPx ?? 0.6;
      const grayscale = ghost?.grayscale ?? true;

      // ✅ wrapper: "실제 박스 크기"를 scale만큼 줄임
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.style.width = `${origin.offsetWidth * scale}px`;
      wrapper.style.height = `${origin.offsetHeight * scale}px`;
      wrapper.style.overflow = 'hidden';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.zIndex = '-1';
      wrapper.style.opacity = String(opacity);
      wrapper.style.filter = `${grayscale ? 'grayscale(1) ' : ''}blur(${blurPx}px)`;

      const cloned = origin.cloneNode(true) as HTMLElement;
      cloned.style.transformOrigin = 'top left';
      cloned.style.transform = `scale(${scale})`;
      cloned.style.pointerEvents = 'none';

      wrapper.appendChild(cloned);
      document.body.appendChild(wrapper);
      dragImageRef.current = wrapper;

      // ✅ 여기서 한 번 강제로 레이아웃을 발생시키면(캡처 안정화) 도움이 됨
      wrapper.getBoundingClientRect();

      const offsetX = ghost?.offsetX ?? 10;
      const offsetY = ghost?.offsetY ?? 10;

      // ✅ setDragImage는 wrapper를 넘긴다
      e.dataTransfer.setDragImage(wrapper, offsetX, offsetY);

      setTimeout(() => cleanupGhost(), 0);
    } catch (err) {
      console.warn('setDragImage failed:', err);
    }
  };

  const onDragEnd = (_e: React.DragEvent<HTMLElement>) => {
    onDragEndUI?.();
    cleanupGhost();
  };

  return { onDragStart, onDragEnd };
}
