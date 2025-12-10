import { useRef, useState } from 'react';
import IconDefault from '../../assets/icon/bookmark.svg?react';
import Ellipsis from '../../assets/icon/ellipsis.svg?react';
import SelectBox from './SelectBox';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';

export default function BookmarkListItem({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      // rect는 viewport 기준 → body에 붙일 때 그대로 사용 가능
      setPos({
        top: rect.bottom + window.scrollY + 6, // 버튼 아래 6px 여백
        left: rect.right + window.scrollX - 130, // SelectBox 너비(130px)만큼 왼쪽으로
      });
    }

    setIsOpen(true);
  };

  return (
    <li className="flex relative justify-between items-center glass rounded-lg gap-4 px-6 py-3 glass--hover cursor-pointer min-w-[500px] ">
      <div className="flex items-center gap-4 ">
        <IconDefault width={20} height={20} />
        <Link
          to={url}
          className="text-base font-['LeferiBaseRegular'] align-middle"
          target="_blank"
        >
          {title}
        </Link>
      </div>
      <div
        ref={buttonRef}
        className="hover:text-(--color-gray-dark) cursor-pointer"
        onClick={handleOpen}
      >
        <Ellipsis />
      </div>
      {isOpen &&
        ReactDOM.createPortal(
          <>
            <div
              className="fixed inset-0 bg-transparent z-9998"
              onClick={() => setIsOpen(false)}
            ></div>

            <div
              className="fixed z-9999"
              style={{
                position: 'absolute',
                top: `${pos.top}px`,
                left: `${pos.left}px`,
              }}
            >
              <SelectBox />
            </div>
          </>,
          document.body,
        )}
    </li>
  );
}
