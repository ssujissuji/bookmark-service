import TextButton from './TextButton';

interface SelectItemProps {
  className: string;
  selectOption: string;
  onClick?: () => void;
}

export default function SelectItem({
  className,
  selectOption,
  onClick,
}: SelectItemProps) {
  return (
    <>
      <div
        className={`glass px-5 py-2 flex justify-center items-center ${className}`}
      >
        <TextButton
          className="text-base font-['LeferiBaseRegular'] tracking-widest text-(--color-main-white) hover:text-(--color-main-red) cursor-pointer"
          buttonName={selectOption}
          onClick={onClick}
        ></TextButton>
      </div>
    </>
  );
}
