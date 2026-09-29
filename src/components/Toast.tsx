/** Aviso curto e discreto. A região `status` fica sempre montada para ser anunciada de forma confiável. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-5"
    >
      {message && (
        <p className="rounded-md border border-ok/40 bg-surface px-4 py-2 font-mono text-sm text-ok shadow-lg">
          {message}
        </p>
      )}
    </div>
  )
}
