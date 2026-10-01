export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-800 bg-stone-900 py-10 text-xs text-stone-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-amber-200">Villa Serena</span>
          <span>• Pousada & Refúgio Ecológico</span>
        </div>
        <div className="text-center text-stone-500 sm:text-right">
          Reservas e governança no mesmo sistema
        </div>
      </div>
    </footer>
  );
}
