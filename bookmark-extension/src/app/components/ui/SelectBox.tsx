import { useTranslation } from 'react-i18next';
import SelectItem from './SelectItem';

export default function SelectBox({
  onDelete,
  onModify,
}: {
  onDelete?: () => void;
  onModify?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="select-box" onClick={(e) => e.stopPropagation()}>
      <SelectItem
        className="rounded-t-lg"
        selectOption={t('action.edit')}
        onClick={onModify}
      />
      <SelectItem
        className="rounded-b-lg"
        selectOption={t('action.delete')}
        onClick={onDelete}
      />
    </div>
  );
}
