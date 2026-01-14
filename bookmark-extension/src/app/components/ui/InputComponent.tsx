import { useState } from 'react';

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
  const [isOverLimit, setIsOverLimit] = useState(false);
  const searchStyle = id === 'search' ? 'input--search' : '';
  const maxLength = 20;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length > maxLength) {
      setIsOverLimit(true);
    } else {
      setIsOverLimit(false);
    }
    onChange?.(e);
  };

  return (
    <div className="flex flex-col w-auto gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-['LeferiBaseRegular'] tracking-[0.8em] pl-2"
        >
          {label}
        </label>
      )}

      <div className="relative w-full flex flex-col items-start">
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          className={`flex w-full rounded-md glass input ${searchStyle} focus:outline-none`}
          maxLength={id === 'search' ? undefined : maxLength}
        />

        {id !== 'search' && (
          <div className="flex justify-between items-center mt-1 text-xs w-full px-2 pl-4">
            <span className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
              {typeof value === 'string' || Array.isArray(value)
                ? value.length
                : 0}
              /{maxLength}
            </span>
            <p
              className={`text-red-500 text-xs transition-opacity duration-200 ${
                isOverLimit ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={!isOverLimit}
            >
              글자 수 제한을 초과했습니다.
            </p>
          </div>
        )}

        {value && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="absolute right-3 text-gray-400 hover:text-gray-200 transition-colors top-1/2 transform -translate-y-1/2"
            aria-label="입력 내용 삭제"
          >
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
