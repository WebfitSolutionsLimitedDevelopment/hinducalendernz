'use client';
import { useState } from 'react';

export function AgreementForm({ token, party }: { token: string; party: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ id: string; pdf: string; emailed: boolean } | null>(null);

  if (done) {
    const href = `data:application/pdf;base64,${done.pdf}`;
    return (
      <div className="sent-card" role="status">
        <div className="sent-icon" aria-hidden="true">✓</div>
        <h2>Thank you — signed</h2>
        <p>Agreement ID <strong>{done.id}</strong>.</p>
        <p>{done.emailed ? 'A copy of the signed agreement (PDF) has been emailed to you and to Webfit Solutions Limited.' : 'Please download your signed copy below.'}</p>
        <p className="actions"><a className="btn btn-primary" href={href} download={`${done.id}.pdf`}>Download signed PDF</a></p>
      </div>
    );
  }

  return (
    <form className="agr-form signup" onSubmit={async (e) => {
      e.preventDefault(); setErr('');
      if (!agree) { setErr('Please tick the box to confirm you agree.'); return; }
      setBusy(true);
      try {
        const r = await fetch('/api/agreement/sign', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, name, email, agree }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.pdf) setDone(j);
        else setErr(j.message ?? 'Sorry — we couldn’t record your signature. Please try again or email info@webfitt.co.nz.');
      } finally { setBusy(false); }
    }}>
      <h2>Sign the agreement</h2>
      <p className="small muted">This agreement is offered to {party}. Type your full legal name as your electronic signature.</p>
      <div><label htmlFor="agr-name">Full name</label><input id="agr-name" required minLength={3} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
      <div><label htmlFor="agr-email">Email (for your signed copy)</label><input id="agr-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
      <label className="check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I have read and agree to the terms and conditions of this agreement, and I agree that typing my name and submitting this form is my electronic signature.</label>
      {err && <p className="form-error" role="alert">{err}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Signing…' : 'I agree — sign and submit'}</button>
      <p className="small muted">We record your name, email, IP address, device, and the date and time of signing.</p>
    </form>
  );
}
