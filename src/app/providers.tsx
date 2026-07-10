'use client'

import { ApiError } from "@/lib/api/openf1"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

const QueryProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: (failureCount, error) => {
                    if (error instanceof ApiError && error.status >=400 && error.status < 500) {
                        if (error.status === 429) {
                            return failureCount < 4
                        }
                        return false
                    }
                    return failureCount < 2
                },
                retryDelay: (failureCount, error) => {
                    if (error instanceof ApiError && error.status === 429) {
                        return Math.min(5000 * (failureCount + 1), 20000)
                    }
                    console.log("retryDelay called:", failureCount);
                    return Math.min(1000 * (failureCount + 1), 20000)
                    // TODO: error.tsx failureCount message
                },
                staleTime: Infinity,
            }
        }
    }))
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider