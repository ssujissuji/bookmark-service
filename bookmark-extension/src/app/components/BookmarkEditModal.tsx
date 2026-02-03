import { useMemo, useState } from 'react';
import InputComponent from './ui/InputComponent';
import TextButton from './ui/TextButton';
import toast from 'react-hot-toast';

type ModalMode = 'new' | 'edit';

type BookmarkInitialValue = {
  title?: string;
  url?: string;
};

export type BookmarkSubmitValue = {
  title: string;
  url: string;
};

export default function BookmarkEditModal({
  mode,
  initialValue,
  onCancel,
  onSubmit,
}: {
  mode: ModalMode;
  initialValue?: BookmarkInitialValue;
  onCancel: () => void;
  onSubmit: (data: BookmarkSubmitValue) => void;
}) {
  const option =
    mode === 'new' ? '🆕 새로운 북마크 생성' : '🪄 북마크 설정 변경';

  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [url, setUrl] = useState(initialValue?.url ?? '');

  const maxTitleLength = 100;

  const countChars = (text: string) => Array.from(text).length;

  const normalizeUrl = (raw: string) => {
    const trimmed = raw.trim();

    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    return `https://${trimmed}`;
  };

  const titleError = useMemo(() => {
    const trimmed = title.trim();
    const len = countChars(trimmed);

    if (len === 0) return '북마크 이름을 입력해주세요.';
    if (len > maxTitleLength)
      return `북마크 이름은 최대 ${maxTitleLength}자까지 입력할 수 있어요.`;
    return '';
  }, [title]);

  const urlError = useMemo(() => {
    const trimmed = url.trim();
    if (trimmed.length === 0) return 'URL을 입력해주세요.';

    try {
      const normalized = normalizeUrl(trimmed);
      const parsed = new URL(normalized);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'http 또는 https URL만 입력할 수 있어요.';
      }

      return '';
    } catch {
      return 'URL 형식이 올바르지 않아요. 예) https://example.com';
    }
  }, [url]);

  // const hasError = titleError.length > 0 || urlError.length > 0;

  const handleSubmitClick = () => {
    if (titleError) {
      toast.error(titleError);
      return;
    }
    if (urlError) {
      toast.error(urlError);
      return;
    }

    const submitValue: BookmarkSubmitValue = {
      title: title.trim(),
      url: normalizeUrl(url),
    };

    onSubmit(submitValue);
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
          id="bookmark-title"
          placeholder="북마크 이름을 입력해주세요."
          label="북마크 이름"
          type="text"
          value={title}
          mode="bookmark"
          onChange={(e) => setTitle(e.target.value)}
        />

        <InputComponent
          id="bookmark-url"
          placeholder="https://example.com"
          label="URL"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-6 pt-2">
        <TextButton
          buttonName="취소"
          className="button__text__folder tracking-[0.25em]"
          onClick={onCancel}
        />
        <TextButton
          buttonName={mode === 'new' ? '생성' : '수정'}
          className="button__text__folder tracking-[0.25em]"
          onClick={handleSubmitClick}
        />
      </div>
    </div>
  );
}
