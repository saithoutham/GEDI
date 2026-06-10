import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, Circle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { evaluatePatient, type EligibilityResult } from '../utils/evaluatePatient';
import { detailedAssessments } from '../data/detailedAssessments';

type Step = 'profile' | 'results' | 'assessment' | 'centers';

interface AssessmentResult {
  category: string;
  status: string;
  message: string;
}

export default function Eligibility() {
  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('profile');

  // Profile form
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [smokingHistory, setSmokingHistory] = useState('');
  const [packsPerDay, setPacksPerDay] = useState('');
  const [yearsSmoked, setYearsSmoked] = useState('');
  const [quitYears, setQuitYears] = useState('');

  // Results
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [selectedScreenings, setSelectedScreenings] = useState<string[]>([]);

  // Detailed assessments
  const [currentAssessmentIdx, setCurrentAssessmentIdx] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);

  // Next steps
  const [expandedCenter, setExpandedCenter] = useState<string | null>(null);

  const steps = [
    { key: 'profile', label: 'Your Info' },
    { key: 'results', label: 'Results' },
    { key: 'assessment', label: 'Deep Dive' },
    { key: 'centers', label: 'Next Steps' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  // Handle profile submission
  const handleProfileSubmit = () => {
    const patientData = {
      age: parseInt(age),
      sex,
      smokingHistory,
      packsPerDay: parseFloat(packsPerDay) || 0,
      yearsSmoked: parseFloat(yearsSmoked) || 0,
      quitYears: parseFloat(quitYears) || 0,
    };
    const evalResults = evaluatePatient(patientData);
    setResults(evalResults);
    // Auto-select all "likely" results
    setSelectedScreenings(evalResults.filter(r => r.status === 'likely').map(r => r.category));
    setCurrentStep('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle screening selection
  const toggleScreening = (category: string) => {
    setSelectedScreenings(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // Move to assessment step
  const startAssessments = () => {
    // Only assess screenings that have detailed assessments available
    const assessable = selectedScreenings.filter(s => detailedAssessments[s]);
    if (assessable.length === 0) {
      // Skip to next steps if no detailed assessments are available
      setCurrentStep('centers');
    } else {
      setCurrentAssessmentIdx(0);
      setCurrentStep('assessment');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get assessable screenings
  const assessableScreenings = selectedScreenings.filter(s => detailedAssessments[s]);
  const currentAssessmentCategory = assessableScreenings[currentAssessmentIdx];
  const currentAssessmentData = currentAssessmentCategory ? detailedAssessments[currentAssessmentCategory] : null;

  // Handle assessment answer
  const handleAssessmentAnswer = (questionId: string, value: boolean) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [currentAssessmentCategory]: {
        ...(prev[currentAssessmentCategory] || {}),
        [questionId]: value,
      },
    }));
  };

  // Finish current assessment and move to next
  const finishCurrentAssessment = () => {
    if (currentAssessmentData) {
      const answers = assessmentAnswers[currentAssessmentCategory] || {};
      const result = currentAssessmentData.evaluate(answers);
      setAssessmentResults(prev => [...prev.filter(r => r.category !== currentAssessmentCategory), {
        category: currentAssessmentCategory,
        ...result,
      }]);
    }

    if (currentAssessmentIdx < assessableScreenings.length - 1) {
      setCurrentAssessmentIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentStep('centers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const statusColors: Record<string, string> = {
    'likely': 'bg-emerald-100 text-emerald-700',
    'discuss': 'bg-amber-100 text-amber-700',
    'unlikely': 'bg-slate-100 text-slate-600',
    'high-risk': 'bg-red-100 text-red-700',
    'standard': 'bg-emerald-100 text-emerald-700',
    'low-risk': 'bg-slate-100 text-slate-600',
  };

  const statusLabels: Record<string, string> = {
    'likely': 'Likely Eligible',
    'discuss': 'Discuss with Doctor',
    'unlikely': 'Not Indicated',
    'high-risk': 'Elevated Risk',
    'standard': 'Standard Risk',
    'low-risk': 'Low Risk',
  };

  const isProfileValid = age && sex && smokingHistory && (
    smokingHistory === 'Never' || (packsPerDay && yearsSmoked && (smokingHistory === 'Former' ? quitYears : true))
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-black/[0.06]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-semibold text-[#1a1a2e] tracking-tight mb-2">Screening Eligibility</h1>
          <p className="text-[#64748b]">Answer a few questions to find which preventive screenings may apply to you</p>

          {/* Step Progress */}
          <div className="flex items-center gap-2 mt-6">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === currentStepIndex ? 'bg-[#6366f1] text-white' :
                  i < currentStepIndex ? 'bg-[#6366f1]/10 text-[#6366f1]' :
                  'bg-[#f0f2f5] text-[#94a3b8]'
                }`}>
                  {i < currentStepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-[#6366f1]' : 'bg-[#e2e8f0]'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
        {/* ─── STEP 1: PROFILE ─── */}
        {currentStep === 'profile' && (
          <div className="card-static p-8 lg:p-10">
            <h2 className="text-xl font-semibold text-[#1a1a2e] mb-1">Tell us about yourself</h2>
            <p className="text-sm text-[#64748b] mb-8">This information stays in your browser Nothing is stored or sent to any server</p>

            <div className="space-y-6">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 bg-[#f0f2f5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 placeholder:text-[#94a3b8]"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Biological Sex</label>
                <div className="flex gap-3">
                  {['Male', 'Female'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSex(s)}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        sex === s
                          ? 'bg-[#6366f1] text-white shadow-md'
                          : 'bg-[#f0f2f5] text-[#475569] hover:bg-[#e8eaee]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smoking */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Smoking History</label>
                <div className="flex gap-3">
                  {['Never', 'Former', 'Current'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSmokingHistory(s)}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        smokingHistory === s
                          ? 'bg-[#6366f1] text-white shadow-md'
                          : 'bg-[#f0f2f5] text-[#475569] hover:bg-[#e8eaee]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smoking details */}
              {(smokingHistory === 'Current' || smokingHistory === 'Former') && (
                <div className="bg-[#f8f9fb] rounded-2xl p-6 space-y-4 border border-black/[0.04]">
                  <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider">Smoking Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Packs per day</label>
                      <input
                        type="number"
                        step="0.5"
                        value={packsPerDay}
                        onChange={e => setPacksPerDay(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 placeholder:text-[#94a3b8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Years smoked</label>
                      <input
                        type="number"
                        value={yearsSmoked}
                        onChange={e => setYearsSmoked(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full px-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 placeholder:text-[#94a3b8]"
                      />
                    </div>
                  </div>
                  {smokingHistory === 'Former' && (
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Years since quitting</label>
                      <input
                        type="number"
                        value={quitYears}
                        onChange={e => setQuitYears(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full px-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 placeholder:text-[#94a3b8]"
                      />
                    </div>
                  )}
                  {packsPerDay && yearsSmoked && (
                    <p className="text-xs text-[#64748b]">
                      Calculated pack-years: <strong>{(parseFloat(packsPerDay) * parseFloat(yearsSmoked)).toFixed(1)}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleProfileSubmit}
              disabled={!isProfileValid}
              className={`mt-8 w-full py-4 rounded-xl font-medium text-sm transition-all ${
                isProfileValid
                  ? 'bg-[#6366f1] text-white hover:bg-[#5558e6] shadow-lg shadow-indigo-200 cursor-pointer'
                  : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
              }`}
            >
              See My Results
            </button>
          </div>
        )}

        {/* ─── STEP 2: RESULTS ─── */}
        {currentStep === 'results' && (
          <div>
            <div className="card-static p-6 lg:p-8 mb-6">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-1">Your Screening Results</h2>
              <p className="text-sm text-[#64748b] mb-6">
                Based on your profile, here are the screenings that may apply to you
                Select the ones you want to explore further
              </p>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
                  <p className="text-[#64748b]">No screenings matched your profile Consider consulting your doctor for personalized advice</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.category}
                      onClick={() => toggleScreening(r.category)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedScreenings.includes(r.category)
                          ? 'border-[#6366f1] bg-[#6366f1]/[0.03]'
                          : 'border-transparent bg-[#f8f9fb] hover:bg-[#f0f2f5]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">
                          {selectedScreenings.includes(r.category) ? (
                            <CheckCircle2 className="w-5 h-5 text-[#6366f1]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#cbd5e1]" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[#1a1a2e]">{r.category}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                              {statusLabels[r.status]}
                            </span>
                          </div>
                          <p className="text-sm text-[#64748b] leading-relaxed">{r.reason}</p>
                          <p className="text-sm text-[#475569] mt-2 font-medium">{r.prompt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={() => { setCurrentStep('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#475569] rounded-xl text-sm font-medium hover:bg-[#f8f9fb] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={startAssessments}
                  disabled={selectedScreenings.length === 0}
                  className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedScreenings.length > 0
                      ? 'bg-[#6366f1] text-white hover:bg-[#5558e6] shadow-lg shadow-indigo-200 cursor-pointer'
                      : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
                  }`}
                >
                  Continue with {selectedScreenings.length} screening{selectedScreenings.length !== 1 ? 's' : ''}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: DETAILED ASSESSMENT ─── */}
        {currentStep === 'assessment' && currentAssessmentData && (
          <div>
            {/* Assessment progress */}
            <div className="flex items-center gap-3 mb-6">
              {assessableScreenings.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    i === currentAssessmentIdx ? 'bg-[#6366f1] text-white' :
                    i < currentAssessmentIdx ? 'bg-[#6366f1]/10 text-[#6366f1]' :
                    'bg-[#e2e8f0] text-[#94a3b8]'
                  }`}>
                    {s}
                  </div>
                  {i < assessableScreenings.length - 1 && <div className="w-4 h-0.5 bg-[#e2e8f0]" />}
                </div>
              ))}
            </div>

            <div className="card-static p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-1">
                {currentAssessmentCategory} - Detailed Assessment
              </h2>
              <p className="text-sm text-[#64748b] mb-6">
                Answer these follow-up questions to get a more precise risk assessment
              </p>

              {/* Key facts */}
              <div className="bg-[#f0f2f5] rounded-2xl p-5 mb-6">
                <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider mb-3">Key Facts</p>
                <ul className="space-y-2">
                  {currentAssessmentData.patientFacts.map((fact: string, i: number) => (
                    <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
                      <span className="text-[#6366f1] mt-0.5 shrink-0">&#x2022;</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {currentAssessmentData.questions.map((q: { id: string; patientText: string }) => {
                  const answers = assessmentAnswers[currentAssessmentCategory] || {};
                  return (
                    <div key={q.id} className="bg-[#f8f9fb] rounded-2xl p-5">
                      <p className="text-sm text-[#1a1a2e] font-medium mb-3">{q.patientText}</p>
                      <div className="flex gap-3">
                        {['Yes', 'No'].map(val => (
                          <button
                            key={val}
                            onClick={() => handleAssessmentAnswer(q.id, val === 'Yes')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              answers[q.id] === (val === 'Yes')
                                ? 'bg-[#6366f1] text-white shadow-md'
                                : 'bg-white text-[#475569] hover:bg-[#e8eaee]'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={finishCurrentAssessment}
                className="mt-8 w-full py-4 bg-[#6366f1] text-white rounded-xl font-medium text-sm hover:bg-[#5558e6] shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {currentAssessmentIdx < assessableScreenings.length - 1
                  ? `Next: ${assessableScreenings[currentAssessmentIdx + 1]}`
                  : 'View Results and Next Steps'
                }
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: FIND CENTERS ─── */}
        {currentStep === 'centers' && (
          <div>
            <div className="card-static p-6 lg:p-8 mb-6">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-1">Your Screening Plan</h2>
              <p className="text-sm text-[#64748b] mb-6">
                Here is a summary of your selected screenings with assessment results
                Review each screening below and use these prompts when talking with a licensed clinician
              </p>

              <div className="space-y-4">
                {selectedScreenings.map((category) => {
                  const result = results.find(r => r.category === category);
                  const assessment = assessmentResults.find(r => r.category === category);
                  const isExpanded = expandedCenter === category;

                  return (
                    <div key={category} className="rounded-2xl border border-black/[0.06] overflow-hidden">
                      <div
                        className="p-5 cursor-pointer flex items-center justify-between hover:bg-[#f8f9fb] transition-colors"
                        onClick={() => setExpandedCenter(isExpanded ? null : category)}
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-[#1a1a2e]">{category}</h3>
                            {assessment && (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[assessment.status]}`}>
                                {statusLabels[assessment.status] || assessment.status}
                              </span>
                            )}
                            {!assessment && result && (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[result.status]}`}>
                                {statusLabels[result.status]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#64748b]">
                            {assessment ? assessment.message : result?.reason}
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
                      </div>

                      {isExpanded && result && (
                        <div className="px-5 pb-5 border-t border-black/[0.04]">
                          <div className="bg-[#f8f9fb] rounded-xl p-4 mt-4 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider mb-1">What to ask your doctor</p>
                              <p className="text-sm text-[#475569]">{result.prompt}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider mb-1">How it works</p>
                              <p className="text-sm text-[#475569]">{result.howItWorks}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider mb-1">Insurance coverage</p>
                              <p className="text-sm text-[#475569]">{result.coverageNote}</p>
                            </div>
                          </div>
                          <Link
                            to="/guidelines"
                            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#6366f1] text-white rounded-xl text-sm font-medium hover:bg-[#5558e6] transition-colors"
                          >
                            Review Guidance for {category}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentStep('profile');
                  setResults([]);
                  setSelectedScreenings([]);
                  setAssessmentAnswers({});
                  setAssessmentResults([]);
                  setAge('');
                  setSex('');
                  setSmokingHistory('');
                  setPacksPerDay('');
                  setYearsSmoked('');
                  setQuitYears('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#475569] rounded-xl text-sm font-medium hover:bg-[#f8f9fb] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Start Over
              </button>
              <Link
                to="/guidelines"
                className="flex-grow flex items-center justify-center gap-2 py-3 bg-[#1a1a2e] text-white rounded-xl text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
              >
                Review All Guidelines
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
