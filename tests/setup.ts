import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/dom'

afterEach(() => {
  cleanup()
})

const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
})

Object.defineProperty(globalThis, 'sessionStorage', {
  value: mockStorage,
  writable: true,
})
