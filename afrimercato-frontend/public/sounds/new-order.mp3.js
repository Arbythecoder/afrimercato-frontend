// Base64 encoded notification sound (short, pleasant ding)
// This is a simple notification sound that works in all browsers
export const NEW_ORDER_SOUND_BASE64 = 'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAEsADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjkxAAAAAAAAAAAAAAAAJAAAAAAAAAAABLCXUPpjAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'

export const playNotificationSound = () => {
  try {
    const audio = new Audio(NEW_ORDER_SOUND_BASE64)
    audio.volume = 0.5 // 50% volume
    audio.play().catch(err => console.log('Sound play failed:', err))
  } catch (error) {
    console.log('Error playing notification sound:', error)
  }
}
