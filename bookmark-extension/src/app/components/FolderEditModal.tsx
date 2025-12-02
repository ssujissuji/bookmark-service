import IconSelectComponent from './ui/IconInputComponent';
import InputComponent from './ui/InputComponent';
import TextButton from './ui/TextButton';

export default function FolderEditModal({
  onClick,
  type,
}: {
  onClick: () => void;
  type: string;
}) {
  const option = type === 'new' ? '🆕 새로운 폴더 생성' : '🪄 폴더 수정';

  return (
    <div className="glass glass__dark flex flex-col justify-between  gap-4 pt-8 px-16 rounded-2xl">
      <h2 className="px-39">{option}</h2>
      <div className="flex justify-start items-center gap-10">
        <div className="flex flex-col w-full justify-between  gap-6">
          <InputComponent
            id="name"
            placeholder="폴더명을 입력해주세요."
            label="폴더명"
            type="text"
          />
          <InputComponent
            id="desc"
            placeholder="해당 폴더의 설명을 입력해주세요."
            label="설명"
            type="text"
          />
        </div>
        <IconSelectComponent />
      </div>
      <div className="flex px-40 pb-13 pt-8 gap-12" onClick={onClick}>
        <TextButton
          buttonName="취소"
          className=" button__text__folder tracking-[2.2em]"
        />
        <TextButton
          buttonName="생성"
          className="button__text__folder tracking-[2.2em]"
        />
      </div>
    </div>
  );
}
