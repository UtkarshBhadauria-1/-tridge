import React from 'react';
import {
  X,
  BookmarkCheck,
  ExternalLink,
  History,
  Calendar,
  Building2,
  Trash2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { Scheme } from '../types/scheme.ts';

interface TrackedSchemesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedSchemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  onViewDiff: (scheme: Scheme) => void;
}

export const TrackedSchemesDrawer: React.FC<TrackedSchemesDrawerProps> = ({
  isOpen,
  onClose,
  savedSchemes,
  onSelectScheme,
  onViewDiff,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracked-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="tracked-drawer-title" className="text-lg font-bold font-serif text-white">
                Tracked Schemes & Watchlist
              </h2>
              <p className="text-xs text-stone-400">
                {savedSchemes.length} scheme(s) saved in local persistent database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close tracked schemes drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative banner */}
        <div className="p-3 bg-stone-100 border-b border-stone-200 text-xs text-stone-700">
          <p>
            Schemes in your watchlist can be inspected for notice modifications against prior snapshots.
          </p>
        </div>

        {/* List of tracked schemes */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {savedSchemes.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <p className="font-semibold text-stone-700 text-sm">No schemes tracked yet</p>
              <p className="mt-1">
                Click "Track" on any scheme result card to add it to your watchlist for change monitoring.
              </p>
            </div>
          ) : (
            savedSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="border border-stone-200 rounded-xl p-3.5 bg-stone-50 hover:bg-white hover:border-amber-400 transition-all shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-stone-900 font-serif text-sm">
                    {scheme.name}
                  </h3>
                  {scheme.hasUpdatesNotice && (
                    <span className="shrink-0 text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      Diff Alert
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 text-stone-600">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{scheme.department}</span>
                </div>

                <div className="flex items-center space-x-2 text-stone-600">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Deadline: <strong>{scheme.deadline.dateText}</strong></span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-stone-500 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Snapshot: {new Date(scheme.retrievalTimestamp).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onClose();
                        onViewDiff(scheme);
                      }}
                      className="text-blue-700 font-bold hover:underline flex items-center space-x-1"
                    >
                      <History className="w-3 h-3" />
                      <span>Check Diff</span>
                    </button>
                    <a
                      href={scheme.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
