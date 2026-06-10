import { useEffect, useState } from 'react';
import { detailedAssessments } from '../data/detailedAssessments';
import { AlertCircle, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface DetailedAssessmentProps {
  category: string;
  onResultChange?: (result: { status: string; message: string } | null) => void;
}

export default function DetailedAssessment({ category, onResultChange }: DetailedAssessmentProps) {
  const assessment = detailedAssessments[category];
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{status: string, message: string} | null>(null);

  useEffect(() => {
    setAnswers({});
    setResult(null);
    onResultChange?.(null);
  }, [category]);

  if (!assessment) return null;

  const handleEvaluate = () => {
    const nextResult = assessment.evaluate(answers);
    setResult(nextResult);
    onResultChange?.(nextResult);
  };

  const isComplete = assessment.questions.every((q: any) => answers[q.id] !== undefined);

  return (
    <div className="mt-6 border-t border-black/[0.04] pt-6">
      <div className="mb-6 bg-[#f0f2f5] p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#6366f1]" />
          What you should know
        </h4>
        <ul className="space-y-2">
          {assessment.patientFacts.map((fact: string, i: number) => (
            <li key={i} className="text-sm text-[#475569] flex gap-2.5 items-start">
              <span className="text-[#6366f1] mt-0.5">&#x2022;</span>
              <span className="leading-relaxed">{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-[#f8f9fb] px-5 py-3 border-b border-black/[0.04]">
          <h4 className="text-sm font-semibold text-[#1a1a2e]">Eligibility Assessment</h4>
          <p className="text-xs text-[#94a3b8] mt-0.5">Determine if special screening pathways apply</p>
        </div>

        <div className="p-5 space-y-4">
          {assessment.questions.map((q: any) => (
            <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.04] last:border-0 last:pb-0">
              <label className="text-sm text-[#475569] font-medium leading-relaxed max-w-lg">
                {q.patientText || q.text}
              </label>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => setAnswers({...answers, [q.id]: true})}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${answers[q.id] === true ? 'bg-[#6366f1] text-white' : 'bg-[#f0f2f5] text-[#64748b] hover:bg-[#e8eaee]'}`}>Yes</button>
                <button type="button" onClick={() => setAnswers({...answers, [q.id]: false})}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${answers[q.id] === false ? 'bg-[#6366f1] text-white' : 'bg-[#f0f2f5] text-[#64748b] hover:bg-[#e8eaee]'}`}>No</button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#f8f9fb] p-5 border-t border-black/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#94a3b8]">{isComplete ? 'All criteria assessed' : 'Answer all questions to evaluate'}</span>
          <button type="button" onClick={handleEvaluate} disabled={!isComplete}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${isComplete ? 'bg-[#6366f1] hover:bg-[#5558e6] text-white cursor-pointer' : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'}`}>
            Evaluate <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {result && (
          <div className={`m-5 p-4 rounded-xl flex gap-3 ${result.status === 'high-risk' ? 'bg-amber-50/60 border border-amber-200/50 text-amber-900' : 'bg-[#6366f1]/[0.06] border border-[#6366f1]/20 text-[#1a1a2e]'}`}>
            {result.status === 'high-risk' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#6366f1]" />}
            <p className="text-sm font-medium leading-relaxed">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
