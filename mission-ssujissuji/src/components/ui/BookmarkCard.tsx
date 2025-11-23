import { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';

export default function BookmarkCard({
  title,
  type,
  onClick,
}: {
  title: string;
  type: string;
  onClick: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4, // 버튼 아래 4px 여백
        left: rect.right - 120, // SelectBox의 너비 고려 (대충 120px 기준)
      });
    }
    setIsOpen(true);
  };

  return (
    <>
      {/* 북마크 폴더*/}
      <li
        className="flex relative justify-between items-center glass rounded-xl gap-4 px-6 py-4 w-full min-h-[120px] glass--hover"
        onClick={onClick}
      >
        <div className="flex gap-5  cursor-pointer">
          <IconDefault
            className={
              type === 'bookmarkBar'
                ? 'text-(--color-main-red)'
                : 'text-(--color-yellow)'
            }
            width={40}
            height={60}
          />
          <div className="flex flex-col justify-center rounded-xl gap-2">
            {type === 'bookmarkBar' && (
              <div className="w-fit px-1.5 py-1 bookmark-tag bookmark-tag__bar rounded-sm">
                bookmark-bar
              </div>
            )}
            {type === 'others' && (
              <div className="w-fit px-1.5 py-1 bookmark-tag bookmark-tag__other rounded-sm">
                others
              </div>
            )}
            <p className="text-xl font-['LeferiBaseBold']">{title}</p>
          </div>
        </div>
        <div
          ref={buttonRef}
          className="hover:text-(--color-gray-dark) cursor-pointer"
          onClick={handleOpen}
        >
          <Ellipsis />
        </div>
        {/* ✅ Portal로 SelectBox와 오버레이를 body로 렌더링 */}
        {isOpen &&
          ReactDOM.createPortal(
            <>
              {/* 화면 전체 덮는 오버레이 */}
              <div
                className="fixed inset-0 bg-transparent z-9998"
                onClick={() => setIsOpen(false)}
              ></div>

              {/* SelectBox는 고정된 위치에 띄우되, 절대 위치로 조정 */}
              <div
                className="absolute z-9999"
                style={{
                  top: `${pos.top}px`,
                  left: `${pos.left}px`,
                }}
              >
                <SelectBox onClick={() => setIsOpen(false)} />
              </div>
            </>,
            document.body,
          )}
      </li>
    </>
  );
}
