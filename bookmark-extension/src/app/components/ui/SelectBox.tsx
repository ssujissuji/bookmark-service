import SelectItem from './SelectItem';

export default function SelectBox({
  onDelete,
  onModify,
}: {
  onDelete?: () => void;
  onModify?: () => void;
}) {
  return (
    <div className="select-box" onClick={(e) => e.stopPropagation()}>
      <SelectItem
        className="rounded-t-lg"
        selectOption="수정"
        onClick={onModify}
      />
      <SelectItem
        className="rounded-b-lg"
        selectOption="삭제"
        onClick={onDelete}
      />
    </div>
  );
}
