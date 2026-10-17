import React, { useState, useEffect } from 'react';
import { ReviewQueueItem, AuditLogEntry, ReviewStatus } from '../../types/admin';
import { adminService } from '../../services/adminService';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ShieldCheck,
  History,
  AlertTriangle,
  RefreshCw,
  User,
  ExternalLink,
  MessageSquare,
  Lock,
} from 'lucide-react';

interface ReviewQueueSectionProps {
  lang: 'en' | 'ar';
}

export const ReviewQueueSection: React.FC<ReviewQueueSectionProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'audit'>('queue');
  const [auditSearch, setAuditSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedItemForReject, setSelectedItemForReject] = useState<ReviewQueueItem | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const canReview = adminService.hasPermission('canReviewQueue');

  const loadData = async () => {
    setLoading(true);
    const data = await adminService.getReviewQueue();
    setQueue(data.queue);
    setAuditLogs(data.auditLogs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    if (!canReview) {
      alert(isAr ? 'ليس لديك صلاحية اعتماد قائمة الانتظار' : 'Permission denied');
      return;
    }

    setProcessingId(id);
    const res = await adminService.resolveReviewItem(id, status, notes);
    setProcessingId(null);
    setSelectedItemForReject(null);
    setRejectNote('');

    if (res.success) {
      if (res.queue) setQueue(res.queue);
      if (res.auditLogs) setAuditLogs(res.auditLogs);
    } else if (res.error) {
      alert(res.error);
    }
  };

  const pendingCount = queue.filter((q) => q.status === 'pending').length;

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'مركز التدقيق والحوكمة وقائمة الانتظار' : 'Review Queue & Audit Trail'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            {isAr ? 'قائمة المراجعة والاعتماد وسجل التدقيق الشامل' : 'Approval Queue & Activity Audit Log'}
          </h2>
          <p className="text-xs md:text-sm text-amber-200/80 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? 'ضمان عدم نشر أي موقع أو جهة أو خدمة قبل مراجعتها وتدقيق روابطها؛ مع توثيق سجل مفصل يوضح من أضاف أو عدّل أو اعتمد كل عنصر باليوم والتوقيت.'
              : 'Zero unverified publication guarantee. Comprehensive audit logs tracing every action, modification, and approval.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!canReview && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl text-xs text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? 'عرض فقط' : 'Read-only'}</span>
            </div>
          )}
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'قائمة الانتظار والمراجعة' : 'Pending Queue'}</span>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isAr ? 'سجل التدقيق الشامل (Audit Log)' : 'Audit Trail Log'}</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {auditLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Queue View */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
              <p className="text-xs">{isAr ? 'جاري تحميل قائمة الانتظار...' : 'Loading review queue...'}</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="p-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-gray-500">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-sm">{isAr ? 'قائمة الانتظار فارغة حالياً' : 'No items pending review'}</p>
              <p className="text-xs text-gray-400 mt-1">
                {isAr ? 'تمت مراجعة واعتماد جميع الطلبات والخدمات بنجاح.' : 'All services have been reviewed.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => {
                const isPending = item.status === 'pending';
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isPending ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-200 opacity-80'
                    }`}
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.entityType === 'gov_entity'
                            ? isAr
                              ? 'جهة حكومية'
                              : 'Gov Entity'
                            : isAr
                            ? 'تطبيق / خدمة'
                            : 'App / Service'}
                        </span>

                        {isPending && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>{isAr ? 'بانتظار قرار المشرف' : 'Pending Review'}</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {isAr ? 'تم الاعتماد والنشر ✓' : 'Approved ✓'}
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            {isAr ? 'مرفوض ✕' : 'Rejected ✕'}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.details}</p>

                      <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                        <span>
                          {isAr ? 'مقدّم الطلب:' : 'Submitted by:'} <strong className="text-gray-700">{item.submittedBy}</strong>
                        </span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                        {item.reviewedBy && (
                          <>
                            <span>•</span>
                            <span>
                              {isAr ? 'المعتمد:' : 'Reviewed by:'} <strong className="text-emerald-700">{item.reviewedBy}</strong>
                            </span>
                          </>
                        )}
                      </div>

                      {item.reviewNotes && (
                        <div className="text-[11px] bg-slate-50 text-slate-700 p-2 rounded-xl border border-slate-200 mt-2">
                          <span className="font-bold">{isAr ? 'ملاحظة الاعتماد:' : 'Note:'} </span>
                          {item.reviewNotes}
                        </div>
                      )}
                    </div>

                    {isPending && canReview && (
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setSelectedItemForReject(item)}
                          disabled={processingId === item.id}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition cursor-pointer"
                        >
                          {isAr ? 'رفض' : 'Reject'}
                        </button>

                        <button
                          onClick={() => handleResolve(item.id, 'approved')}
                          disabled={processingId === item.id}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{processingId === item.id ? (isAr ? 'جاري الاعتماد...' : 'Approving...') : isAr ? 'اعتماد ونشر' : 'Approve & Publish'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Audit Log View */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder={isAr ? 'ابحث في سجل العمليات والمشرفين...' : 'Search audit log...'}
                className="w-full ps-9 pe-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <span className="text-xs text-gray-400">
              {isAr ? `${filteredLogs.length} عملية موثقة بالخادم` : `${filteredLogs.length} audit entries`}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'العملية / الإجراء' : 'Action'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'المشرف المنفّذ' : 'Actor'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'تفاصيل الإجراء والمستهدف' : 'Details'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'التاريخ والتوقيت' : 'Timestamp'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{log.actor}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{log.actorEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-md leading-relaxed">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedItemForReject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <h3 className="font-black text-gray-900 text-base mb-2">
              {isAr ? 'سبب رفض الطلب وتدوين الملاحظة' : 'Rejection Reason'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isAr
                ? 'سيتم تدوين هذه الملاحظة وحفظها في سجل التدقيق وإشعار مقدّم الطلب.'
                : 'This reason will be logged in the permanent audit trail.'}
            </p>

            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder={isAr ? 'مثال: الرابط لا يتطابق مع المعايير الحكومية أو لا يتبع نطاق رسمي...' : 'Reason for rejection...'}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedItemForReject(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleResolve(selectedItemForReject.id, 'rejected', rejectNote)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black"
              >
                {isAr ? 'تأكيد الرفض' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
