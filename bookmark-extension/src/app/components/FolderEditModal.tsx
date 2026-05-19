import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const option = type === 'new' ? t('modal.createFolder') : t('modal.editFolder');
  const [folderName, setFolderName] = useState(initialValue || '');
  const maxLength = 20;

  const countChars = (text: string) => Array.from(text).length;

  const nameError = useMemo(() => {
    const trimmed = folderName.trim();
    const len = countChars(trimmed);

    if (len === 0) return t('error.folderNameEmpty');
    if (len > maxLength) return t('error.folderNameMax', { max: maxLength });
    return '';
  }, [folderName, t]);

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
              ? t('placeholder.folderName')
              : folderName.length > 0
                ? folderName
                : t('placeholder.folderNameEdit')
          }
          label={t('label.folderName')}
          type="text"
          value={folderName}
          mode="folder"
          onChange={(e) => setFolderName(e.target.value)}
        />
      </div>

      <div className="flex justify-center gap-6 pt-2">
        <TextButton
          buttonName={t('action.cancel')}
          className="button__text__folder tracking-[0.25em]"
          onClick={onCancel}
        />
        <TextButton
          buttonName={type === 'new' ? t('action.create') : t('action.edit')}
          className="button__text__folder tracking-[0.25em]"
          onClick={handleSubmitClick}
        />
      </div>
    </div>
  );
}
