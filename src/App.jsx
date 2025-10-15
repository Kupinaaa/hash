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
  // btoa works on binary strings; bytes are 0..255
  return btoa(binary)
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
          setTimeout(() => setCopied(false), 1200)
        } catch {}
      }}
      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label="Copy to clipboard"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function App() {
  const [passphrase, setPassphrase] = useState('')
  const [salt, setSalt] = useState('')

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

      const hex = toHex(bytes) // 64-char hex
      const b64 = toBase64(bytes).replace(/=+$/, '') // strip padding
      if (cancelled) return

      // 16-char alnum derived deterministically, only [A-Za-z0-9]
      const extra = await sha256Bytes(`${input}|16`)
      if (cancelled) return
      let short = ''
      for (let i = 0; i < 16; i++) short += base62[extra[i] % 62]

      setHex64(hex)
      setB64_24(b64.slice(0, 24))
      setAlnum16(short)
    })()
    return () => {
      cancelled = true
    }
  }, [input, passphrase, salt])

  return (
    <div className="min-h-full text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/70 ring-1 ring-slate-700/70">
            <span className="text-xl">#</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">SHA-256 Hash Generator</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter a passphrase and an optional salt. Results update instantly.
          </p>
        </header>

        <section className="rounded-2xl bg-slate-900/60 p-6 shadow-2xl ring-1 ring-slate-800/80 backdrop-blur">
          <div className="grid gap-4">
            <Field
              id="pass"
              label="Passphrase"
              value={passphrase}
              placeholder="Enter passphrase"
              onChange={setPassphrase}
            />
            <Field
              id="salt"
              label="Salt (optional)"
              value={salt}
              placeholder="Enter salt"
              onChange={setSalt}
            />
          </div>

          <div className="mt-6 grid gap-4">
            <ResultRow label="16-character (alnum)">
              <Mono value={alnum16} placeholder="—" />
              <CopyButton value={alnum16} />
            </ResultRow>
            <ResultRow label="24-character (Base64, trimmed)">
              <Mono value={b64_24} placeholder="—" />
              <CopyButton value={b64_24} />
            </ResultRow>
            <ResultRow label="64-character (hex)">
              <Mono value={hex64} placeholder="—" />
              <CopyButton value={hex64} />
            </ResultRow>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400">
          No data leaves your browser. Uses Web Crypto SHA-256.
        </footer>
      </div>
    </div>
  )
}

function ResultRow({ label, children }) {
  return (
    <div className="grid items-start gap-2 sm:grid-cols-[180px_1fr_auto]">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function Mono({ value, placeholder = '' }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 font-mono text-sm text-slate-100">
      <div className="min-w-0 break-words">
        {value ? (
          <span className="select-all">{value}</span>
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
      </div>
    </div>
  )
}

function Field({ id, label, value, placeholder, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-base text-slate-100 shadow-sm outline-none ring-slate-500 placeholder:text-slate-500 focus:border-slate-500 focus:ring-2"
        autoComplete="off"
      />
    </div>
  )
}
