import {
    FiClock, FiCheckCircle, FiSend, FiFilePlus, FiFileText,
    FiAlertTriangle, FiXCircle, FiTrash2, FiRefreshCw,
    FiDollarSign, FiPrinter, FiThumbsDown, FiThumbsUp,
    FiPackage, FiShield, FiAward, FiInbox, FiEdit3,
    FiUsers, FiList, FiAlertOctagon, FiCheck, FiCornerUpRight,
    FiTrendingUp, FiScissors, FiStar
} from 'react-icons/fi';

const getVal = (obj, key) => {
    if (!obj) return undefined;
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return foundKey ? obj[foundKey] : undefined;
};

// Exhaustive icon lookup — exact match on DESCRIPTION2
const ACTIVITY_ICON_MAP = {
    // PR Lifecycle
    'pr draft saved':               { icon: FiEdit3,          color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'deleted':                      { icon: FiTrash2,         color: 'bg-red-50 text-red-400 border-red-200' },
    'pr created':                   { icon: FiFilePlus,       color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    'pr not recommended':           { icon: FiThumbsDown,     color: 'bg-red-50 text-red-500 border-red-200' },
    'pr recommended':               { icon: FiThumbsUp,       color: 'bg-teal-50 text-teal-600 border-teal-200' },
    'pr rejected':                  { icon: FiXCircle,        color: 'bg-red-50 text-red-600 border-red-200' },
    'pr approved':                  { icon: FiCheckCircle,    color: 'bg-green-50 text-green-600 border-green-200' },
    'mr to be approved':            { icon: FiAlertTriangle,  color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },

    // Quotation
    'quotation requested':          { icon: FiInbox,          color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
    'forwarded to open':            { icon: FiCornerUpRight,  color: 'bg-blue-50 text-blue-500 border-blue-200' },
    'quotation opened':             { icon: FiList,           color: 'bg-blue-50 text-blue-600 border-blue-200' },
    'forwarded to convener':        { icon: FiSend,           color: 'bg-blue-50 text-blue-600 border-blue-200' },
    'price details entered':        { icon: FiDollarSign,     color: 'bg-green-50 text-green-500 border-green-200' },
    'forwarded to call quotations': { icon: FiSend,           color: 'bg-blue-50 text-blue-500 border-blue-200' },

    // Submission & Evaluation
    'submission evaluated':         { icon: FiCheck,          color: 'bg-teal-50 text-teal-500 border-teal-200' },
    'submission not recommended':   { icon: FiThumbsDown,     color: 'bg-red-50 text-red-500 border-red-200' },
    'submission recommended':       { icon: FiThumbsUp,       color: 'bg-teal-50 text-teal-600 border-teal-200' },
    'submission rejected':          { icon: FiXCircle,        color: 'bg-red-50 text-red-600 border-red-200' },
    'submission approved':          { icon: FiCheckCircle,    color: 'bg-green-50 text-green-600 border-green-200' },
    'tec report returned':          { icon: FiRefreshCw,      color: 'bg-orange-50 text-orange-500 border-orange-200' },
    'price evaluation completed':   { icon: FiTrendingUp,     color: 'bg-green-50 text-green-500 border-green-200' },

    // Tender
    'tender approved to proceed':               { icon: FiCheckCircle,   color: 'bg-green-50 text-green-600 border-green-200' },
    'forwarded to initiate draft bid':          { icon: FiCornerUpRight, color: 'bg-blue-50 text-blue-500 border-blue-200' },
    'forwarded to create draft bid':            { icon: FiCornerUpRight, color: 'bg-blue-50 text-blue-500 border-blue-200' },
    'draft bid saved':                          { icon: FiEdit3,         color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'bid document re-submit':                   { icon: FiRefreshCw,     color: 'bg-orange-50 text-orange-500 border-orange-200' },
    'forwarded for add to agenda':              { icon: FiSend,          color: 'bg-blue-50 text-blue-500 border-blue-200' },
    'lvpc on progress':                         { icon: FiUsers,         color: 'bg-purple-50 text-purple-600 border-purple-200' },
    'forwarded to lvpc':                        { icon: FiUsers,         color: 'bg-purple-50 text-purple-500 border-purple-200' },
    'tender rejected':                          { icon: FiXCircle,       color: 'bg-red-50 text-red-600 border-red-200' },
    'recommendation and not approved':          { icon: FiThumbsDown,    color: 'bg-red-50 text-red-500 border-red-200' },
    'recommendation and approved':              { icon: FiThumbsUp,      color: 'bg-teal-50 text-teal-600 border-teal-200' },
    'tender dercisions updated':                { icon: FiEdit3,         color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'tender forwarded to indent section':       { icon: FiCornerUpRight, color: 'bg-blue-50 text-blue-500 border-blue-200' },
    'tender forwarded to proc. section':        { icon: FiCornerUpRight, color: 'bg-blue-50 text-blue-500 border-blue-200' },

    // Price & Negotiation
    'payment terms negotiation':    { icon: FiDollarSign,     color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    'price negotiation':            { icon: FiScissors,       color: 'bg-yellow-50 text-yellow-500 border-yellow-200' },

    // Award & PO
    'award letter generated':       { icon: FiAward,          color: 'bg-amber-50 text-amber-600 border-amber-200' },
    'award letter prepared':        { icon: FiEdit3,          color: 'bg-amber-50 text-amber-500 border-amber-200' },
    'award letter checked':         { icon: FiCheck,          color: 'bg-amber-50 text-amber-600 border-amber-200' },
    'award letter approved':        { icon: FiCheckCircle,    color: 'bg-green-50 text-green-600 border-green-200' },
    'award letter posted':          { icon: FiSend,           color: 'bg-blue-50 text-blue-600 border-blue-200' },
    'award acceptance updated':     { icon: FiRefreshCw,      color: 'bg-teal-50 text-teal-500 border-teal-200' },
    'po generated':                 { icon: FiFilePlus,       color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },

    // Agreement
    'agreement completed':          { icon: FiShield,         color: 'bg-green-50 text-green-600 border-green-200' },

    // GRN & Goods
    'goods / service received':         { icon: FiPackage,       color: 'bg-teal-50 text-teal-600 border-teal-200' },
    'check list printed':               { icon: FiPrinter,       color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'assistant appointed':              { icon: FiUsers,          color: 'bg-purple-50 text-purple-500 border-purple-200' },
    'quality checked':                  { icon: FiAlertOctagon,  color: 'bg-orange-50 text-orange-500 border-orange-200' },
    'quality approved':                 { icon: FiCheckCircle,   color: 'bg-green-50 text-green-600 border-green-200' },
    'grn printed':                      { icon: FiPrinter,       color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'grn printed & forwarded to proc. section': { icon: FiSend,  color: 'bg-blue-50 text-blue-500 border-blue-200' },

    // Payment
    'payment details updated':                    { icon: FiEdit3,      color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'payment requested':                          { icon: FiDollarSign, color: 'bg-green-50 text-green-500 border-green-200' },
    'payment request rejected':                   { icon: FiXCircle,    color: 'bg-red-50 text-red-500 border-red-200' },
    'payment request forwarded to proc. section': { icon: FiSend,       color: 'bg-blue-50 text-blue-500 border-blue-200' },
    'invoice details entered':                    { icon: FiFileText,   color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'payment verified & forwarded to cc office':  { icon: FiSend,       color: 'bg-blue-50 text-blue-600 border-blue-200' },
    'payment documents received':                 { icon: FiInbox,      color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
    'payment completed':                          { icon: FiStar,       color: 'bg-green-50 text-green-700 border-green-300' },

    // Pay Slip
    'pay slip started':                      { icon: FiClock,        color: 'bg-yellow-50 text-yellow-500 border-yellow-200' },
    'pay slip printed':                      { icon: FiPrinter,      color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'pay slip not verified':                 { icon: FiAlertOctagon, color: 'bg-orange-50 text-orange-500 border-orange-200' },
    'pay slip verified':                     { icon: FiCheckCircle,  color: 'bg-teal-50 text-teal-600 border-teal-200' },
    'pay slip rejected':                     { icon: FiXCircle,      color: 'bg-red-50 text-red-500 border-red-200' },
    'pay slip forwarded to account section': { icon: FiSend,         color: 'bg-blue-50 text-blue-500 border-blue-200' },
    'pay slip rejected by account section':  { icon: FiXCircle,      color: 'bg-red-50 text-red-600 border-red-200' },

    // Cheque
    'cheque printed':   { icon: FiPrinter,    color: 'bg-slate-50 text-slate-500 border-slate-200' },
    'cheque released':  { icon: FiCheckCircle, color: 'bg-green-50 text-green-600 border-green-200' },
    'cheque returned':  { icon: FiRefreshCw,  color: 'bg-red-50 text-red-400 border-red-200' },
};

// Icon resolver for timeline items (DESCRIPTION2)
const getActivityIcon = (description) => {
    const key = (description || '').trim().toLowerCase();
    if (ACTIVITY_ICON_MAP[key]) return ACTIVITY_ICON_MAP[key];
    // Keyword fallback
    if (key.includes('approved'))                          return { icon: FiCheckCircle,  color: 'bg-green-50 text-green-600 border-green-200' };
    if (key.includes('rejected'))                          return { icon: FiXCircle,      color: 'bg-red-50 text-red-500 border-red-200' };
    if (key.includes('forwarded') || key.includes('sent')) return { icon: FiSend,         color: 'bg-blue-50 text-blue-600 border-blue-200' };
    if (key.includes('payment') || key.includes('cheque')) return { icon: FiDollarSign,   color: 'bg-green-50 text-green-500 border-green-200' };
    if (key.includes('created'))                           return { icon: FiFilePlus,      color: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
    if (key.includes('printed'))                           return { icon: FiPrinter,       color: 'bg-slate-50 text-slate-500 border-slate-200' };
    if (key.includes('deleted'))                           return { icon: FiTrash2,        color: 'bg-red-50 text-red-400 border-red-200' };
    return { icon: FiFileText, color: 'bg-brand-muted text-brand-text-secondary border-brand-border' };
};

// Icon resolver for header alert badge (DESCRIPTION)
const getHeaderIcon = (description) => {
    const d = (description || '').toLowerCase();
    if (d.includes('rejected') || d.includes('returned'))  return FiXCircle;
    if (d.includes('recommended'))                         return FiThumbsDown;
    if (d.includes('payment') || d.includes('started'))    return FiClock;
    return FiAlertTriangle;
};

const ActivityStream = ({ activity }) => {
    if (!activity || activity.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                <FiClock className="w-6 h-6 text-brand-text-muted mb-2" />
                <p className="text-brand-text-secondary text-xs">No activity records found.</p>
            </div>
        );
    }

    // Legacy Header Logic: Statuses < 1115 show a special alert
    let headerAlert = null;
    const firstItem = activity[0];
    const firstStatus = parseInt(getVal(firstItem, 'STATUS'));

    if (firstStatus < 1115) {
        let titleDesc = getVal(firstItem, 'DESCRIPTION');
        let receiverName = getVal(firstItem, 'RECEIVER');

        if (firstStatus === 536) {
            const row160 = activity.find(item => parseInt(getVal(item, 'STATUS')) === 160);
            if (row160) {
                titleDesc = getVal(row160, 'DESCRIPTION');
                receiverName = getVal(row160, 'RECEIVER');
            }
        }
        const HeaderIcon = getHeaderIcon(titleDesc);
        headerAlert = { text: `${titleDesc} By ${receiverName}`, Icon: HeaderIcon };
    }

    return (
        <div className="space-y-6">
            {/* Legacy Status Alert */}
            {headerAlert && (
                <div className="mb-8 p-3 bg-warning/5 border border-warning/20 rounded-lg flex items-center gap-2.5">
                    <headerAlert.Icon className="w-4 h-4 text-warning shrink-0" />
                    <div className="text-warning text-xs font-bold uppercase tracking-tight">
                        Action Required: <span className="text-brand-text normal-case ml-1">{headerAlert.text}</span>
                    </div>
                </div>
            )}

            <div className="relative">
                {/* Vertical Connector Line */}
                <div className="absolute left-[15px] top-6 bottom-6 w-px bg-brand-border/60" />

                <div className="space-y-10">
                    {activity.map((item, index) => {
                        const description2 = getVal(item, 'DESCRIPTION2');
                        const config = getActivityIcon(description2);
                        const StatusIcon = config.icon;
                        const trnDate = getVal(item, 'TRN_DATE');
                        const sender = getVal(item, 'SENDER');
                        const numDays = parseInt(getVal(item, 'NUM_DAYS') || 0);

                        return (
                            <div key={index} className="relative pl-12 group">
                                {/* Circular Icon Node */}
                                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 z-10 ${config.color}`}>
                                    <StatusIcon size={14} />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="text-brand-text font-bold text-sm tracking-tight leading-snug">
                                            {description2}
                                        </div>
                                        <p className="text-brand-text-secondary text-xs">
                                            By {sender}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-brand-text-muted text-[10px] whitespace-nowrap">
                                            {trnDate}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${numDays === 0 ? 'text-orange-500 bg-orange-50' : 'text-brand-text-muted bg-brand-muted'}`}>
                                            {numDays === 0 ? '#On Same Day' : `#After ${numDays} Days`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ActivityStream;
