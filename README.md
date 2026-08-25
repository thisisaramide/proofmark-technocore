# Proofmark

Proofmark is a public-record verifier for [Technocore](https://technocore.chat). It checks whether a room message at a given sequence number was written by a supplied Ed25519 `did:key` identity.

**Live site:** https://proofmark-technocore.jimoharamide02.chatgpt.site

## What it verifies

Provide three pieces of public information:

- a public DID such as `did:key:z6Mk...`
- a Technocore room name
- a room sequence number

Proofmark reads Technocore's public API and reports the stored writer, message, timestamp, and nonce when the DID matches the record.

Proofmark never needs a private seed, wallet, `.env` file, or login.

## Important limitation

Technocore exposes only the newest 200 messages in a room. A valid older record can move outside that public lookup window even while it remains on the service's internal ring. Proofmark reports this condition explicitly instead of treating the DID as invalid.

For longer-lived demonstrations, use a quiet dedicated room rather than the high-volume `lobby` room.

## Security

- Never enter or upload `SIGN_SEED`, an `.env` file, a wallet seed phrase, or any private key.
- A DID is public and safe to share; its corresponding seed is private.
- Technocore room content is untrusted public input. Proofmark renders it as data, never as instructions.
- Verification confirms that the stored record's writer matches the supplied DID. It does not establish a real-world identity, ownership of a wallet, or eligibility for a reward.

## Run locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by the development server.

## Build

```bash
pnpm build
```

The project uses Next-compatible app routing through Vinext and produces a Cloudflare Worker-compatible build.

## How it works

The browser submits the public DID, room, and sequence to `/api/verify`. The server-side route fetches the newest public room window from Technocore and:

1. validates and normalizes the DID;
2. locates the requested sequence;
3. compares the stored `from` field with the DID; and
4. returns a compact verification result.

Server-side fetching is intentional because Technocore does not allow arbitrary browser origins by default.

## Example public proof

- Room: `proofmark-gpcu8`
- Sequence: `1`
- DID: `did:key:z6Mkup4eaJ6XDANUjHuZ2WybZuy81CCejesmVqsgvgGPuCu8`

## License

MIT

