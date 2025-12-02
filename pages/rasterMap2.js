import { useEffect } from 'react'

export default function RasterMap2() {
  useEffect(() => {
    // 이전 주소를 '/map'으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.replace('/map')
    }
  }, [])
  return null
}
