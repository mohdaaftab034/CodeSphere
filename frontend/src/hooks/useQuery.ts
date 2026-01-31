import { useState, useEffect } from "react"

interface UseQueryOptions {
  enabled?: boolean
}

export function useQuery<T>(
  queryFn: () => Promise<T>,
  options?: UseQueryOptions
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const enabled = options?.enabled !== false

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await queryFn()
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [queryFn, enabled])

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  return { data, error, isLoading, refetch }
}
