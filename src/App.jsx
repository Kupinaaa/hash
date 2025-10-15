import { useEffect, useMemo, useState } from 'react'

const encoder = new TextEncoder()
const base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

async function sha256Bytes(message) {
  const data = encoder.encode(message)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hash)
}

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function toBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function IconCopy(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2"/>
      <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
    </svg>
  )
}
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconEyeOff(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M3 3l18 18"/>
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 3-3 3 3 0 0 0-4.4-2.4"/>
      <path d="M2 12s3.5-7 10-7c2.2 0 4.1.7 5.6 1.7M22 12s-3.5 7-10 7c-2.2 0-4.1-.7-5.6-1.7"/>
    </svg>
  )
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value || '')
          setCopied(true)
          setTimeout(() => setCopied(false), 1100)
        } catch {}
      }}
      className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/10 transition hover:bg-slate-700/80 hover:text-white"
      aria-label="Copy to clipboard"
    >
      {copied ? <IconCheck className="text-emerald-400"/> : <IconCopy/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function App() {
  const [passphrase, setPassphrase] = useState('')
  const [salt, setSalt] = useState('')
  const [showPass, setShowPass] = useState(false)

  const input = useMemo(() => `${passphrase}|${salt}`, [passphrase, salt])

  const [hex64, setHex64] = useState('')
  const [b64_24, setB64_24] = useState('')
  const [alnum16, setAlnum16] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!passphrase && !salt) {
        setHex64('')
        setB64_24('')
        setAlnum16('')
        return
      }
      const bytes = await sha256Bytes(input)
      if (cancelled) return
      const hex = toHex(bytes)
      const b64 = toBase64(bytes).replace(/=+$/, '')
      if (cancelled) return
      const extra = await sha256Bytes(`${input}|16`)
      if (cancelled) return
      let short = ''
      for (let i = 0; i < 16; i++) short += base62[extra[i] % 62]
      setHex64(hex)
      setB64_24(b64.slice(0, 24))
      setAlnum16(short)
    })()
    return () => { cancelled = true }
  }, [input, passphrase, salt])

  return (
    <div className="relative min-h-dvh bg-slate-950 text-slate-100">
      {/* Background grid + soft glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade opacity-60" />
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-b from-white/10 to-white/0 p-[1px]">
            <div className="rounded-2xl px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-slate-300 ring-1 ring-white/10">
              Cryptographic Utility
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            SHA‑256 Hash Generator
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            Type a passphrase and optional salt. Your hashes compute instantly in the browser.
          </p>
        </header>

        <section className="relative rounded-2xl bg-slate-900/70 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="pass"
              label="Passphrase"
              type={showPass ? 'text' : 'password'}
              value={passphrase}
              placeholder="Enter passphrase"
              onChange={setPassphrase}
              right={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="inline-flex items-center justify-center rounded-md px-2 py-1 text-slate-300 transition hover:bg-white/5 hover:text-white"
                  aria-label={showPass ? 'Hide passphrase' : 'Show passphrase'}
                >
                  {showPass ? <IconEyeOff/> : <IconEye/>}
                </button>
              }
            />
            <Field
              id="salt"
              label="Salt (optional)"
              value={salt}
              placeholder="Enter salt"
              onChange={setSalt}
            />
          </div>

          <div className="mt-7 grid gap-4">
            <ResultCard label="16‑character (alnum)" value={alnum16} />
            <ResultCard label="24‑character (Base64, trimmed)" value={b64_24} />
            <ResultCard label="64‑character (hex)" value={hex64} />
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400">
          No data leaves your browser. Uses Web Crypto SHA‑256.
        </footer>
      </div>
    </div>
  )
}

function ResultCard({ label, value }) {
  return (
    <div className="group relative">
      <div className="glow-ring absolute inset-0 rounded-xl" aria-hidden />
      <div className="relative flex min-h-[56px] items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 ring-1 ring-white/5 transition">
        <div className="mt-1 select-none rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 ring-1 ring-white/10">
          {label}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="min-w-0 break-words font-mono text-[13px] leading-relaxed text-slate-100">
            {value ? <span className="select-all">{value}</span> : <span className="text-slate-500">—</span>}
          </div>
          <CopyButton value={value} />
        </div>
      </div>
    </div>
  )
}

function Field({ id, label, value, placeholder, onChange, right, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 pr-${right ? '10' : '3'} text-base text-slate-100 shadow-sm outline-none ring-1 ring-white/5 placeholder:text-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-slate-500`}
          autoComplete="off"
        />
        {right ? (
          <div className="pointer-events-auto absolute inset-y-0 right-1 flex items-center">{right}</div>
        ) : null}
      </div>
    </div>
  )
}
