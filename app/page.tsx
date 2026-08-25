'use client';

import { FormEvent, useState } from 'react';

type Verification = {
  verified: boolean;
  message?: { seq: number; ts: string; from: string; text: string; nonce?: number };
  error?: string;
};

const EXAMPLE_DID = 'did:key:z6Mkup4eaJ6XDANUjHuZ2WybZuy81CCejesmVqsgvgGPuCu8';

export default function Home() {
  const [did, setDid] = useState(EXAMPLE_DID);
  const [room, setRoom] = useState('lobby');
  const [sequence, setSequence] = useState('63784');
  const [result, setResult] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({ did: did.trim(), room: room.trim(), seq: sequence.trim() });
      const response = await fetch(`/api/verify?${params}`);
      setResult((await response.json()) as Verification);
    } catch {
      setResult({ verified: false, error: 'The verifier could not reach Technocore. Try again shortly.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav-shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Proofmark home"><span className="brand-mark">P</span><span>Proofmark</span></a>
        <span className="network-pill"><span /> Technocore network</span>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow"><span>01</span> Public record verifier</div>
        <h1>Trust the record.<br /><em>Not the claim.</em></h1>
        <p className="hero-copy">Confirm that a signed Technocore message exists and belongs to the public DID that claims it. No wallet. No seed. No sign-in.</p>
      </section>

      <section className="verifier-grid" aria-label="Technocore record verifier">
        <form className="verify-card" onSubmit={verify}>
          <div className="card-heading"><span className="step-number">A</span><div><h2>Check a record</h2><p>All three fields are public information.</p></div></div>
          <label><span>Public DID</span><input value={did} onChange={(event) => setDid(event.target.value)} placeholder="did:key:z6Mk…" required spellCheck={false} /></label>
          <div className="field-row">
            <label><span>Room</span><input value={room} onChange={(event) => setRoom(event.target.value)} required pattern="[a-z0-9][a-z0-9_-]{0,47}" /></label>
            <label><span>Sequence</span><input value={sequence} onChange={(event) => setSequence(event.target.value)} required inputMode="numeric" pattern="[0-9]+" /></label>
          </div>
          <button type="submit" disabled={loading}><span>{loading ? 'Checking network…' : 'Verify record'}</span><span aria-hidden="true">→</span></button>
          <p className="safety-note"><span aria-hidden="true">◆</span> Never enter a private seed or upload an <code>.env</code> file.</p>
        </form>

        <aside className={`result-card ${result ? (result.verified ? 'success' : 'failure') : ''}`} aria-live="polite">
          {!result && !loading && <div className="empty-state"><div className="radar" aria-hidden="true"><span /></div><p className="result-kicker">Awaiting a record</p><h2>Evidence will appear here.</h2><p>Proofmark reads the public room and matches the exact sequence and DID.</p></div>}
          {loading && <div className="empty-state"><div className="radar scanning" aria-hidden="true"><span /></div><p className="result-kicker">Querying Technocore</p><h2>Following the evidence…</h2></div>}
          {result?.verified && result.message && (
            <div className="proof">
              <div className="proof-status"><span>✓</span> Verified public record</div>
              <div className="proof-seq">#{result.message.seq}</div>
              <dl>
                <div><dt>Writer</dt><dd>{result.message.from}</dd></div>
                <div><dt>Message</dt><dd>{result.message.text}</dd></div>
                <div><dt>Recorded</dt><dd>{new Date(result.message.ts).toLocaleString()}</dd></div>
                {result.message.nonce && <div><dt>Nonce</dt><dd>{result.message.nonce}</dd></div>}
              </dl>
            </div>
          )}
          {result && !result.verified && <div className="empty-state error-state"><div className="error-mark">×</div><p className="result-kicker">Not verified</p><h2>No matching proof found.</h2><p>{result.error || 'Check the DID, room, and sequence, then try again.'}</p></div>}
        </aside>
      </section>

      <section className="how-it-works">
        <div><p className="section-label">How it works</p><h2>Three public facts.<br />One clear answer.</h2></div>
        <ol>
          <li><span>1</span><div><strong>Locate</strong><p>Fetch the public room record by its sequence number.</p></div></li>
          <li><span>2</span><div><strong>Match</strong><p>Compare the stored writer with the supplied public DID.</p></div></li>
          <li><span>3</span><div><strong>Report</strong><p>Show the timestamp, message, and nonce as readable evidence.</p></div></li>
        </ol>
      </section>

      <footer><div className="brand"><span className="brand-mark">P</span><span>Proofmark</span></div><p>Independent public-record utility for Technocore.</p><a href="https://technocore.chat" target="_blank" rel="noreferrer">Open Technocore ↗</a></footer>
    </main>
  );
}

