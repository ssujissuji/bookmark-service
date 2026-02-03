// src/app/components/home/ThemeSwitch.tsx
import { useEffect, useRef, useState } from 'react';
import type { ThemeId } from '../../utils/theme';

export type ThemePreset = {
  id: ThemeId;
  name: string;
  previewClass?: string; // 그라디언트/단색 미리보기
  previewImageUrl?: string; // 이미지 미리보기
};

type ThemeSwitchProps = {
  isOpen: boolean;
  onClose: () => void;

  themes: ThemePreset[];
  activeThemeId: ThemeId;
  onChangeTheme: (themeId: ThemeId) => void;
};

export default function ThemeSwitch({
  isOpen,
  onClose,
  themes,
  activeThemeId,
  onChangeTheme,
}: ThemeSwitchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const idx = Math.max(
      0,
      themes.findIndex((t) => t.id === activeThemeId),
    );
    setActiveIndex(idx);
  }, [activeThemeId, themes]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    itemRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [isOpen, activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;

    let rafId = 0;

    const updateActiveByScroll = () => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const itemCenterX = r.left + r.width / 2;
        const dist = Math.abs(centerX - itemCenterX);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });

      setActiveIndex(bestIdx);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveByScroll);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    updateActiveByScroll();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('scroll', onScroll);
    };
  }, [isOpen, themes.length]);

  const handleDotClick = (idx: number) => {
    itemRefs.current[idx]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });

    const theme = themes[idx];
    if (theme) onChangeTheme(theme.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="테마 선택 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="absolute bottom-0 left-0 right-0 h-[33vh] min-h-[260px] max-h-[420px] rounded-t-2xl p-4 flex flex-col glass__dark"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-(--text-main)">Theme</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-(--text-main) hover:bg-white/10 hover:text-(--text-muted)"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div
          ref={containerRef}
          className="
            mt-3 flex gap-3
            overflow-x-auto overscroll-x-contain
            snap-x snap-mandatory scroll-smooth
            px-3 pb-2
          "
        >
          {themes.map((theme, idx) => {
            const isCenterActive = idx === activeIndex;
            const isApplied = theme.id === activeThemeId;

            return (
              <button
                key={theme.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => onChangeTheme(theme.id)}
                className={`
                  snap-center shrink-0
                  w-[78%] sm:w-[60%]
                  rounded-2xl border p-3 text-left transition
                  ${isCenterActive ? 'border-white/50' : 'border-white/10'}
                  hover:border-white/30
                `}
                aria-current={isApplied ? 'true' : 'false'}
              >
                <div
                  className={`flex-1 min-h-[120px] sm:min-h-[150px] w-full rounded-xl border border-white/10 ${theme.previewImageUrl ? 'bg-center bg-cover' : (theme.previewClass ?? 'bg-zinc-800')}`}
                  style={
                    theme.previewImageUrl
                      ? { backgroundImage: `url(${theme.previewImageUrl})` }
                      : undefined
                  }
                />

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-(--text-main)">{theme.name}</div>
                  {isApplied ? (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
                      적용됨
                    </span>
                  ) : (
                    <span className="text-[11px] text-(--text-sub)">선택</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-center gap-2">
          {themes.map((t, idx) => {
            const isOn = idx === activeIndex;
            return (
              <button
                key={t.id}
                type="button"
                aria-label={`${t.name}로 이동`}
                onClick={() => handleDotClick(idx)}
                className={`
                  h-2 w-2 rounded-full transition
                  ${isOn ? 'bg-white/80' : 'bg-white/25 hover:bg-white/45'}
                `}
              />
            );
          })}
        </div>

        <div className="mt-3 text-center text-[11px] text-(--text-muted)">
          좌우로 넘기거나 카드를 눌러 테마를 즉시 적용할 수 있어요
        </div>
      </div>
    </div>
  );
}
