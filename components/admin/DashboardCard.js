export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
      {children}
    </p>
  );
}
