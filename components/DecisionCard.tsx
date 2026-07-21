'use client';

import { ArrowRight } from 'lucide-react';
import type { ProjectDecision } from '@/lib/projects';

interface DecisionCardProps {
  id: string;
  decision: ProjectDecision;
}

export default function DecisionCard({ id, decision }: DecisionCardProps) {
  const questionId = `${id}-question`;

  return (
    <section
      id={id}
      aria-labelledby={questionId}
      className="mt-8 border border-gray-200 bg-gray-50 p-5 sm:p-6 lg:mt-10 lg:p-7"
      style={{ scrollMarginTop: '96px' }}
    >
      <div className="mb-5 lg:mb-6">
        <span className="inline-flex bg-orange-500 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-white sm:text-xs">
          THE DECISION
        </span>
      </div>

      <div
        id={questionId}
        role="heading"
        aria-level={2}
        className="mb-6 text-[clamp(1.35rem,2.4vw,2.15rem)] font-bold leading-[1.2] tracking-[-0.02em] text-black lg:mb-8"
      >
        {decision.question}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch">
        <div className="border border-gray-300 bg-white p-4 sm:p-5">
          <div className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-gray-400">
            REJECTED
          </div>
          <div className="text-sm font-medium leading-relaxed text-gray-500 line-through decoration-gray-400 decoration-2 sm:text-base">
            {decision.rejected.option}
          </div>
          <div className="mt-3 text-xs leading-relaxed text-gray-500 sm:text-sm">
            {decision.rejected.why}
          </div>
        </div>

        <div className="flex items-center justify-center text-orange-500">
          <ArrowRight
            aria-hidden="true"
            className="h-5 w-5 rotate-90 lg:rotate-0"
            strokeWidth={2}
          />
        </div>

        <div className="border-2 border-orange-500 bg-white p-4 sm:p-5">
          <div className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-orange-500">
            CHOSEN
          </div>
          <div className="text-sm font-bold leading-relaxed text-black sm:text-base">
            {decision.chosen.option}
          </div>
          <div className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
            {decision.chosen.why}
          </div>
        </div>
      </div>

      {decision.quote && (
        <div className="mt-6 border-t border-gray-200 pt-5 text-sm italic leading-relaxed text-gray-600 sm:text-base lg:mt-7 lg:pt-6">
          {decision.quote}
        </div>
      )}
    </section>
  );
}
