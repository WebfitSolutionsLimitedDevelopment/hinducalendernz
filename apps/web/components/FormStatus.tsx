const MSG: Record<string, string> = {
  email: 'Please enter a valid email address.',
  missing: 'Please fill in the required fields.',
  invalid: 'Please check the website address and email.',
  rate: 'Too many submissions from this connection — please try again in an hour.',
  closed: 'We couldn’t take that just now — please email info@webfitt.co.nz or call 022 129 9323.',
  save: 'Sorry, something went wrong saving that. Please try again.',
};

export function FormStatus({ sp, thanks }: { sp: { thanks?: string; error?: string }; thanks: string }) {
  if (sp.thanks) return <p className="flag ok" role="status">{thanks}</p>;
  if (sp.error) return <p className="flag" role="alert">{MSG[sp.error] ?? MSG.save}</p>;
  return null;
}

/** Off-screen field that only bots fill in. */
export function Honeypot({ name = 'website' }: { name?: string }) {
  return (
    <div className="hp" aria-hidden="true">
      <label htmlFor={name}>Leave blank</label>
      <input id={name} name={name} tabIndex={-1} autoComplete="off" />
    </div>
  );
}
