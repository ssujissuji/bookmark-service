import { useState } from 'react';
// import IconSelectComponent from './ui/IconInputComponent';
import InputComponent from './ui/InputComponent';
import TextButton from './ui/TextButton';

export default function FolderEditModal({
  type,
  initialValue = { name: '', desc: '' },
  onCancel,
  onSubmit,
}: {
  type: string;
  initialValue?: { name: string; desc: string };
  onCancel: () => void;
  onSubmit: (name: string, desc: string) => void;
}) {
  const option = type === 'new' ? '🆕 새로운 폴더 생성' : '🪄 폴더 수정';
  const [folderName, setFolderName] = useState(initialValue.name || '');
  const [folderDesc, setFolderDesc] = useState(initialValue.desc || '');

  return (
    <div className="glass glass__dark flex flex-col justify-between  gap-4 pt-8 px-16 rounded-2xl">
      <h2 className="px-39">{option}</h2>
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
            onChange={(e) => setFolderName(e.target.value)}
          />
          <InputComponent
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
          />
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
          buttonName="생성"
          className="button__text__folder tracking-[2.2em]"
          onClick={() => onSubmit(folderName, folderDesc)}
        />
      </div>
    </div>
  );
}
