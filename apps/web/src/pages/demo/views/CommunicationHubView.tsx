import React, { useState } from 'react';
import {
  MessageSquare,
  Smartphone,
  Send,
  Bot,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  Languages,
  Check,
  Settings,
  Bell
} from 'lucide-react';
import {
  useDemoStore,
  CommunicationChannelConfig,
  CommunicationTemplate,
  CommunicationDeliveryLog
} from '../../../store/demoStore';

export const CommunicationHubView: React.FC = () => {
  const {
    commChannels,
    commTemplates,
    commDeliveryLogs,
    commAutoTriggers,
    updateChannelConfig,
    testChannelConnection,
    toggleAutoTrigger,
    dispatchCommunicationMessage
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'channels' | 'templates' | 'triggers' | 'logs'>('channels');
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'KN' | 'HI' | 'TE'>('EN');
  const [pingFeedback, setPingFeedback] = useState<{ channelId: string; message: string; latencyMs: number } | null>(null);

  // Instant Broadcast Form State
  const [testRecipientName, setTestRecipientName] = useState('Ramesh Kumar (Father of Rahul Kumar)');
  const [testRecipientContact, setTestRecipientContact] = useState('+91 98450 12345');
  const [testChannel, setTestChannel] = useState<'whatsapp' | 'telegram' | 'sms'>('whatsapp');
  const [testTrigger, setTestTrigger] = useState('FEE_RECEIPT');
  const [testMessage, setTestMessage] = useState(
    'Namaste Ramesh Kumar, payment of ₹50,000 confirmed for Rahul Kumar (Adm: AKG-2026-0152). Receipt REC-2026-00125 generated. Download: https://education-erp-nine.vercel.app/receipts/REC-2026-00125.pdf'
  );
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  const handleTestPing = (channelId: 'whatsapp' | 'telegram' | 'sms' | 'email') => {
    const res = testChannelConnection(channelId);
    setPingFeedback({ channelId, message: res.message, latencyMs: res.latencyMs });
    setTimeout(() => setPingFeedback(null), 6000);
  };

  const handleSendTestBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const log = dispatchCommunicationMessage({
      recipientName: testRecipientName,
      recipientContact: testRecipientContact,
      recipientRole: 'PARENT',
      channel: testChannel,
      eventTrigger: testTrigger,
      messageText: testMessage
    });

    setBroadcastFeedback(`Dispatched live message to ${testRecipientName} via ${testChannel.toUpperCase()} (Ref: ${log.providerRefId}). Delivery confirmed.`);
    setTimeout(() => setBroadcastFeedback(null), 5000);
  };

  const filteredTemplates = commTemplates.filter(t => t.language === selectedLanguage);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Meta WhatsApp Cloud API & Telegram Bot Gateway
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Multi-Channel Communication Hub</h1>
          <p className="text-xs text-slate-600 mt-1">
            Official WhatsApp Business Platform • Telegram Alerts Bot • DLT SMS • Multi-Language Event Automation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> All Gateways Active
          </span>
        </div>
      </div>

      {/* Ping Feedback Toast */}
      {pingFeedback && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/40 text-xs font-bold text-blue-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pingFeedback.message}</span>
          </div>
          <span className="font-mono text-[10px] bg-blue-950 text-blue-300 px-2.5 py-1 rounded-lg border border-blue-800">
            LATENCY: {pingFeedback.latencyMs}ms
          </span>
        </div>
      )}

      {/* Broadcast Feedback Toast */}
      {broadcastFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs font-bold text-emerald-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{broadcastFeedback}</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">
            DELIVERED
          </span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'channels', label: 'Channel Credentials & Connection Health', icon: Settings },
          { id: 'triggers', label: 'Event Automation Engine (Zero-Click Triggers)', icon: Bell },
          { id: 'templates', label: 'Multilingual Templates (EN / KN / HI / TE)', icon: Languages },
          { id: 'logs', label: 'Live Delivery Dispatcher & Audit Logs', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: CHANNEL CREDENTIALS & CONNECTION HEALTH */}
      {/* ===================================================================== */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: WhatsApp Business Cloud API */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">WhatsApp Business Cloud API</h2>
                  <p className="text-xs text-slate-600 mt-0.5">Official Meta Developer Graph API v19.0</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                CONNECTED ● VERIFIED
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Phone Number ID</span>
                <span className="text-slate-900 font-mono font-bold">109283746152840 (Institutional Official WhatsApp)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">WABA ID (WhatsApp Business Account)</span>
                <span className="text-slate-900 font-mono font-bold">waba_99281734_ourschool</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">System Access Token</span>
                <span className="text-emerald-400 font-mono text-[11px] truncate block">EAAG9...[Meta Permanent System Token Verified]</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Two-Way Webhook Endpoint</span>
                <span className="text-blue-300 font-mono text-[11px] truncate block">https://education-erp-nine.vercel.app/api/v1/webhooks/whatsapp</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-600">Last Ping: 2 mins ago (Latency: 124ms)</span>
              <button
                onClick={() => handleTestPing('whatsapp')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Test Connection & Ping Meta
              </button>
            </div>
          </div>

          {/* Card 2: Telegram Bot API */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Telegram Bot API</h2>
                  <p className="text-xs text-slate-600 mt-0.5">High-Speed Broadcast Channel & Bot Alerts</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[10px] font-bold">
                CONNECTED ● ACTIVE
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Bot Username</span>
                <span className="text-blue-300 font-bold font-mono">@AksharaGlobal_Bot</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Bot Father Token</span>
                <span className="text-slate-900 font-mono font-bold">7182940215:AAH47q9xL1-zYk98V2b...[Active & Encrypted]</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Broadcast Channel / Chat ID</span>
                <span className="text-slate-900 font-mono font-bold">@akshara_official_alerts (Verified School Channel)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Webhook Listener</span>
                <span className="text-blue-300 font-mono text-[11px] truncate block">https://education-erp-nine.vercel.app/api/v1/webhooks/telegram</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-600">Last Ping: 5 mins ago (Latency: 88ms)</span>
              <button
                onClick={() => handleTestPing('telegram')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Test Connection & Ping Telegram
              </button>
            </div>
          </div>

          {/* Card 3: National DLT SMS Gateway */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">National DLT SMS Gateway</h2>
                  <p className="text-xs text-slate-600 mt-0.5">Textlocal / Kaleyra TRAI DLT Compliant</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px] font-bold">
                DLT APPROVED
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Header / Sender ID</span>
                <span className="text-amber-300 font-bold font-mono">AKSHRA (DLT Principal ID: 110156)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">API Gateway</span>
                <span className="text-slate-900 font-mono font-bold">api.textlocal.in/send (HTTP/2 Encrypted)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-600">Quota: 45,200 SMS remaining</span>
              <button
                onClick={() => handleTestPing('sms')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ping SMS Provider
              </button>
            </div>
          </div>

          {/* Card 4: Transactional Email Gateway */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Transactional Email (Amazon SES)</h2>
                  <p className="text-xs text-slate-600 mt-0.5">DKIM, SPF & DMARC 100% Verified</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800 font-mono text-[10px] font-bold">
                AUTHENTICATED
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">From Address</span>
                <span className="text-purple-300 font-bold font-mono">notifications@akshara.edu.in</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">SMTP Host</span>
                <span className="text-slate-900 font-mono font-bold">email-smtp.ap-south-1.amazonaws.com:587</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-600">Reputation: 100% Inbox Placement</span>
              <button
                onClick={() => handleTestPing('email')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ping SMTP Gateway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: EVENT AUTOMATION ENGINE (ZERO-CLICK TRIGGERS) */}
      {/* ===================================================================== */}
      {activeTab === 'triggers' && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Event-Driven Automated Notification Rules
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              When an institutional event occurs in EducationOS, the notification engine automatically dispatches messages via WhatsApp & Telegram without staff intervention.
            </p>
          </div>

          <div className="divide-y divide-slate-800/80">
            {[
              {
                key: 'EXAM_TIMETABLE',
                title: 'Examination Timetable Publication',
                desc: 'Triggered when Examination Controller publishes exam schedule. Automatically sends timetable PDF link to all enrolled students and linked parents via WhatsApp.',
                channel: 'WhatsApp & Telegram'
              },
              {
                key: 'FEE_RECEIPT',
                title: 'Fee Payment Received & Receipt Generated',
                desc: 'Triggered when payment is collected by Accountant. Instantly sends transaction summary, fee heads breakdown, and downloadable PDF receipt link to Parent WhatsApp.',
                channel: 'WhatsApp'
              },
              {
                key: 'ATTENDANCE_ABSENT',
                title: 'Daily Morning Absence Alert',
                desc: 'Triggered immediately when Class Teacher completes period roll call and marks a student absent. Sends real-time alert to Guardian.',
                channel: 'WhatsApp & SMS'
              },
              {
                key: 'FEE_DUE',
                title: 'Term Instalment Due Reminder',
                desc: 'Automated 7-day and 3-day notice before fee instalment deadline. Dispatches payment link directly to Parent phone.',
                channel: 'WhatsApp'
              },
              {
                key: 'PRACTICAL_SCHEDULE',
                title: 'Laboratory Practical Experiment Alert',
                desc: 'Notifies science batch students of required lab manuals, safety goggles, and experiment schedules in Raman / Ray Labs.',
                channel: 'Telegram Broadcast'
              },
            ].map((rule) => {
              const isEnabled = commAutoTriggers[rule.key] ?? true;
              return (
                <div key={rule.key} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{rule.title}</span>
                      <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                        {rule.channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 max-w-2xl">{rule.desc}</p>
                  </div>

                  <button
                    onClick={() => toggleAutoTrigger(rule.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isEnabled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {isEnabled ? '● Active Trigger' : '○ Disabled'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: MULTILINGUAL TEMPLATES (EN / KN / HI / TE) */}
      {/* ===================================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-400" />
                Verified Multilingual Message Templates
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Compliant with Meta WhatsApp Cloud API pre-approved templates and Indian DLT regulatory guidelines.
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              {[
                { code: 'EN', label: 'English' },
                { code: 'KN', label: 'ಕನ್ನಡ (Kannada)' },
                { code: 'HI', label: 'हिन्दी (Hindi)' },
                { code: 'TE', label: 'తెలుగు (Telugu)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedLanguage === lang.code
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div key={tmpl.id} className="bg-slate-900/90 border border-slate-200 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{tmpl.title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Template ID: {tmpl.id}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    META APPROVED
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                  {tmpl.content}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 self-center">Variables:</span>
                  {tmpl.placeholders.map((p, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-blue-300">
                      {`{{${p}}}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 4: LIVE DELIVERY DISPATCHER & AUDIT LOGS */}
      {/* ===================================================================== */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Dispatch Live Test Notification */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Live Broadcast Dispatcher
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Dispatch an instant test notification via connected WhatsApp Cloud or Telegram API.
              </p>
            </div>

            <form onSubmit={handleSendTestBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Channel:</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['whatsapp', 'telegram', 'sms'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setTestChannel(ch)}
                      className={`py-2 rounded-xl font-bold uppercase text-[11px] transition-colors cursor-pointer border ${
                        testChannel === ch
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Recipient Name:</label>
                <input
                  type="text"
                  required
                  value={testRecipientName}
                  onChange={(e) => setTestRecipientName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Phone / Telegram Chat ID:</label>
                <input
                  type="text"
                  required
                  value={testRecipientContact}
                  onChange={(e) => setTestRecipientContact(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Message Content:</label>
                <textarea
                  rows={4}
                  required
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Dispatch Live Notification
              </button>
            </form>
          </div>

          {/* Right: Live Delivery Audit Log Table */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Real-Time Delivery Confirmation Audit Log
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Verified delivery receipts (`SENT` $\rightarrow$ `DELIVERED` $\rightarrow$ `READ`) received from WhatsApp & Telegram webhooks.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Message Preview</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {commDeliveryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-900 text-xs">{log.recipientName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.recipientContact}</p>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          log.channel === 'whatsapp'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.channel === 'telegram'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {log.channel}
                        </span>
                      </td>

                      <td className="p-3 text-slate-300 max-w-xs truncate text-[11px]">
                        {log.messageText}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          log.status === 'READ'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : log.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {log.status === 'READ' ? '✓✓ READ' : log.status === 'DELIVERED' ? '✓✓ DELIVERED' : '✓ SENT'}
                        </span>
                      </td>

                      <td className="p-3 text-right text-slate-400 font-mono text-[10px]">
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
    </div>
  );
};

