import SelectItem from './SelectItem';

export default function SelectBox({
  className,
  onDelete,
}: {
  className?: string;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`select-box ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <SelectItem selectOption="삭제" onClick={onDelete} />
      <SelectItem selectOption="이름 변경" />
    </div>
  );
}
