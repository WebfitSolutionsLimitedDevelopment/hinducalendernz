import { notFound } from 'next/navigation';
import { AGREEMENT_TITLE, AGREEMENT_VERSION, INVITES, OFFEROR, SECTIONS, SUMMARY } from '@/lib/agreement';
import { AgreementForm } from '@/components/AgreementForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Agreement', robots: { index: false, follow: false } };

export default async function AgreementPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = INVITES[token];
  if (!invite) notFound();
  return (
    <article className="prose agreement">
      <div className="agr-head">
        <img src="/brand/webfit-logo.png" alt="Webfit Solutions Limited" width={96} height={96} />
        <img src="/brand/symbol.svg" alt="Hindu Calendar NZ" width={72} height={72} />
      </div>
      <h1>{AGREEMENT_TITLE}</h1>
      <p className="muted small">Version {AGREEMENT_VERSION} · Offered by {OFFEROR.name} to {invite.party}</p>

      <div className="agr-summary">
        <h2>In plain English</h2>
        <ul>{SUMMARY.map((s) => <li key={s}>{s}</li>)}</ul>
        <p className="small muted">This summary helps you read the agreement; the numbered clauses below are the binding terms. You may wish to take independent legal advice before signing.</p>
      </div>

      <div className="agr-terms">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h3>{s.h}</h3>
            {s.p.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        ))}
      </div>

      <AgreementForm token={token} party={invite.party} />
    </article>
  );
}
