export default function InputComponent({
  id,
  placeholder,
  type,
  label,
  value,
  onChange,
  onKeyDown,
  onReset,
}: InputProps) {
  const searchStyle = id === 'search' ? 'input--search' : '';

  return (
    <div className="flex flex-col w-auto gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-['LeferiBaseRegular'] tracking-[0.8em] pl-4"
        >
          {label}
        </label>
      )}

      {/* 버튼 배치를 위해 relative 컨테이너 추가 */}
      <div className="relative w-full flex items-center">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          // 오른쪽 버튼 공간을 위해 pr-10(padding-right) 추가
          className={`w-full px-3 py-2 pr-10 rounded-md glass input ${searchStyle} focus:outline-none`}
        />

        {/* 값이 있고 onReset 함수가 전달되었을 때만 X 버튼 표시 */}
        {value && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="absolute right-3 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="입력 내용 삭제"
          >
            {/* 간단한 X 아이콘 (SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
