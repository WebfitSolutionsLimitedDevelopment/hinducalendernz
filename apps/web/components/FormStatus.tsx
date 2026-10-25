const MSG: Record<string, string> = {
  email: 'Please enter a valid email address.',
  missing: 'Please fill in the required fields.',
  invalid: 'Please check the website address and email.',
  rate: 'Too many submissions from this connection — please try again in an hour.',
  closed: 'This form is not open yet — please try again soon.',
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
