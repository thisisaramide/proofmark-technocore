import { NextRequest, NextResponse } from 'next/server';

type TechnocoreMessage = { seq: number; ts: string; from: string; text: string; nonce?: number };

export async function GET(request: NextRequest) {
  const didInput = request.nextUrl.searchParams.get('did')?.trim() || '';
  const did = didInput.startsWith('z6Mk') ? `did:key:${didInput}` : didInput;
  const room = request.nextUrl.searchParams.get('room')?.trim() || '';
  const seqText = request.nextUrl.searchParams.get('seq')?.trim() || '';

  // Ed25519 did:key identifiers use a base58btc payload beginning with z6Mk.
  // Accept the canonical range instead of pinning one encoded payload length;
  // this keeps the verifier compatible with valid did:key encoders.
  if (!/^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]{40,50}$/.test(did)) return NextResponse.json({ verified: false, error: 'Enter a valid Ed25519 did:key identifier.' }, { status: 400 });
  if (!/^[a-z0-9][a-z0-9_-]{0,47}$/.test(room)) return NextResponse.json({ verified: false, error: 'Enter a valid Technocore room name.' }, { status: 400 });
  if (!/^[0-9]+$/.test(seqText)) return NextResponse.json({ verified: false, error: 'Sequence must be a positive number.' }, { status: 400 });

  const seq = Number(seqText);
  if (!Number.isSafeInteger(seq) || seq < 1) return NextResponse.json({ verified: false, error: 'Sequence is outside the supported range.' }, { status: 400 });

  try {
    // Technocore exposes only the newest 200 messages in a room. Its `since`
    // cursor filters that tail; it is not random-access pagination. Fetch the
    // full public window so an older sequence is never misreported as absent.
    const endpoint = `https://technocore.chat/r/${encodeURIComponent(room)}?format=json&limit=200&n=${Date.now()}`;
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(12000), cache: 'no-store' });
    if (!response.ok) throw new Error(`Technocore returned ${response.status}`);
    const data = (await response.json()) as { first_seq?: number | null; last_seq?: number | null; messages?: TechnocoreMessage[] };
    const message = data.messages?.find((item) => item.seq === seq);
    if (!message && data.first_seq && seq < data.first_seq) {
      return NextResponse.json({ verified: false, error: `Sequence ${seq} is older than this room’s public 200-message lookup window, which now starts at ${data.first_seq}. Technocore does not expose random-access history.` });
    }
    if (!message && data.last_seq && seq > data.last_seq) {
      return NextResponse.json({ verified: false, error: `Sequence ${seq} is newer than the room’s latest public record (${data.last_seq}).` });
    }
    if (!message) return NextResponse.json({ verified: false, error: 'That sequence was not found inside the room’s current public lookup window.' });
    if (message.from !== did) return NextResponse.json({ verified: false, error: 'The record exists, but it belongs to a different DID.' });
    return NextResponse.json({ verified: true, message });
  } catch {
    return NextResponse.json({ verified: false, error: 'Technocore is unavailable or did not respond in time.' }, { status: 502 });
  }
}

