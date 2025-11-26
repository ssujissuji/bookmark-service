import TextButton from './TextButton';

interface SelectItemProps {
  selectOption: string;
}

export default function SelectItem({ selectOption }: SelectItemProps) {
  return (
    <>
      <div className="glass px-5 py-2 flex justify-center items-center">
        <TextButton
          className="text-base font-['LeferiBaseRegular'] tracking-widest text-(--color-main-white) hover:text-(--color-main-red) cursor-pointer"
          buttonName={selectOption}
        ></TextButton>
      </div>
    </>
  );
}
