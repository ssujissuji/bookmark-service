import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import TextButton from './components/ui/TextButton';

export type ConfirmOptions = {
  /** 본문 메시지 (필수) */
  message: string;
  /** 상단 제목 (선택) */
  title?: string;
  /** 확인 버튼 라벨 (기본: 공통 '확인') */
  confirmText?: string;
  /** 취소 버튼 라벨 (기본: action.cancel) */
  cancelText?: string;
  /** 삭제 등 위험 동작이면 확인 버튼을 강조색으로 */
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

type Pending = ConfirmOptions & { resolve: (v: boolean) => void };

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<Pending | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setPending((prev) => {
        prev?.resolve(result);
        return null;
      });
    },
    [],
  );

  useEffect(() => {
    if (!pending) return;
    // 확인 버튼에 포커스
    confirmBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-10000 flex items-center justify-center"
            onClick={() => close(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              role="dialog"
              aria-modal="true"
              className="glass glass__dark relative z-10001 flex flex-col gap-8 w-[min(92vw,380px)] mx-auto px-8 pt-8 pb-6 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {pending.title && (
                <h2 className="w-full text-center">{pending.title}</h2>
              )}
              <p className="w-full text-center text-sm leading-relaxed whitespace-pre-line text-(--text-main)">
                {pending.message}
              </p>
              <div className="flex justify-center gap-6 pt-1">
                <TextButton
                  buttonName={pending.cancelText ?? t('action.cancel')}
                  className="button__text__folder tracking-[0.25em]"
                  onClick={() => close(false)}
                />
                <button
                  ref={confirmBtnRef}
                  type="button"
                  onClick={() => close(true)}
                  className={[
                    'button__text__folder tracking-[0.25em] cursor-pointer',
                    pending.danger ? 'text-(--text-hover)' : '',
                  ].join(' ')}
                >
                  {pending.confirmText ?? t('action.confirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within <ConfirmProvider>');
  }
  return ctx;
}
