import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, ExternalLink, Calendar, User, Activity } from 'lucide-react';
import DetailedAssessment from '../components/DetailedAssessment';
import supabase from '../lib/supabase';

interface Guideline {
  id: number;
  category: string;
  title: string;
  summary: string;
  min_age: number;
  max_age: number;
  sex: string;
  interval: string;
  modality: string;
  source: string;
  reviewed_date: string;
  details: string;
}

// Fallback static data so the page always has content
const fallbackGuidelines: Guideline[] = [
  {
    id: 1, category: 'Lung cancer',
    title: 'Low-Dose CT Screening for Lung Cancer',
    summary: 'Annual screening with low-dose computed tomography (LDCT) for adults aged 50 to 80 years who have a 20 pack-year smoking history and currently smoke or have quit within the past 15 years.',
    min_age: 50, max_age: 80, sex: 'All', interval: 'Annual', modality: 'Low-dose CT (LDCT)',
    source: 'USPSTF', reviewed_date: '2021',
    details: 'The USPSTF recommends annual screening for lung cancer with LDCT in adults aged 50 to 80 years who have a 20 pack-year smoking history and currently smoke or have quit within the past 15 years. Screening should be discontinued once a person has not smoked for 15 years or develops a health problem that substantially limits life expectancy or the ability or willingness to have curative lung surgery.'
  },
  {
    id: 2, category: 'Breast cancer',
    title: 'Mammography Screening for Breast Cancer',
    summary: 'Biennial screening mammography for women aged 40 to 74 years. Women should begin screening at age 40.',
    min_age: 40, max_age: 74, sex: 'Female', interval: 'Biennial', modality: 'Mammography',
    source: 'USPSTF', reviewed_date: '2024',
    details: 'The USPSTF recommends biennial screening mammography for women aged 40 to 74 years. This recommendation applies to women at average risk for breast cancer. Women who have a parent, sibling, or child with breast cancer are at higher risk and may benefit from beginning screening earlier. Additional imaging with breast MRI may be recommended for women with known genetic mutations (BRCA1/2).'
  },
  {
    id: 3, category: 'Cervical cancer',
    title: 'Cervical Cancer Screening with Cytology and HPV Testing',
    summary: 'Screening for cervical cancer in women aged 21 to 65 years with cytology (Pap smear) every 3 years or, for women 30 to 65, with a combination of cytology and HPV testing every 5 years.',
    min_age: 21, max_age: 65, sex: 'Female', interval: 'Every 3-5 years', modality: 'Pap smear / HPV testing',
    source: 'USPSTF', reviewed_date: '2018',
    details: 'The USPSTF recommends screening every 3 years with cervical cytology alone in women aged 21 to 29 years. For women aged 30 to 65 years, the USPSTF recommends screening every 3 years with cervical cytology alone, every 5 years with hrHPV testing alone, or every 5 years with hrHPV testing in combination with cytology (cotesting).'
  },
  {
    id: 4, category: 'Colorectal cancer',
    title: 'Screening for Colorectal Cancer',
    summary: 'Screening for colorectal cancer in all adults aged 45 to 75 years using stool-based tests, colonoscopy, or other approved methods.',
    min_age: 45, max_age: 75, sex: 'All', interval: 'Varies by modality', modality: 'Colonoscopy / FIT / sDNA-FIT',
    source: 'USPSTF', reviewed_date: '2021',
    details: 'The USPSTF recommends screening for colorectal cancer in all adults aged 45 to 75 years (Grade A for 50-75, Grade B for 45-49). Screening modalities include stool-based tests (FIT annually, sDNA-FIT every 1-3 years) and direct visualization tests (colonoscopy every 10 years, CT colonography every 5 years, flexible sigmoidoscopy every 5 years).'
  },
  {
    id: 5, category: 'Prostate cancer',
    title: 'PSA-Based Screening for Prostate Cancer',
    summary: 'For men aged 55 to 69 years, the decision to undergo periodic PSA-based screening should be an individual one based on shared decision-making.',
    min_age: 55, max_age: 69, sex: 'Male', interval: 'Individualized', modality: 'PSA blood test',
    source: 'USPSTF', reviewed_date: '2018',
    details: 'The USPSTF recommends that for men aged 55 to 69 years, the decision to undergo periodic PSA-based screening for prostate cancer should be an individual one. Before deciding whether to be screened, men should have an opportunity to discuss the potential benefits and harms of screening with their clinician and to incorporate their values and preferences in the decision. The USPSTF recommends against PSA-based screening in men 70 years and older.'
  },
  {
    id: 6, category: 'Skin cancer',
    title: 'Skin Cancer Prevention and Self-Examination',
    summary: 'Behavioral counseling for young adults aged 10 to 24 years with fair skin about minimizing UV exposure. Regular skin self-examination is encouraged for all adults.',
    min_age: 10, max_age: 100, sex: 'All', interval: 'Ongoing', modality: 'Counseling / Self-exam',
    source: 'USPSTF / CDC', reviewed_date: '2018',
    details: 'The USPSTF recommends counseling young adults, adolescents, children, and parents of young children about minimizing exposure to ultraviolet (UV) radiation for persons aged 6 months to 24 years with fair skin types to reduce their risk of skin cancer. Adults should ask a clinician about new moles, changes in existing moles, or sores that do not heal.'
  },
  {
    id: 7, category: 'CVD - Hypertension',
    title: 'Screening for High Blood Pressure in Adults',
    summary: 'Screening for high blood pressure in adults aged 18 years or older. Blood pressure should be confirmed outside of the clinical setting before starting treatment.',
    min_age: 18, max_age: 100, sex: 'All', interval: 'Annual or per visit', modality: 'Blood pressure measurement',
    source: 'USPSTF', reviewed_date: '2021',
    details: 'The USPSTF recommends screening for high blood pressure in adults aged 18 years or older. The USPSTF recommends obtaining blood pressure measurements outside of the clinical setting for diagnostic confirmation before starting treatment. Ambulatory blood pressure monitoring is the best method for confirming the diagnosis of hypertension.'
  },
  {
    id: 8, category: 'CVD - Diabetes',
    title: 'Screening for Prediabetes and Type 2 Diabetes',
    summary: 'Screening for prediabetes and type 2 diabetes in adults aged 35 to 70 years who have overweight or obesity.',
    min_age: 35, max_age: 70, sex: 'All', interval: 'Every 3 years', modality: 'A1C / Fasting glucose / OGTT',
    source: 'USPSTF', reviewed_date: '2021',
    details: 'The USPSTF recommends screening for prediabetes and type 2 diabetes in adults aged 35 to 70 years who have overweight or obesity. Clinicians should offer or refer patients with prediabetes to effective preventive interventions. Screening is done with fasting blood glucose, HbA1c, or an oral glucose tolerance test.'
  },
];

const categoryColors: Record<string, string> = {
  'Lung cancer': 'bg-sky-50 text-sky-700',
  'Breast cancer': 'bg-pink-50 text-pink-700',
  'Cervical cancer': 'bg-violet-50 text-violet-700',
  'Colorectal cancer': 'bg-emerald-50 text-emerald-700',
  'Prostate cancer': 'bg-amber-50 text-amber-700',
  'Skin cancer': 'bg-orange-50 text-orange-700',
  'CVD - Hypertension': 'bg-red-50 text-red-700',
  'CVD - Diabetes': 'bg-cyan-50 text-cyan-700',
};

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialCategory);
  const [ageFilter, setAgeFilter] = useState<number>(50);
  const [sexFilter, setSexFilter] = useState<string>('All');
  const [applyFilters, setApplyFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/guidelines');
        if (!res.ok || !(res.headers.get('content-type') || '').includes('application/json')) throw new Error();
        const data = await res.json();
        if (data && data.length > 0) {
          setGuidelines(data);
        } else {
          throw new Error('empty');
        }
      } catch {
        try {
          const { data } = await supabase.from('guidelines').select('*').order('category', { ascending: true });
          if (data && data.length > 0) {
            setGuidelines(data);
          } else {
            setGuidelines(fallbackGuidelines);
          }
        } catch {
          setGuidelines(fallbackGuidelines);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => { searchTerm ? setSearchParams({ category: searchTerm }) : setSearchParams({}); }, [searchTerm, setSearchParams]);

  const filtered = guidelines.filter(g => {
    const s = g.category.toLowerCase().includes(searchTerm.toLowerCase()) || g.title.toLowerCase().includes(searchTerm.toLowerCase()) || g.summary.toLowerCase().includes(searchTerm.toLowerCase());
    if (!applyFilters) return s;
    return s && ageFilter >= g.min_age && ageFilter <= g.max_age && (g.sex === 'All' || g.sex === sexFilter || sexFilter === 'All');
  });

  return (
    <div>
      <div className="bg-white border-b border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider mb-3">Library</p>
          <h1 className="text-4xl font-semibold text-[#1a1a2e] tracking-tight mb-3">Screening Guidelines</h1>
          <p className="text-[#64748b] max-w-lg">Search, filter, and review evidence-based screening recommendations across all conditions.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        <div className="card-static p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
            <input type="text" placeholder="Search conditions, guidelines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 placeholder:text-[#94a3b8]" />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={applyFilters} onChange={(e) => setApplyFilters(e.target.checked)} className="w-4 h-4 text-[#6366f1] rounded accent-[#6366f1]" />
              <span className="text-sm font-medium text-[#475569] whitespace-nowrap">Filter by demo</span>
            </label>
            {applyFilters && (<>
              <div className="flex items-center gap-2"><span className="text-sm text-[#64748b]">Age: {ageFilter}</span><input type="range" min="18" max="100" value={ageFilter} onChange={(e) => setAgeFilter(Number(e.target.value))} className="w-24 accent-[#6366f1]" /></div>
              <select value={sexFilter} onChange={(e) => setSexFilter(e.target.value)} className="py-2 px-3 bg-[#f0f2f5] rounded-xl text-sm"><option value="All">All</option><option value="Female">Female</option><option value="Male">Male</option></select>
            </>)}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6366f1] border-t-transparent mx-auto" /><p className="text-[#94a3b8] mt-4 text-sm">Loading guidelines...</p></div>
        ) : filtered.length === 0 ? (
          <div className="card-static p-16 text-center"><Search className="w-10 h-10 text-[#cbd5e1] mx-auto mb-4" /><h3 className="text-lg font-medium text-[#1a1a2e] mb-1">No guidelines found</h3><p className="text-[#64748b] text-sm">Try adjusting your filters or search term.</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((g) => (
              <div key={g.id} className="card-static overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 cursor-pointer flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center" onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}>
                  <div className="flex-grow">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold tracking-wide rounded-md mb-3 ${categoryColors[g.category] || 'bg-slate-50 text-slate-600'}`}>{g.category}</span>
                    <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">{g.title}</h3>
                    <p className="text-sm text-[#64748b] leading-relaxed">{g.summary}</p>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-44 shrink-0 flex-wrap md:flex-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748b] bg-[#f0f2f5] px-2.5 py-1.5 rounded-lg"><User className="w-3.5 h-3.5" />{g.min_age}-{g.max_age} yrs, {g.sex}</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748b] bg-[#f0f2f5] px-2.5 py-1.5 rounded-lg"><Calendar className="w-3.5 h-3.5" />{g.interval}</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748b] bg-[#f0f2f5] px-2.5 py-1.5 rounded-lg"><Activity className="w-3.5 h-3.5" />{g.modality}</div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#f1f5f9] shrink-0">
                    {expandedId === g.id ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
                  </div>
                </div>
                {expandedId === g.id && (
                  <div className="px-6 pb-6 pt-4 border-t border-black/[0.04] bg-[#f8f9fb]">
                    <h4 className="text-sm font-semibold text-[#1a1a2e] mb-2">Clinical Details</h4>
                    <p className="text-sm text-[#64748b] leading-relaxed mb-4">{g.details}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
                      <div className="text-xs text-[#94a3b8]"><span className="font-semibold text-[#64748b]">Source:</span> {g.source}, {g.reviewed_date}</div>
                      <button className="text-xs font-semibold text-[#6366f1] flex items-center gap-1">View Source <ExternalLink className="w-3 h-3" /></button>
                    </div>
                    <DetailedAssessment category={g.category} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
