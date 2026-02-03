import React, { useMemo, useState } from 'react';
import ThemeSwitch, { ThemePreset } from '../ui/ThemeSwitch';
import type { ThemeId } from '../../utils/theme';

import ImgDefault from '../../assets/images/bg-black_figure.webp';
import ImgDark from '../../assets/images/bg-black_some.webp';
import ImgBed from '../../assets/images/bg-bed.webp';
import ImgHologram from '../../assets/images/bg-hologram.webp';
import ImgSnow from '../../assets/images/bg-snow.webp';

type FooterProps = {
  activeThemeId: ThemeId;
  onChangeTheme: (themeId: ThemeId) => void;
  storeUrl?: string;
  teamName?: string;
  contactUrl?: string;
};

export default function Footer({
  activeThemeId,
  onChangeTheme,
  storeUrl = 'https://chromewebstore.google.com/detail/bookmark-extension/gibfpdopdjmfjfablclemgpbfgihlbne?authuser=0&hl=ko',
  teamName = 'buttonn_',
  contactUrl = 'https://www.notion.so/chrome-bookmark-extension-2f8ea2795d2d808f9a96dc45df7611d1?source=copy_link',
}: FooterProps) {
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const themes: ThemePreset[] = useMemo(
    () => [
      {
        id: 'default',
        name: 'Default',
        previewImageUrl: ImgDefault,
      },
      {
        id: 'dark',
        name: 'Dark',
        previewImageUrl: ImgDark,
      },
      {
        id: 'bed',
        name: 'Bed',
        previewImageUrl: ImgBed,
      },
      {
        id: 'hologram',
        name: 'Hologram',
        previewImageUrl: ImgHologram,
      },
      {
        id: 'snow',
        name: 'Snow',
        previewImageUrl: ImgSnow,
      },
    ],
    [],
  );

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/30 backdrop-blur-md h-12">
        <div className="mx-auto flex h-12 items-center justify-between px-4 text-[12px] text-white/80">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate">
              © {new Date().getFullYear()} {teamName}
            </span>
            <span className="text-white/30">|</span>
            <a
              className="truncate hover:text-white transition"
              // href={`mailto:${contactEmail}`}
              href={`${contactUrl}`}
              title={contactUrl}
            >
              {'업데이트 제안 및 오류 접수처(Notion)'}
            </a>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline hover:text-white transition"
            >
              Chrome Web Store
            </a>

            <div className="ml-1 flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-1 py-1">
              <IconButton
                label="테마 변경"
                onClick={() => setIsThemeOpen(true)}
              >
                ☾
              </IconButton>
            </div>
          </div>
        </div>
      </footer>

      {/* ThemeSwitch (bottom sheet) */}
      <ThemeSwitch
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        themes={themes}
        activeThemeId={activeThemeId}
        onChangeTheme={(id) => {
          onChangeTheme(id);
          // setIsThemeOpen(false);
        }}
      />
    </>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="
        grid h-8 w-8 place-items-center
        rounded-lg text-white/80
        hover:bg-white/10 hover:text-white
        active:bg-white/15 transition
      "
    >
      {children}
    </button>
  );
}
