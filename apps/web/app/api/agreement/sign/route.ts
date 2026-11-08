import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { adminDb, rateLimitOk, isEmail } from '@/lib/supabase-server';
import { sendEmail, html } from '@/lib/notify';
import { AGREEMENT_TITLE, AGREEMENT_VERSION, INVITES, OFFEROR, SECTIONS, SUMMARY, agreementText } from '@/lib/agreement';

export const runtime = 'nodejs';
export const maxDuration = 30;
const BUCKET = 'agreements';

function asset(name: string) {
  for (const base of [/*turbopackIgnore: true*/ process.cwd(), join(/*turbopackIgnore: true*/ process.cwd(), 'apps', 'web')]) {
    try { return readFileSync(join(/*turbopackIgnore: true*/ base, 'private', 'brand', name)); } catch { /* try next */ }
  }
  return null;
}

/** Keep only characters the standard PDF fonts can draw. */
const pdfSafe = (s: string) => s.replace(/[‑‐]/g, '-').replace(/[′]/g, "'").replace(/[″]/g, '"')
  .replace(/[^\x20-\x7E -ÿ–—‘’“”•…€]/g, '?');

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = pdfSafe(text).split(/\s+/); const lines: string[] = []; let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) > width && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

async function buildPdf(rec: Record<string, string>) {
  const doc = await PDFDocument.create();
  doc.setTitle(`${AGREEMENT_TITLE} — ${rec.agreementId}`); doc.setAuthor(OFFEROR.name); doc.setSubject(`Signed by ${rec.name}`);
  const reg = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ital = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const wf = asset('webfit-logo.png'), hc = asset('hcnz-icon.png');
  const wfImg = wf ? await doc.embedPng(wf) : null, hcImg = hc ? await doc.embedPng(hc) : null;
  const W = 595.28, H = 841.89, M = 54, CW = W - 2 * M;
  const maroon = rgb(0.43, 0.10, 0.16), grey = rgb(0.35, 0.3, 0.27), navy = rgb(0.05, 0.15, 0.45);
  let page: PDFPage = doc.addPage([W, H]); let y = H - M; let pageNo = 1;
  const footer = (p: PDFPage, n: number) => {
    p.drawText(pdfSafe(`Agreement ID ${rec.agreementId} · Version ${AGREEMENT_VERSION} · Page ${n}`), { x: M, y: 28, size: 8, font: reg, color: grey });
    p.drawText(pdfSafe(`${OFFEROR.name} · ${OFFEROR.web}`), { x: W - M - reg.widthOfTextAtSize(`${OFFEROR.name} · ${OFFEROR.web}`, 8), y: 28, size: 8, font: reg, color: grey });
  };
  const need = (h: number) => { if (y - h < 60) { footer(page, pageNo); page = doc.addPage([W, H]); pageNo++; y = H - M; } };
  const para = (t: string, size = 10, font = reg, color = rgb(0.13, 0.08, 0.06), gap = 5) => {
    for (const l of wrap(t, font, size, CW)) { need(size + 4); page.drawText(l, { x: M, y: y - size, size, font, color }); y -= size + 3.5; }
    y -= gap;
  };
  // Header
  if (wfImg) page.drawImage(wfImg, { x: M, y: y - 72, width: 72, height: 72 });
  if (hcImg) page.drawImage(hcImg, { x: W - M - 60, y: y - 66, width: 60, height: 60 });
  page.drawText('SIGNED AGREEMENT', { x: M + 86, y: y - 22, size: 11, font: bold, color: navy });
  page.drawText(pdfSafe(OFFEROR.name), { x: M + 86, y: y - 40, size: 16, font: bold, color: navy });
  page.drawText(pdfSafe(`Agreement ID ${rec.agreementId}`), { x: M + 86, y: y - 58, size: 10, font: reg, color: grey });
  y -= 92;
  para(AGREEMENT_TITLE, 15, bold, maroon, 4);
  para(`Version ${AGREEMENT_VERSION} · Between ${OFFEROR.name} (${OFFEROR.desc}) and ${rec.name}`, 9.5, reg, grey, 10);
  // Summary box
  para('Summary (for convenience — the clauses below govern)', 11, bold, maroon, 3);
  for (const s of SUMMARY) para(`•  ${s}`, 9.5, reg, rgb(0.2, 0.15, 0.12), 2);
  y -= 8;
  for (const s of SECTIONS) { need(40); para(s.h, 11.5, bold, maroon, 3); for (const p of s.p) para(p, 9.8); }
  // Execution
  need(260); y -= 6;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: maroon }); y -= 18;
  para('Execution', 13, bold, maroon, 6);
  para(`Signed electronically by the Co-founder:`, 10, bold);
  page.drawText(pdfSafe(rec.name), { x: M + 10, y: y - 26, size: 26, font: ital, color: navy }); y -= 34;
  page.drawLine({ start: { x: M, y }, end: { x: M + 300, y }, thickness: 0.6, color: grey }); y -= 14;
  para(`${rec.name} — ${INVITES[rec.token]?.role ?? 'Co-founder'}`, 9.5, reg, grey, 10);
  para(`Offered and accepted for ${OFFEROR.name} by ${OFFEROR.signatory}.`, 10, bold, rgb(0.13, 0.08, 0.06), 12);
  // Audit trail
  para('Signature record', 11.5, bold, maroon, 4);
  const rows: [string, string][] = [
    ['Agreement ID', rec.agreementId], ['Document version', AGREEMENT_VERSION], ['Signer name', rec.name], ['Signer email', rec.email],
    ['Signed (New Zealand time)', rec.signedNz], ['Signed (UTC)', rec.signedUtc], ['IP address', rec.ip], ['Device', rec.userAgent.slice(0, 110)],
    ['Acceptance', 'Ticked "I have read and agree to the terms and conditions" and submitted'], ['Text fingerprint (SHA-256)', rec.textHash],
  ];
  for (const [k, v] of rows) {
    const lines = wrap(v, reg, 9, CW - 150); need(lines.length * 12 + 4);
    page.drawText(pdfSafe(k), { x: M, y: y - 9, size: 9, font: bold, color: grey });
    lines.forEach((l, i) => page.drawText(l, { x: M + 150, y: y - 9 - i * 12, size: 9, font: reg, color: rgb(0.13, 0.08, 0.06) }));
    y -= lines.length * 12 + 4;
  }
  footer(page, pageNo);
  return doc.save();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? ''), name = String(body.name ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254);
  if (!INVITES[token]) return NextResponse.json({ message: 'This signing link is not valid.' }, { status: 404 });
  if (name.length < 3) return NextResponse.json({ message: 'Please type your full name.' }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
  if (body.agree !== true) return NextResponse.json({ message: 'Please tick the box to confirm you agree.' }, { status: 400 });
  if (!(await rateLimitOk(req, 'agreement', 5, 3600))) return NextResponse.json({ message: 'Too many attempts — please try again later.' }, { status: 429 });

  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).replace(/-/g, '');
  const rec: Record<string, string> = {
    token, name, email,
    agreementId: `WF-HCNZ-${ymd}-${randomBytes(4).toString('hex').toUpperCase()}`,
    signedUtc: now.toISOString(),
    signedNz: new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', dateStyle: 'full', timeStyle: 'long' }).format(now),
    ip: (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') ?? 'unknown',
    textHash: createHash('sha256').update(agreementText()).digest('hex'),
    version: AGREEMENT_VERSION,
  };
  const pdf = await buildPdf(rec);
  const pdfB64 = Buffer.from(pdf).toString('base64');

  // Keep a private copy of the signed PDF and the signature record.
  const admin = adminDb();
  if (admin) {
    await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});
    const a = await admin.storage.from(BUCKET).upload(`${rec.agreementId}.pdf`, pdf, { contentType: 'application/pdf' });
    const b = await admin.storage.from(BUCKET).upload(`${rec.agreementId}.json`, JSON.stringify(rec, null, 1), { contentType: 'application/json' });
    if (a.error || b.error) console.error('agreement storage failed', a.error?.message, b.error?.message);
  }

  const filename = `${rec.agreementId}.pdf`;
  const lines = [
    `Namaste ${name},`,
    `Thank you for signing the ${AGREEMENT_TITLE}. Your signed copy is attached.`,
    `Agreement ID: ${rec.agreementId}\nSigned: ${rec.signedNz}\nIP address: ${rec.ip}`,
    `${OFFEROR.name} confirms its acceptance of the agreement. Please keep this email and the attached PDF for your records.`,
    `Warm regards,\n${OFFEROR.signatory}`,
  ];
  const footer = `${OFFEROR.name} · ${OFFEROR.email} · ${OFFEROR.web}`;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const team = process.env.AGREEMENT_NOTIFY_EMAIL ?? process.env.NOTIFY_EMAIL ?? OFFEROR.email;
  const [toSigner, toTeam] = await Promise.all([
    sendEmail({ to: email, subject: `Signed agreement ${rec.agreementId} — Hindu Calendar NZ`, text: lines.join('\n\n'), html: html(lines.map((l) => esc(l).replace(/\n/g, '<br>')), esc(footer)), attachments: [{ filename, content: pdfB64 }], replyTo: OFFEROR.email }),
    sendEmail({ to: team.split(',').map((s) => s.trim()), subject: `[Agreement signed] ${name} — ${rec.agreementId}`, text: Object.entries(rec).filter(([k]) => k !== 'token').map(([k, v]) => `${k}: ${v}`).join('\n'), attachments: [{ filename, content: pdfB64 }] }),
  ]);
  return NextResponse.json({ id: rec.agreementId, pdf: pdfB64, emailed: toSigner && toTeam });
}
