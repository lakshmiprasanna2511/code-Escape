import { useStore } from '../store/useStore.js';

export default function Toast() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div className="toast-msg" key={t.id}>{t.msg}</div>
      ))}
    </div>
  );
}
