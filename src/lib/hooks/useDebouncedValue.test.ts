/** 
 * @vitest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useDebouncedValue', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })
    it('returns initial value immediately', () => {
        const { result } = renderHook(
            ({ v }) => useDebouncedValue(v, 400),
            { initialProps: { v: 'a' }}
        )
        expect(result.current).toBe('a')
    })
    it('doesnt return changed value before delay', () => {
        const { result, rerender } = renderHook(
            ({ v }) => useDebouncedValue(v, 400),
            { initialProps: { v: 'a' }}
        )
        expect(result.current).toBe('a')
        rerender({ v: 'b'})
        expect(result.current).toBe('a')
    })
    it('returns changed value after delay', () => {
        const { result, rerender } = renderHook(
            ({ v }) => useDebouncedValue(v, 400),
            { initialProps: { v: 'a' }}
        )
        expect(result.current).toBe('a')
        rerender({ v: 'b'})
        expect(result.current).toBe('a')
        act(() => { vi.advanceTimersByTime(400)})
        expect(result.current).toBe('b')
    })
    it('returns latest changed value after quick changes', () => {
        const { result, rerender } = renderHook(
            ({ v }) => useDebouncedValue(v, 400),
            { initialProps: { v: 'a' }}
        )
        rerender({ v: 'b'})
        act(() => { vi.advanceTimersByTime(100)})
        rerender({ v: 'c'})
        act(() => { vi.advanceTimersByTime(350)})
        expect(result.current).toBe('a')
        act(() => { vi.advanceTimersByTime(50)})
        expect(result.current).toBe('c')
    })
})
