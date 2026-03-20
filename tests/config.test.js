import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

// Evita que dotenv lea el archivo .env durante los tests
vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
  config: vi.fn(),
}))

import { normalizePhone, validate } from '../src/config.js'

describe('normalizePhone', () => {
  test('agrega codigo de pais si no esta presente', () => {
    expect(normalizePhone('12345678', '502')).toBe('50212345678')
  })

  test('no duplica el codigo de pais si ya esta presente', () => {
    expect(normalizePhone('50212345678', '502')).toBe('50212345678')
  })

  test('elimina espacios, guiones y simbolo +', () => {
    expect(normalizePhone('+502 1234-5678', '502')).toBe('50212345678')
  })

  test('elimina parentesis del formato internacional', () => {
    expect(normalizePhone('(502) 1234-5678', '502')).toBe('50212345678')
  })

  test('retorna null si el valor es null', () => {
    expect(normalizePhone(null, '502')).toBeNull()
  })

  test('retorna null si el valor es undefined', () => {
    expect(normalizePhone(undefined, '502')).toBeNull()
  })

  test('funciona con codigo de pais de otros paises', () => {
    expect(normalizePhone('5512345678', '52')).toBe('525512345678')
  })

  test('no duplica prefijo cuando el numero ya lo incluye con otro pais', () => {
    expect(normalizePhone('5215512345678', '52')).toBe('5215512345678')
  })
})

describe('validate', () => {
  test('llama process.exit(1) cuando FROM_PHONE o TARGET_PHONE son null', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // En el entorno de test, FROM_PHONE y TARGET_PHONE son null porque
    // dotenv esta mockeado y no se han definido las variables de entorno
    validate()

    expect(exitSpy).toHaveBeenCalledWith(1)

    exitSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
