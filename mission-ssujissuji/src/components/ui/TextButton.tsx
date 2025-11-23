import type React from 'react';

interface TextButtonProps {
  buttonName: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function TextButton({
  className,
  children,
  buttonName,
  onClick,
}: TextButtonProps) {
  const textStyle = className ? className : 'text-sm button__text';

  return (
    <button className={textStyle} onClick={onClick}>
      {children}
      <span className={textStyle}>{buttonName}</span>
    </button>
  );
}
