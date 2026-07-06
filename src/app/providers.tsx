'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

const QueryProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
            }
        }
    }))
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider