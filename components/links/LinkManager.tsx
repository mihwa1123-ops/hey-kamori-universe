'use client';

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ExternalLink,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhonePreview } from '@/components/preview/PhonePreview';
import type { AppliedTheme } from '@/lib/theme';
import {
  createLink,
  deleteLink,
  reorderLinks,
  toggleLinkPublic,
  updateLink,
} from '@/app/(admin)/admin/actions';

type LinkRow = {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  click_count: number;
  display_order: number;
  title_en: string | null;
  title_ja: string | null;
  title_es: string | null;
};

type LinkManagerProfile = {
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  footer_text: string | null;
};

type ModalState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; link: LinkRow };

export function LinkManager({
  links,
  profile,
  theme,
}: {
  links: LinkRow[];
  profile: LinkManagerProfile;
  theme: AppliedTheme;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<LinkRow[]>(links);
  const prevItemsRef = useRef<LinkRow[]>(links);
  const [modal, setModal] = useState<ModalState>({ kind: 'closed' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(links);
  }, [links]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (modal.kind !== 'closed') setModal({ kind: 'closed' });
      else if (deletingId) setDeletingId(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modal.kind, deletingId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const closeModal = () => {
    setModal({ kind: 'closed' });
    setFormError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modal.kind === 'closed') return;

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    const url = String(formData.get('url') ?? '').trim();
    const is_public = formData.get('is_public') === 'on';
    const title_en = String(formData.get('title_en') ?? '').trim() || null;
    const title_ja = String(formData.get('title_ja') ?? '').trim() || null;
    const title_es = String(formData.get('title_es') ?? '').trim() || null;

    setFormError(null);
    startTransition(async () => {
      const input = { title, url, is_public, title_en, title_ja, title_es };
      const result =
        modal.kind === 'create'
          ? await createLink(input)
          : await updateLink(modal.link.id, input);

      if (result.error) {
        setFormError(result.error);
        return;
      }
      closeModal();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(null);
    setTopError(null);
    startTransition(async () => {
      const result = await deleteLink(id);
      if (result.error) {
        setTopError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleToggle = (link: LinkRow) => {
    setTopError(null);
    startTransition(async () => {
      const result = await toggleLinkPublic(link.id, !link.is_public);
      if (result.error) {
        setTopError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((l) => l.id === active.id);
    const newIndex = items.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const snapshot = items;
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    prevItemsRef.current = reordered;
    setTopError(null);

    startTransition(async () => {
      const result = await reorderLinks(reordered.map((l) => l.id));
      if (result.error) {
        setItems(snapshot);
        prevItemsRef.current = snapshot;
        setTopError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const editing = modal.kind === 'edit' ? modal.link : null;

  return (
    <div className="lg:flex lg:gap-6 lg:items-start">
      <div className="flex-1 min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">내 링크</h2>
        <button
          type="button"
          onClick={() => setModal({ kind: 'create' })}
          className="inline-flex items-center gap-1 h-10 px-4 rounded-2xl bg-brand-lavender text-white text-sm font-medium
                     shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          링크 추가
        </button>
      </div>

      {topError && <p className="text-sm text-danger">{topError}</p>}

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
          <p className="text-sm text-neutral-500">+ 첫 링크를 추가해보세요</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {items.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  disabled={isPending}
                  onToggle={() => handleToggle(link)}
                  onEdit={() => setModal({ kind: 'edit', link })}
                  onDeleteRequest={() => setDeletingId(link.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {modal.kind !== 'closed' && (
        <Modal onClose={closeModal}>
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            {modal.kind === 'create' ? '링크 추가' : '링크 수정'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                제목 (1-40자)
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={40}
                defaultValue={editing?.title ?? ''}
                disabled={isPending}
                className="w-full h-12 rounded-lg border border-neutral-200 bg-white px-4 text-base text-neutral-900 placeholder-neutral-500
                           focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent
                           disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                required
                placeholder="https://…"
                defaultValue={editing?.url ?? ''}
                disabled={isPending}
                className="w-full h-12 rounded-lg border border-neutral-200 bg-white px-4 text-base text-neutral-900 placeholder-neutral-500
                           focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent
                           disabled:opacity-50"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                name="is_public"
                defaultChecked={editing?.is_public ?? true}
                disabled={isPending}
                className="w-4 h-4 rounded accent-brand-lavender"
              />
              공개하기
            </label>

            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 space-y-2">
              <p className="text-xs text-neutral-500">제목 번역 (선택)</p>
              {[
                { name: 'title_en', label: 'English', placeholder: 'e.g. Blog', val: editing?.title_en ?? '' },
                { name: 'title_ja', label: '日本語', placeholder: '例: ブログ', val: editing?.title_ja ?? '' },
                { name: 'title_es', label: 'Español', placeholder: 'ej. Blog', val: editing?.title_es ?? '' },
              ].map((f) => (
                <label key={f.name} className="block space-y-1">
                  <span className="text-xs text-neutral-500">{f.label}</span>
                  <input
                    type="text"
                    name={f.name}
                    maxLength={40}
                    defaultValue={f.val}
                    disabled={isPending}
                    placeholder={f.placeholder}
                    className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder-neutral-500
                               focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent
                               disabled:opacity-50"
                  />
                </label>
              ))}
            </div>

            {formError && <p className="text-sm text-danger">{formError}</p>}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="flex-1 h-12 rounded-2xl border border-neutral-200 text-neutral-700 font-medium
                           hover:bg-neutral-50 transition-colors
                           disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 h-12 rounded-2xl bg-brand-lavender text-white font-medium
                           shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200
                           disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isPending ? '저장 중…' : '저장'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <Modal onClose={() => setDeletingId(null)}>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            링크 삭제
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            이 링크를 삭제하시겠어요? 되돌릴 수 없어요.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              disabled={isPending}
              className="flex-1 h-12 rounded-2xl border border-neutral-200 text-neutral-700 font-medium
                         hover:bg-neutral-50 transition-colors
                         disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => handleDelete(deletingId)}
              disabled={isPending}
              className="flex-1 h-12 rounded-2xl bg-danger text-white font-medium
                         shadow-soft hover:shadow-hover transition-all duration-200
                         disabled:opacity-50"
            >
              {isPending ? '삭제 중…' : '삭제'}
            </button>
          </div>
        </Modal>
      )}
      </div>

      <aside className="hidden lg:block lg:w-80 lg:shrink-0 lg:sticky lg:top-6">
        <p className="text-xs text-neutral-500 text-center mb-2">실시간 미리보기</p>
        <PhonePreview profile={profile} links={items} theme={theme} />
      </aside>
    </div>
  );
}

function SortableLinkItem({
  link,
  disabled,
  onToggle,
  onEdit,
  onDeleteRequest,
}: {
  link: LinkRow;
  disabled: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft transition-opacity',
        !link.is_public && 'opacity-60',
        isDragging && 'z-10 shadow-hover scale-[1.02]'
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="순서 변경"
          className="touch-none cursor-grab text-neutral-400 hover:text-neutral-900 p-1 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-base font-medium text-neutral-900 truncate">
            {link.title}
          </p>
          <p className="text-xs text-neutral-500 truncate flex items-center gap-1">
            <ExternalLink className="w-3 h-3 shrink-0" />
            {link.url}
          </p>
          <p className="text-xs text-neutral-500">
            {link.click_count.toLocaleString()} clicks
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <label className="flex items-center cursor-pointer" aria-label="공개 여부">
            <input
              type="checkbox"
              checked={link.is_public}
              onChange={onToggle}
              disabled={disabled}
              className="sr-only peer"
            />
            <span
              className={cn(
                "relative w-10 h-6 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-lavender",
                "after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform",
                'peer-checked:after:translate-x-4'
              )}
            />
          </label>
          <button
            type="button"
            onClick={onEdit}
            aria-label="편집"
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDeleteRequest}
            aria-label="삭제"
            className="p-2 text-neutral-500 hover:text-danger hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-card">
        {children}
      </div>
    </div>
  );
}
