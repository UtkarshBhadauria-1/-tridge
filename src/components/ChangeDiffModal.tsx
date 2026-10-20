import React, { useEffect, useState } from 'react';
import {
  X,
  History,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle,
  FileDiff,
  Loader2,
} from 'lucide-react';
import type { Scheme, ChangeRecord } from '../types/scheme.ts';

interface ChangeDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
}

export const ChangeDiffModal: React.FC<ChangeDiffModalProps> = ({
  isOpen,
  onClose,
  scheme,
}) => {
  const [changeRecord, setChangeRecord] = useState<ChangeRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !scheme) return;

    setLoading(true);
    fetch('/api/schemes/check-changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheme }),
    })
      .then((res) => res.json())
      .then((data) => {
        setChangeRecord(data.changeRecord);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching scheme diff:', err);
        setLoading(false);
      });
  }, [isOpen, scheme]);

  if (!isOpen || !scheme) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-300 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold flex items-center space-x-1">
                <span>Snapshot Revision Comparison</span>
              </span>
              <h2
                id="diff-modal-title"
                className="text-base sm:text-lg font-bold font-serif text-white line-clamp-1"
              >
                Notice Change Detection: {scheme.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close diff modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer about snapshot vs continuous monitoring */}
        <div className="bg-blue-50/70 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Snapshot comparison:</strong> Compares the latest retrieved information against the previously recorded baseline in TRIDGE's persistent database. This is an on-demand snapshot inspection, not automated real-time government Gazette monitoring.
          </p>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-xs text-stone-600">Checking for notice modifications...</p>
            </div>
          ) : changeRecord ? (
            <>
              {/* Summary Banner */}
              <div
                className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
                  changeRecord.hasChanges
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1 font-bold">
                  {changeRecord.hasChanges ? (
                    <FileDiff className="w-4 h-4 text-amber-700" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                  )}
                  <span>
                    {changeRecord.hasChanges
                      ? 'Notice Changes Identified'
                      : 'No Changes Detected Against Saved Baseline'}
                  </span>
                </div>
                <p>{changeRecord.summary}</p>
              </div>

              {/* Diffs List */}
              {changeRecord.differences.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Detailed Field Changes:
                  </h3>
                  {changeRecord.differences.map((diff, index) => (
                    <div
                      key={index}
                      className="border border-stone-200 rounded-xl p-3 bg-stone-50 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>{diff.fieldName}</span>
                        </span>
                        <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          {diff.changeType}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded bg-rose-50/70 border border-rose-200 text-rose-900">
                          <span className="block text-[10px] font-bold uppercase text-rose-700 mb-0.5">
                            Previous Baseline:
                          </span>
                          <p className="line-clamp-4 leading-relaxed">{diff.previousValue}</p>
                        </div>

                        <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                          <span className="block text-[10px] font-bold uppercase text-emerald-700 mb-0.5">
                            Latest Retrieved:
                          </span>
                          <p className="line-clamp-4 leading-relaxed">{diff.newValue}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                        <span>{diff.notes}</span>
                        <a
                          href={diff.supportingSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-semibold hover:underline flex items-center space-x-1"
                        >
                          <span>Supporting Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-stone-600 p-4 border border-stone-200 rounded-xl bg-stone-50">
                  <p>
                    All eligibility criteria, application deadlines, benefits, and required document checklists match the previous verified snapshot for this scheme.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Close Diff View
          </button>
        </div>
      </div>
    </div>
  );
};
