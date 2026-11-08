'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Compass, Loader2, Trash2 } from 'lucide-react';
import { BucketListItem } from '@/hooks/useBucketList';
import { listItem } from '@/lib/motion';
import { useLanguage } from '@/context/LanguageContext';

interface BucketListPanelProps {
  items: BucketListItem[];
  isLoading?: boolean;
  busyId?: number | null;
  onMarkVisited: (item: BucketListItem) => void;
  onRemove: (item: BucketListItem) => void;
}

export default function BucketListPanel({
  items,
  isLoading = false,
  busyId = null,
  onMarkVisited,
  onRemove,
}: BucketListPanelProps) {
  const { t } = useLanguage();
  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        <div className="h-14 animate-shimmer rounded-xl" />
        <div className="h-14 animate-shimmer rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/15 px-5 py-4">
        <Compass className="h-8 w-8 text-slate-500" />
        <div>
          <p className="text-sm font-medium text-slate-300">{t('bucket.emptyTitle')}</p>
          <p className="text-sm text-slate-500">
            {t('bucket.emptyText')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            variants={listItem}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]"
          >
            {item.flagUrl ? (
              <Image src={item.flagUrl} alt="" width={24} height={16} className="h-4 w-6 flex-shrink-0 rounded-sm object-cover" />
            ) : (
              <span className="flex h-4 w-6 flex-shrink-0 items-center justify-center rounded-sm bg-slate-700 text-[8px] font-bold text-slate-300">
                {item.countryCode}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{item.countryName}</p>
              {item.notes && (
                <p className="truncate text-xs text-slate-400">{item.notes}</p>
              )}
            </div>

            <button
              onClick={() => onMarkVisited(item)}
              disabled={busyId === item.id}
              className="btn-secondary !rounded-lg px-2.5 py-1.5 text-xs text-teal-300 hover:text-teal-200"
              title={t('bucket.wentThereTitle')}
            >
              {busyId === item.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('bucket.wentThere')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onRemove(item)}
              disabled={busyId === item.id}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
              aria-label={t('table.removeAria', { name: item.countryName })}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
