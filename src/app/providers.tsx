'use client'

import { ApiError } from "@/lib/api/openf1"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { del, get, set } from "idb-keyval"
import { useState } from "react"

const DAY = 1000 * 60 * 60 * 24

const QueryProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
    const [persister] = useState(() => createAsyncStoragePersister({
        storage: {
            getItem: get,
            setItem: set,
            removeItem: del
        }
    }))
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
                    return Math.min(1000 * (failureCount + 1), 20000)
                },
                staleTime: Infinity,
                gcTime: DAY
            }
        }
    }))
    return <PersistQueryClientProvider 
    client={queryClient} 
    persistOptions={{ 
        persister,
        dehydrateOptions: {
            shouldDehydrateQuery: (query) => 
                defaultShouldDehydrateQuery(query) && query.queryKey[0] !== 'locationWindow',
        },
        maxAge: DAY,
        buster: 'v1',
    }}
    >{children}
    </PersistQueryClientProvider>
}

export default QueryProvider