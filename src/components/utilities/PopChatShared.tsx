import { useEffect, useRef, useState } from 'react';
import { FiSmile } from 'react-icons/fi';

// ==========================================
// LINK BISA DIKLIK
// ==========================================
// Cocokkan URL http(s):// atau www. Hanya skema http/https yang diubah jadi link,
// jadi "javascript:" dan sejenisnya tidak pernah menjadi link aktif.
const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/gi;
const TRAILING_PUNCTUATION = /[.,!?;:)\]'"]$/;

interface LinkifiedTextProps {
  text: string;
  linkClassName?: string;
}

export function LinkifiedText({ text, linkClassName = 'underline' }: LinkifiedTextProps) {
  // split dengan capture group: bagian URL selalu berada di indeks ganjil
  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <span key={i}>{part}</span>;

        // pisahkan tanda baca di akhir kalimat dari URL-nya, mis. "kunjungi www.s3.com."
        let url = part;
        let trailing = '';
        while (url && TRAILING_PUNCTUATION.test(url)) {
          trailing = url.slice(-1) + trailing;
          url = url.slice(0, -1);
        }
        if (!url) return <span key={i}>{part}</span>;

        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        return (
          <span key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={`break-all ${linkClassName}`}
            >
              {url}
            </a>
            {trailing}
          </span>
        );
      })}
    </>
  );
}

// ==========================================
// EMOJI PICKER
// ==========================================
const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '🙂', '😉', '😍', '😘', '😎',
  '🤩', '🥳', '😇', '🤗', '🤔', '😅', '😋', '😜', '😮', '😱',
  '🥺', '😢', '😭', '😤', '😡', '😴', '🙃', '🤯', '👍', '👎',
  '👏', '🙌', '🙏', '💪', '👋', '🤝', '❤️', '💔', '🔥', '✨',
  '🎉', '🎁', '⭐', '✅', '❌', '⚠️', '❓', '💬', '📞', '📦',
  '🚚', '💳', '🛒', '🏷️', '💰', '📍', '🕐', '👌',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  variant?: 'light' | 'dark'; // light = widget customer, dark = dashboard
  iconSize?: number;
}

export function EmojiPicker({ onSelect, variant = 'light', iconSize = 20 }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Tutup saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isDark = variant === 'dark';
  const buttonCls = isDark
    ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
    : 'text-gray-600 hover:bg-red-50 hover:text-red-600';
  const panelCls = isDark
    ? 'border-zinc-800 bg-zinc-950'
    : 'border-black/10 bg-white';
  const itemCls = isDark ? 'hover:bg-zinc-800' : 'hover:bg-red-50';

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Pilih emoji"
        aria-expanded={open}
        className={`flex cursor-pointer items-center justify-center rounded-xl p-2.5 ${buttonCls}`}
      >
        <FiSmile size={iconSize} />
      </button>

      {open && (
        <div
          className={`absolute bottom-full left-0 z-20 mb-2 grid w-[264px] grid-cols-8 gap-0.5 rounded-xl border p-2 shadow-xl ${panelCls}`}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-lg leading-none ${itemCls}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}