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
                            return false
                    }
                    return failureCount < 2
                },
                staleTime: Infinity,
            }
        }
    }))
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider