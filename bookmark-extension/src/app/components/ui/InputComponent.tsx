export default function InputComponent({
  id,
  placeholder,
  type,
  label,
  value,
  onChange,
  onKeyDown,
  onCompositionEnd,
  onCompositionStart,
}: InputProps) {
  const searchStyle = id === 'search' ? 'input--search' : '';

  return (
    <div className="flex flex-col w-auto gap-2">
      <label
        htmlFor={id}
        className="text-sm font-['LeferiBaseRegular'] tracking-[0.8em] pl-4"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        className={`w-full px-3 py-2 rounded-md glass input ${searchStyle} focus:outline-none`}
      />
    </div>
  );
}
