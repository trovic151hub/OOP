export default function NairaIcon({ size = 24, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        fontSize: size * 0.82,
        fontWeight: 800,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      ₦
    </span>
  )
}
