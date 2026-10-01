export default function Footer() {
  return (
    <footer className="border-t bg-white py-4 text-center text-sm text-slate-500">
      {/* new Date().getFullYear() prints the current year automatically. */}
      CampusFind © {new Date().getFullYear()} · Helping students find what they lose
    </footer>
  )
}