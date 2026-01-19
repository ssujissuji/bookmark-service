import SelectItem from './SelectItem';

export default function SelectBox({
  className,
  onDelete,
  onModify,
}: {
  className?: string;
  onDelete?: () => void;
  onModify?: () => void;
}) {
  return (
    <div
      className={`select-box ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <SelectItem selectOption="삭제" onClick={onDelete} />
      <SelectItem selectOption="수정" onClick={onModify} />
    </div>
  );
}
