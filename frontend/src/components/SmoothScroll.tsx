import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)
    const { pathname, search } = useLocation()

    useEffect(() => {
        const lenis = new Lenis({
            duration: 2.2, // Ultra-slow for premium, stable feel
            lerp: 0.02, // Extremely smooth interpolation
            infinite: false,
            syncTouch: true,
            wheelMultiplier: 0.6, // Heavy, controlled wheel movement
            touchMultiplier: 1.5,
        })

        lenisRef.current = lenis

        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
            lenisRef.current = null
        }
    }, [])

    // Handle scroll to top on route change via Lenis
    useEffect(() => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true })
        }
        // Fallback or initial load
        window.scrollTo(0, 0)
    }, [pathname, search])

    return <>{children}</>
}
