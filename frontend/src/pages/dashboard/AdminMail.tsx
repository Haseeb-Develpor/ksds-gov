import { useEffect, useMemo, useState } from 'react';
import {
  Inbox, Send, PenSquare, RefreshCw, Trash2, Mail, Paperclip, Star, Reply, Forward,
  FileText, Search, ArchiveRestore,
} from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { adminNav } from '../../data/dashboardNav';
import { mailApi } from '../../services/api';

type Attachment = { filename?: string; url?: string; size?: number; contentType?: string };
type MailMsg = {
  _id: string;
  folder?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
  read?: boolean;
  starred?: boolean;
  createdAt?: string;
  threadId?: string;
  attachments?: Attachment[];
};

type Tab = 'inbox' | 'sent' | 'drafts' | 'starred' | 'trash' | 'compose';

function formatBytes(n?: number) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMail() {
  const [tab, setTab] = useState<Tab>('inbox');
  const [items, setItems] = useState<MailMsg[]>([]);
  const [selected, setSelected] = useState<MailMsg | null>(null);
  const [thread, setThread] = useState<MailMsg[]>([]);
  const [counts, setCounts] = useState({ inbox: 0, unread: 0, sent: 0, drafts: 0, starred: 0, trash: 0 });
  const [mailbox, setMailbox] = useState('info@ksds-gov.com');
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [compose, setCompose] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [forwardTo, setForwardTo] = useState('');
  const [showForward, setShowForward] = useState(false);

  const loadList = async (which: Tab = tab, search = q) => {
    setError('');
    try {
      const st = await mailApi.status();
      setMailbox(st.data?.mailbox || 'info@ksds-gov.com');
      setSmtpConfigured(!!st.data?.smtpConfigured);
      if (st.data?.counts) setCounts(st.data.counts);
      if (which === 'compose') return;
      const r = await mailApi.folder(which, search);
      setItems(Array.isArray(r.data?.items) ? r.data.items : []);
      if (r.data?.counts) setCounts(r.data.counts);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Could not load mail');
    }
  };

  useEffect(() => {
    loadList('inbox');
  }, []);

  const openMessage = async (id: string) => {
    setOk('');
    setError('');
    setReplyBody('');
    setReplyFiles([]);
    setShowForward(false);
    setForwardTo('');
    try {
      const r = await mailApi.message(id);
      setSelected(r.data?.message || null);
      setThread(Array.isArray(r.data?.thread) ? r.data.thread : []);
      if (tab !== 'compose') await loadList(tab);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Could not open message');
    }
  };

  const switchTab = async (t: Tab) => {
    setTab(t);
    setSelected(null);
    setThread([]);
    setOk('');
    setError('');
    setShowForward(false);
    if (t !== 'compose') await loadList(t);
  };

  const buildForm = (data: Record<string, string>, fileList: File[]) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    fileList.forEach((f) => fd.append('attachments', f));
    return fd;
  };

  const sendCompose = async (e: React.FormEvent, draft = false) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setOk('');
    try {
      const fd = buildForm(
        { ...compose, draft: draft ? 'true' : 'false' },
        files
      );
      const r = await mailApi.composeForm(fd);
      setOk(r.data?.deliveryNote || (draft ? 'Draft saved' : 'Mail sent'));
      setCompose({ to: '', cc: '', bcc: '', subject: '', body: '' });
      setFiles([]);
      setTab(draft ? 'drafts' : 'sent');
      await loadList(draft ? 'drafts' : 'sent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Send failed');
    }
    setBusy(false);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    setOk('');
    try {
      const fd = buildForm({ body: replyBody }, replyFiles);
      const r = await mailApi.replyForm(selected._id, fd);
      setOk(r.data?.deliveryNote || 'Reply sent');
      setReplyBody('');
      setReplyFiles([]);
      await openMessage(selected._id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reply failed');
    }
    setBusy(false);
  };

  const sendForward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    setOk('');
    try {
      const fd = buildForm({ to: forwardTo, body: replyBody }, replyFiles);
      const r = await mailApi.forwardForm(selected._id, fd);
      setOk(r.data?.deliveryNote || 'Forwarded');
      setShowForward(false);
      setForwardTo('');
      setTab('sent');
      await loadList('sent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Forward failed');
    }
    setBusy(false);
  };

  const toggleStar = async (id: string) => {
    await mailApi.star(id);
    if (selected?._id === id) await openMessage(id);
    await loadList(tab === 'compose' ? 'inbox' : tab);
  };

  const markUnread = async (id: string) => {
    await mailApi.unread(id);
    setSelected(null);
    await loadList(tab === 'compose' ? 'inbox' : tab);
  };

  const remove = async (id: string) => {
    const permanent = tab === 'trash';
    await mailApi.remove(id, permanent);
    setSelected(null);
    setThread([]);
    await loadList(tab === 'compose' ? 'inbox' : tab);
  };

  const tabs = useMemo(() => ([
    { id: 'inbox' as Tab, label: 'Inbox', icon: Inbox, badge: counts.unread },
    { id: 'sent' as Tab, label: 'Sent', icon: Send, badge: counts.sent },
    { id: 'drafts' as Tab, label: 'Drafts', icon: FileText, badge: counts.drafts },
    { id: 'starred' as Tab, label: 'Starred', icon: Star, badge: counts.starred },
    { id: 'trash' as Tab, label: 'Trash', icon: Trash2, badge: counts.trash },
    { id: 'compose' as Tab, label: 'Compose', icon: PenSquare, badge: 0 },
  ]), [counts]);

  return (
    <DashboardLayout items={adminNav} title="Admin Panel">
      <Seo title="Business Mail" />
      <Reveal>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="text-primary-600" /> Business Mail
            </h1>
            <p className="text-slate-500">
              <strong className="text-slate-700 dark:text-slate-200">{mailbox}</strong>
              {' · '}
              {smtpConfigured ? 'Live SMTP — send with attachments' : 'Local mode — configure SMTP in .env'}
            </p>
          </div>
          <button type="button" onClick={() => loadList(tab === 'compose' ? 'inbox' : tab)} className="btn-outline px-3 py-2 text-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </Reveal>

      {error && <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {ok && <div className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</div>}

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={tab === t.id ? 'btn-primary px-3 py-2 text-sm' : 'btn-outline px-3 py-2 text-sm'}
          >
            <t.icon size={15} /> {t.label}
            {t.badge ? ` (${t.badge})` : ''}
          </button>
        ))}
      </div>

      {tab !== 'compose' && (
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search mail…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') loadList(tab, q); }}
          />
        </div>
      )}

      {tab === 'compose' ? (
        <Reveal>
          <form onSubmit={(e) => sendCompose(e, false)} className="card max-w-3xl space-y-3 p-5">
            <p className="text-sm text-slate-500">From: {mailbox}</p>
            <input type="email" className="input" placeholder="To" value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} />
            <input className="input" placeholder="Cc (optional)" value={compose.cc} onChange={(e) => setCompose({ ...compose, cc: e.target.value })} />
            <input className="input" placeholder="Bcc (optional)" value={compose.bcc} onChange={(e) => setCompose({ ...compose, bcc: e.target.value })} />
            <input className="input" placeholder="Subject" value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} />
            <textarea rows={10} className="input" placeholder="Write your message…" value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} />
            <label className="btn-outline inline-flex cursor-pointer px-3 py-2 text-sm">
              <Paperclip size={15} /> Attach documents
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </label>
            {files.length > 0 && (
              <ul className="text-xs text-slate-500 space-y-1">
                {files.map((f) => (
                  <li key={f.name + f.size} className="flex items-center gap-2">
                    <FileText size={14} /> {f.name} ({formatBytes(f.size)})
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <button disabled={busy} className="btn-primary">{busy ? 'Sending…' : 'Send mail'}</button>
              <button type="button" disabled={busy} className="btn-outline" onClick={(e) => sendCompose(e as any, true)}>Save draft</button>
            </div>
          </form>
        </Reveal>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="card overflow-hidden lg:col-span-2">
            <div className="max-h-[70vh] overflow-y-auto">
              {items.length === 0 && (
                <div className="flex flex-col items-center px-4 py-16 text-center text-sm text-slate-500">
                  <Mail size={28} className="mb-2 text-slate-400" />
                  No messages in {tab}.
                </div>
              )}
              {items.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => openMessage(m._id)}
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 ${
                    selected?._id === m._id ? 'bg-primary-50/80 dark:bg-white/10' : ''
                  } ${!m.read && tab === 'inbox' ? 'font-semibold' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-slate-800 dark:text-white">
                      {tab === 'sent' || tab === 'drafts' ? m.to || '(no recipient)' : m.from}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {m.starred && <Star size={12} className="fill-amber-400 text-amber-400" />}
                      {m.attachments && m.attachments.length > 0 && <Paperclip size={12} className="text-slate-400" />}
                    </div>
                  </div>
                  <p className="truncate text-sm text-slate-600 dark:text-slate-300">{m.subject}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{m.createdAt?.slice(0, 16).replace('T', ' ')}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 lg:col-span-3 min-h-[420px]">
            {!selected && <p className="text-sm text-slate-500">Select a message to read, reply, forward, or attach files.</p>}
            {selected && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{selected.subject}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      From: {selected.from}<br />
                      To: {selected.to}
                      {selected.cc ? <><br />Cc: {selected.cc}</> : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button type="button" title="Star" onClick={() => toggleStar(selected._id)} className="btn-ghost px-2 py-2">
                      <Star size={16} className={selected.starred ? 'fill-amber-400 text-amber-400' : ''} />
                    </button>
                    <button type="button" title="Mark unread" onClick={() => markUnread(selected._id)} className="btn-ghost px-2 py-2 text-xs">Unread</button>
                    <button type="button" title="Delete" onClick={() => remove(selected._id)} className="btn-ghost px-2 py-2 text-red-600">
                      {tab === 'trash' ? <ArchiveRestore size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
                  {thread.map((t) => (
                    <div key={t._id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
                      <p className="text-xs text-slate-400">
                        {t.from} → {t.to} · {t.createdAt?.slice(0, 16).replace('T', ' ')}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{t.body}</p>
                      {t.attachments && t.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {t.attachments.map((a, i) => (
                            <a
                              key={i}
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-gold-300"
                            >
                              <Paperclip size={12} /> {a.filename} {formatBytes(a.size)}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showForward ? (
                  <form onSubmit={sendReply} className="space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <Reply size={15} /> Reply from {mailbox}
                    </p>
                    <textarea required rows={5} className="input" placeholder="Write reply…" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} />
                    <label className="btn-outline inline-flex cursor-pointer px-3 py-2 text-sm">
                      <Paperclip size={15} /> Attach files
                      <input type="file" multiple className="hidden" onChange={(e) => setReplyFiles(Array.from(e.target.files || []))} />
                    </label>
                    {replyFiles.length > 0 && (
                      <p className="text-xs text-slate-500">{replyFiles.map((f) => f.name).join(', ')}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button disabled={busy} className="btn-primary">{busy ? 'Sending…' : 'Send reply'}</button>
                      <button type="button" className="btn-outline" onClick={() => setShowForward(true)}>
                        <Forward size={15} /> Forward
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={sendForward} className="space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
                    <p className="text-sm font-medium flex items-center gap-2"><Forward size={15} /> Forward</p>
                    <input required type="email" className="input" placeholder="Forward to email" value={forwardTo} onChange={(e) => setForwardTo(e.target.value)} />
                    <textarea rows={3} className="input" placeholder="Optional note…" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} />
                    <label className="btn-outline inline-flex cursor-pointer px-3 py-2 text-sm">
                      <Paperclip size={15} /> Extra attachments
                      <input type="file" multiple className="hidden" onChange={(e) => setReplyFiles(Array.from(e.target.files || []))} />
                    </label>
                    <div className="flex gap-2">
                      <button disabled={busy} className="btn-primary">{busy ? 'Sending…' : 'Forward mail'}</button>
                      <button type="button" className="btn-ghost" onClick={() => setShowForward(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
