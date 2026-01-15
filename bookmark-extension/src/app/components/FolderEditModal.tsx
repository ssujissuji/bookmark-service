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
    <div className="glass glass__dark flex flex-col justify-between  gap-4 pt-8 px-16 rounded-2xl">
      <h2 className="w-full flex justify-center items-center">{option}</h2>
      <div className="flex justify-start items-center gap-10">
        <div className="flex flex-col w-full justify-between  gap-6">
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
          {/* <InputComponent
            id="desc"
            placeholder={
              type === 'new'
                ? '해당 폴더의 설명을 입력해주세요.'
                : folderDesc.length > 0
                  ? folderDesc
                  : '수정할 폴더의 설명을 입력해주세요.'
            }
            label="설명"
            type="text"
            value={folderDesc}
            onChange={(e) => setFolderDesc(e.target.value)}
          /> */}
        </div>
        {/* <IconSelectComponent /> */}
      </div>
      <div className="flex px-40 pb-13 pt-8 gap-12">
        <TextButton
          buttonName="취소"
          className=" button__text__folder tracking-[2.2em]"
          onClick={onCancel}
        />
        <TextButton
          buttonName={type === 'new' ? '생성' : '수정'}
          className="button__text__folder tracking-[2.2em]"
          onClick={handleSubmitClick}
        />
      </div>
    </div>
  );
}
