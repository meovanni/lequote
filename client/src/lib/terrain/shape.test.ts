import { describe, expect, it } from 'vitest'
import { coastXAt, insidePolygon, longestRun, nearestOnPolygon, type Point } from './shape'

const square: Point[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
]

describe('forma della regione', () => {
  it('riconosce i punti dentro e fuori', () => {
    expect(insidePolygon([5, 5], square)).toBe(true)
    expect(insidePolygon([15, 5], square)).toBe(false)
  })

  it('posa un punto esterno sul lato più vicino', () => {
    expect(nearestOnPolygon([14, 4], square)).toEqual([10, 4])
    expect(nearestOnPolygon([-3, -3], square)).toEqual([0, 0])
  })

  it('trova il tratto più lungo, anche a cavallo della fine', () => {
    expect(longestRun([true, false, true, true, false])).toEqual([2, 3])
    expect(longestRun([true, true, false, false, true, true])).toEqual([4, 5, 0, 1])
    expect(longestRun([false, false])).toEqual([])
  })

  it('scavalca i buchi corti', () => {
    expect(longestRun([false, true, true, false, true, true, false, false, false], 1)).toEqual([1, 2, 3, 4, 5])
    expect(longestRun([false, true, false, false, true, false], 1)).toEqual([1])
  })

  it('interpola la costa lungo z e la tiene ferma oltre gli estremi', () => {
    const coast: Point[] = [
      [0, -10],
      [10, 10],
    ]
    expect(coastXAt(coast, 0)).toBe(5)
    expect(coastXAt(coast, -50)).toBe(0)
    expect(coastXAt(coast, 50)).toBe(10)
  })
})
