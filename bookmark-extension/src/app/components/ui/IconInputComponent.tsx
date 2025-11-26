import { useState } from 'react';
import bookmark_red from '../../assets/icon/red.png';
import bookmark_blue from '../../assets/icon/blue.png';
import bookmark_green from '../../assets/icon/green.png';
import bookmark_pink from '../../assets/icon/pink.png';

interface OpitonProps {
  value: string;
  label: string;
  icon: string;
}

export default function IconSelectComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OpitonProps>({
    value: 'default',
    label: 'default',
    icon: bookmark_red,
  });

  const options = [
    {
      value: 'default',
      label: 'default',
      icon: bookmark_red,
    },
    {
      value: 'blue',
      label: 'blue',
      icon: bookmark_blue,
    },
    {
      value: 'green',
      label: 'green',
      icon: bookmark_green,
    },
    {
      value: 'pink',
      label: 'pink',
      icon: bookmark_pink,
    },
  ];

  const handleOptionClick = (option: OpitonProps) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-2 max-w-30 relative">
      <p className="text-sm font-['LeferiBaseRegular'] tracking-[0.8em]">
        아이콘
      </p>
      <div className="glass p-8 ">
        <button onClick={() => setIsOpen(!isOpen)}>
          <img
            src={selectedOption.icon}
            alt={selectedOption.label}
            width={50}
            height={50}
          />{' '}
          {/* {selectedOption.label} */}
        </button>
      </div>
      {isOpen && (
        <ul className="absolute top-1/2 left-full translate-x-3 -translate-y-1/3 flex flex-col gap-2">
          {options.map((option) => (
            <li
              className="glass icon-select-list p-2"
              key={option.value}
              onClick={() => handleOptionClick(option)}
            >
              <img
                src={option.icon}
                alt={option.label}
                width={20}
                height={20}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
