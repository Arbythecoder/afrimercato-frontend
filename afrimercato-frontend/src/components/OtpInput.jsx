import { useRef } from 'react'

/**
 * OtpInput — 6-box numeric OTP input with auto-advance and paste support.
 * Props:
 *   length  {number}   — number of boxes (default 6)
 *   value   {string}   — current OTP string (controlled)
 *   onChange {fn}      — called with new OTP string
 *   disabled {bool}    — disables all inputs
 */
export default function OtpInput({ length = 6, value = '', onChange, disabled = false }) {
  const inputs = useRef([])

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = value.split('')
    arr[index] = digit
    const next = arr.join('').slice(0, length).padEnd(length, '')
    onChange(next.trimEnd()) // trim trailing empty chars
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputs.current[index - 1]?.focus()
        // Also clear the previous digit
        const arr = value.split('')
        arr[index - 1] = ''
        onChange(arr.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center" role="group" aria-label="One-time password">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl
            focus:border-afri-green focus:ring-2 focus:ring-afri-green/20 outline-none
            transition-all bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
            caret-transparent"
        />
      ))}
    </div>
  )
}
