import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  BarChart,
  Eye,
  FileEdit,
  Send,
  Star,
  Download,
} from 'lucide-react';
import { FormsSurveyIcon } from '../icons/AppIcons';
import { FormQuestion, FormSubmission } from '../../types/suite';
import { storage } from '../../services/storage';

interface FormsSurveyAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

export const FormsSurveyApp: React.FC<FormsSurveyAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const formsData = storage.getForms();
  const [formId, setFormId] = useState<string>('form-1');
  const [activeTab, setActiveTab] = useState<'questions' | 'preview' | 'responses'>('questions');

  const currentForm = formsData[formId] || formsData['form-1'];
  const [title, setTitle] = useState<string>(currentForm.title);
  const [description, setDescription] = useState<string>(currentForm.description);
  const [questions, setQuestions] = useState<FormQuestion[]>(currentForm.questions);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(currentForm.submissions || []);

  // Preview form fill state
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const saveFormState = (newQs = questions, newSubs = submissions) => {
    const updated = {
      ...formsData,
      [formId]: {
        id: formId,
        title,
        description,
        questions: newQs,
        submissions: newSubs,
        updatedAt: 'Just now',
      },
    };
    storage.saveForms(updated);
  };

  const addQuestion = (type: FormQuestion['type']) => {
    const newQ: FormQuestion = {
      id: `q-${Date.now()}`,
      type,
      title:
        type === 'choice'
          ? isAr ? 'ما هو خيارك المفضل؟' : 'Which option do you prefer?'
          : type === 'rating'
          ? isAr ? 'كيف تقيم التجربة؟' : 'How would you rate your experience?'
          : isAr ? 'أدخل إجابتك هنا...' : 'Please describe in detail...',
      required: true,
      options: type === 'choice' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    saveFormState(updated);
  };

  const removeQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    saveFormState(updated);
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: FormSubmission = {
      id: `sub-${Date.now()}`,
      submittedAt: 'Just now',
      answers: { ...previewAnswers },
    };

    const updatedSubs = [newSub, ...submissions];
    setSubmissions(updatedSubs);
    saveFormState(questions, updatedSubs);
    setSubmittedSuccess(true);
    setPreviewAnswers({});
  };

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <FormsSurveyIcon className="w-8 h-8 shrink-0" />
          <div>
            <h1 className="font-bold text-sm text-gray-900">{isAr ? 'استبيانات SNNS Forms' : 'SNNS Forms & Survey'}</h1>
            <p className="text-[11px] text-gray-500">
              {questions.length} {isAr ? 'أسئلة' : 'questions'} • {submissions.length} {isAr ? 'ردود مستلمة' : 'responses'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
              activeTab === 'questions' ? 'bg-white text-[#038387] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>{isAr ? 'الأسئلة' : 'Questions'}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('preview');
              setSubmittedSuccess(false);
            }}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
              activeTab === 'preview' ? 'bg-white text-[#038387] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاينة وتجربة' : 'Preview & Fill'}</span>
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
              activeTab === 'responses' ? 'bg-white text-[#038387] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart className="w-3.5 h-3.5" />
            <span>{isAr ? 'النتائج والتحليلات' : 'Responses'} ({submissions.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-6 overflow-y-auto">
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-t-8 border-t-[#038387] border-x border-b border-gray-200">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  saveFormState();
                }}
                className="w-full font-bold text-xl sm:text-2xl text-gray-900 focus:outline-none border-b border-transparent focus:border-teal-500 pb-1"
                placeholder={isAr ? 'عنوان الاستبيان...' : 'Form Title...'}
              />
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  saveFormState();
                }}
                className="w-full text-xs text-gray-500 focus:outline-none mt-2 resize-none"
                rows={2}
                placeholder={isAr ? 'وصف تفصيلي للغرض من الاستبيان...' : 'Form description...'}
              />
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-xs text-[#038387]">{idx + 1}.</span>
                    <input
                      type="text"
                      value={q.title}
                      onChange={(e) => {
                        const newQs = [...questions];
                        newQs[idx].title = e.target.value;
                        setQuestions(newQs);
                        saveFormState(newQs);
                      }}
                      className="flex-1 font-semibold text-xs text-gray-800 focus:outline-none border-b border-transparent focus:border-teal-400"
                    />
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {q.type === 'choice' && (
                    <div className="space-y-2 pl-4">
                      {q.options?.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block" />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newQs = [...questions];
                              if (newQs[idx].options) newQs[idx].options[oIdx] = e.target.value;
                              setQuestions(newQs);
                              saveFormState(newQs);
                            }}
                            className="bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div className="flex gap-2 pl-4 py-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-amber-300 text-amber-400" />
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <div className="pl-4">
                      <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded p-2 text-[11px] text-gray-400">
                        {isAr ? 'حقل إجابة نصية للردود' : 'Text answer box'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Question Buttons */}
            <div className="flex items-center justify-center gap-3 py-4">
              <button
                onClick={() => addQuestion('choice')}
                className="px-3 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? '+ اختيار متعدد' : '+ Multiple Choice'}</span>
              </button>
              <button
                onClick={() => addQuestion('rating')}
                className="px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Star className="w-3.5 h-3.5" />
                <span>{isAr ? '+ تقييم نجوم' : '+ Rating'}</span>
              </button>
              <button
                onClick={() => addQuestion('text')}
                className="px-3 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>{isAr ? '+ نص مفتوح' : '+ Text Answer'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Preview Mode */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-t-8 border-t-[#038387]">
            {submittedSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-lg text-gray-900">
                  {isAr ? 'شكراً لك! تم استلام ردك بنجاح' : 'Thank you! Your response was submitted.'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAr ? 'تم حفظ النتيجة وتحديث لوحة التحليلات مباشرة.' : 'The response has been recorded into the live analytics tab.'}
                </p>
                <button
                  onClick={() => setSubmittedSuccess(false)}
                  className="px-4 py-2 bg-[#038387] text-white rounded-lg text-xs font-semibold mt-4"
                >
                  {isAr ? 'إرسال رد آخر' : 'Submit another response'}
                </button>
              </div>
            ) : (
              <form onSubmit={handlePreviewSubmit} className="space-y-6">
                <div>
                  <h2 className="font-bold text-2xl text-gray-900">{title}</h2>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>

                <hr />

                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <label className="font-semibold text-xs text-gray-800 block">
                      {idx + 1}. {q.title}
                    </label>

                    {q.type === 'choice' && (
                      <div className="space-y-1.5">
                        {q.options?.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              onChange={(e) =>
                                setPreviewAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              className="text-[#038387] focus:ring-[#038387]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'rating' && (
                      <div className="flex gap-2 py-1">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            type="button"
                            key={starVal}
                            onClick={() =>
                              setPreviewAnswers((prev) => ({ ...prev, [q.id]: starVal }))
                            }
                            className="p-1 hover:scale-125 transition"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                (previewAnswers[q.id] || 0) >= starVal
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === 'text' && (
                      <textarea
                        rows={3}
                        value={previewAnswers[q.id] || ''}
                        onChange={(e) =>
                          setPreviewAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder={isAr ? 'اكتب إجابتك هنا...' : 'Enter response...'}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#038387]"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#038387] hover:bg-[#026669] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرسال الرد' : 'Submit'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {isAr ? 'ملخص الاستجابات' : 'Live Survey Summary'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {submissions.length} {isAr ? 'استجابة مسجلة' : 'total recorded submissions'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 space-y-3">
                  <h4 className="font-bold text-xs text-gray-800">
                    {idx + 1}. {q.title}
                  </h4>

                  {q.type === 'choice' && (
                    <div className="space-y-2">
                      {q.options?.map((opt, oIdx) => {
                        const count = submissions.filter((s) => s.answers[q.id] === opt).length;
                        const pct = submissions.length ? Math.round((count / submissions.length) * 100) : 0;
                        return (
                          <div key={oIdx} className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{opt}</span>
                              <span className="font-bold">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-[#038387] h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-black text-amber-500">
                        {(
                          submissions.reduce((acc, s) => acc + (s.answers[q.id] || 0), 0) /
                          (submissions.length || 1)
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isAr ? 'متوسط التقييم العام من 5 نجوم' : 'Average rating score out of 5 stars'}
                      </div>
                    </div>
                  )}

                  {q.type === 'text' && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {submissions
                        .filter((s) => s.answers[q.id])
                        .map((s, sIdx) => (
                          <div key={sIdx} className="p-2 bg-gray-50 rounded-lg text-xs text-gray-700 italic border">
                            "{s.answers[q.id]}"
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
