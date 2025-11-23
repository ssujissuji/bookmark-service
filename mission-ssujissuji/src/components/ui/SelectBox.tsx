import SelectItem from './SelectItem';

export default function SelectBox({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`select-box ${className}`} onClick={onClick}>
      <SelectItem selectOption="삭제" />
      <SelectItem selectOption="이름 변경" />
    </div>
  );
}
