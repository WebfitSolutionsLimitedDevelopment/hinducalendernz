import Link from 'next/link';

export const metadata = { title: 'How Hindu dates work in New Zealand' };

// Adapted from the founder's "Purpose and Guide" (Sept 2026).
export default function Page() {
  return (
    <article className="prose">
      <h1>How Hindu dates work in New Zealand</h1>
      <p className="lead">A time published for an Indian city is not automatically the right ritual time in Auckland. Here is why.</p>

      <h2>The lunar day does not follow midnight</h2>
      <p>
        A <strong>tithi</strong> is a Hindu lunar day, based on the angle between the Sun and the Moon. Each tithi covers 12° of
        that angle, and a lunar month has 30 of them. Their length varies, so a tithi can begin or end at any time of day — not at midnight.
      </p>
      <p>
        <strong>Shukla Paksha</strong> is the waxing fortnight and <strong>Krishna Paksha</strong> the waning fortnight. Shukla Panchami,
        for example, is the fifth tithi of the waxing fortnight. These are lunar dates, not the familiar Moon-phase names.
      </p>

      <h2>The same moment has different clock times</h2>
      <p>
        A tithi begins at the same physical instant everywhere, but clocks show it differently. India is UTC+5:30; mainland New Zealand
        is UTC+12, or UTC+13 during daylight saving. Auckland is therefore 6½ or 7½ hours ahead of India.
      </p>
      <p>
        A boundary at 6 pm in India is 12:30 am the next day in Auckland (1:30 am in daylight time). That converts the moment correctly
        — but it does <em>not</em> tell you which local date or time window a festival should use.
      </p>

      <h2>The ritual rule is applied locally</h2>
      <p>
        Sunrise, sunset and moonrise depend on where you are. A festival rule may look at which tithi is current at sunrise, in the
        evening, at midnight or at moonrise. Because those moments are different in Auckland, the observance date can differ from India —
        and you cannot work out which way simply because New Zealand is “ahead”.
      </p>
      <p>
        <strong>Example — Lakshmi Puja.</strong> Diwali’s Lakshmi Puja is performed when Amavasya overlaps <em>Pradosh</em>, the period
        after sunset. Converting an Indian evening window to Auckland time can land after midnight here, away from Auckland’s own sunset.
        The local window has to be calculated from Auckland’s sunset.
      </p>

      <h2>Astronomy and tradition</h2>
      <p>
        Astronomy gives measurable positions and times. Religious tradition decides how those are used. We explain both, and where
        traditions (for example Smarta and Vaishnava) choose different dates, we show the difference rather than choosing one for everyone.
      </p>

      <h2>Daylight saving</h2>
      <p>In 2027, New Zealand daylight saving ends on 4 April and begins on 26 September. All our times already include it.</p>

      <p><Link href="/how-to-use">How to use this calendar →</Link></p>
    </article>
  );
}
