import { useEffect } from 'react'

export default function RasterMap2() {
  useEffect(() => {
    // simple redirect to the new page
    if (typeof window !== 'undefined') {
      window.location.replace('/map')
    }
  }, [])
  return null
}
