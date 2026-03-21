import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getRandomMessage } from '../src/messageSelector.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureMessages = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures/messages.json'), 'utf8')
)

// El fixture solo tiene la categoria "chistes".
// Los tests usan esa categoria como pool para morning y evening.
const mockMessages = {
  buenos_dias:    fixtureMessages.chistes,
  buenas_tardes:  fixtureMessages.chistes,
  motivacionales: fixtureMessages.chistes,
  amorosos:       fixtureMessages.chistes,
  chistes:        fixtureMessages.chistes,
}

const emptyLog = { buenos_dias: [], buenas_tardes: [], motivacionales: [], amorosos: [], chistes: [] }

function setupFileMocks(sentLog = emptyLog) {
  vi.mocked(fs.existsSync).mockReturnValue(true)
  vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
    const p = String(filePath)
    if (p.includes('messages.json')) return JSON.stringify(mockMessages)
    if (p.includes('sent-log.json')) return JSON.stringify(sentLog)
    throw new Error(`Archivo inesperado en mock: ${p}`)
  })
}

beforeEach(() => {
  vi.spyOn(fs, 'existsSync')
  vi.spyOn(fs, 'readFileSync')
  vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getRandomMessage', () => {
  test('retorna un string no vacio', () => {
    setupFileMocks()
    const msg = getRandomMessage('morning')
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  test('guarda el log despues de cada envio', () => {
    setupFileMocks()
    getRandomMessage('morning')
    expect(fs.writeFileSync).toHaveBeenCalledOnce()
  })

  test('morning con categoria primaria retorna mensaje del fixture', () => {
    // Math.random >= 0.4 => useSupplementary = false => primaryCategory = 'buenos_dias'
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    setupFileMocks()

    const msg = getRandomMessage('morning')

    expect(fixtureMessages.chistes).toContain(msg)
  })

  test('evening con categoria primaria retorna mensaje del fixture', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    setupFileMocks()

    const msg = getRandomMessage('evening')

    expect(fixtureMessages.chistes).toContain(msg)
  })

  test('morning con categoria suplementaria retorna mensaje del fixture', () => {
    // 1. 0.1 < 0.4 => useSupplementary = true
    // 2. floor(0.1 * 2) = 0 => supplementary[0] = 'motivacionales'
    // 3. floor(0.1 * 5) = 0 => primer indice del pool
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    setupFileMocks()

    const msg = getRandomMessage('morning')

    expect(fixtureMessages.chistes).toContain(msg)
  })

  test('morning con categoria suplementaria puede retornar amorosos', () => {
    // 1. 0.1 < 0.4 => useSupplementary = true
    // 2. floor(0.5 * 3) = 1 => supplementary[1] = 'amorosos'
    // 3. floor(0.99 * 5) = 4 => ultimo indice del pool
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.99)
    setupFileMocks()

    const msg = getRandomMessage('morning')

    expect(fixtureMessages.chistes).toContain(msg)
  })

  test('no repite mensajes ya enviados en la misma categoria', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // categoria primaria (buenos_dias)
    const logConCasiTodo = { ...emptyLog, buenos_dias: [0, 1, 2, 4] }
    setupFileMocks(logConCasiTodo)

    const msg = getRandomMessage('morning')

    // El unico disponible es el indice 3
    expect(msg).toBe(fixtureMessages.chistes[3])
  })

  test('reinicia el pool cuando la categoria se agota', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const logAgotado = { ...emptyLog, buenos_dias: [0, 1, 2, 3, 4] }
    setupFileMocks(logAgotado)
    vi.spyOn(console, 'log').mockImplementation(() => {})

    const msg = getRandomMessage('morning')

    expect(typeof msg).toBe('string')
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('agotado'))
  })

  test('funciona con log vacio (primer uso, sin sent-log.json)', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      if (String(filePath).includes('messages.json')) return JSON.stringify(mockMessages)
      throw new Error('sent-log.json no deberia leerse si existsSync retorna false')
    })

    const msg = getRandomMessage('morning')

    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  test('lanza error si messages.json no se puede leer', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory')
    })

    expect(() => getRandomMessage('morning')).toThrow('No se pudo cargar messages.json')
  })
})
