export function SierraLeoneFlag({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Green stripe */}
      <rect width="900" height="200" fill="#007a5e" />
      {/* White stripe */}
      <rect y="200" width="900" height="200" fill="#ffffff" />
      {/* Blue stripe */}
      <rect y="400" width="900" height="200" fill="#0066cc" />
    </svg>
  )
}
