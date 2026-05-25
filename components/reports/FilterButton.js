export default function FilterButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-colors font-medium ${
        active
          ? "bg-brand-soft-highlight text-gray-900 text-xs shadow-sm"
          : "bg-white text-gray-700 border text-xs border-gray-300 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
