import { useMemo, useState } from 'react';
// import IconSelectComponent from './ui/IconInputComponent';
import InputComponent from './ui/InputComponent';
import TextButton from './ui/TextButton';
import toast from 'react-hot-toast';

export default function FolderEditModal({
  type,
  initialValue,
  onCancel,
  onSubmit,
}: {
  type: string;
  initialValue?: string;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}) {
  const option = type === 'new' ? '🆕 새로운 폴더 생성' : '🪄 폴더 수정';
  const [folderName, setFolderName] = useState(initialValue || '');
  const maxLength = 20;

  const countChars = (text: string) => Array.from(text).length;

  const nameError = useMemo(() => {
    const trimmed = folderName.trim();
    const len = countChars(trimmed);

    if (len === 0) return '폴더명을 입력해주세요.';
    if (len > maxLength)
      return `폴더명은 최대 ${maxLength}자까지 입력할 수 있어요.`;
    return '';
  }, [folderName]);

  const hasError = nameError.length > 0;

  const handleSubmitClick = () => {
    if (hasError) {
      toast.error(nameError);
      return;
    }
    onSubmit(folderName.trim());
  };

  return (
    <div
      className="
    glass glass__dark
    flex flex-col gap-8
    w-[min(92vw,420px)] sm:w-[480px]
    mx-auto
    px-6 sm:px-10
    pt-8 pb-6
    rounded-2xl
  "
    >
      <h2 className="w-full text-center">{option}</h2>

      <div className="flex flex-col gap-6">
        <InputComponent
          id="name"
          placeholder={
            type === 'new'
              ? '폴더명을 입력해주세요.'
              : folderName.length > 0
                ? folderName
                : '수정할 폴더명을 입력해주세요.'
          }
          label="폴더명"
          type="text"
          value={folderName}
          mode="folder"
          onChange={(e) => setFolderName(e.target.value)}
        />
      </div>

      {/* 버튼 영역: 가운데 정렬 + 폭 안정 */}
      <div className="flex justify-center gap-6 pt-2">
        <TextButton
          buttonName="취소"
          className="button__text__folder tracking-[0.25em]"
          onClick={onCancel}
        />
        <TextButton
          buttonName={type === 'new' ? '생성' : '수정'}
          className="button__text__folder tracking-[0.25em]"
          onClick={handleSubmitClick}
        />
      </div>
    </div>
  );
}
