import { useStore } from '../../store/useStore'
import { getCurrencySymbol } from '../../utils/helpers'

export default function NairaIcon({ size = 24, className = '' }) {
  const { settings } = useStore()
  const symbol = getCurrencySymbol(settings?.currency)
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
      {symbol}
    </span>
  )
}
