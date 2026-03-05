import { colors } from '@doist/todoist-api-typescript'
import { describe, expect, it } from 'vitest'
import { ColorOutputSchema, ColorSchema } from '../colors.js'

// The Todoist REST API uses different keys for some colors compared to the SDK.
// See https://developer.todoist.com/guides/#colors
// Known discrepancies:
//   grey      (API ID 48) → SDK key: "gray"
//   teal      (API ID 38) → SDK key: "turquoise"

describe('ColorOutputSchema', () => {
    describe('all 20 SDK colors pass through unchanged', () => {
        it.each(
            colors.map((c) => [c.key, c.key] as [string, string]),
        )('parse("%s") → "%s"', (input, expected) => {
            expect(ColorOutputSchema.parse(input)).toBe(expected)
        })
    })

    describe('known API aliases are normalized to SDK keys', () => {
        it('normalizes "grey" to "gray" (API returns British spelling)', () => {
            expect(ColorOutputSchema.parse('grey')).toBe('gray')
        })

        it('normalizes "teal" to "turquoise" (API docs use "teal" for ID 38)', () => {
            expect(ColorOutputSchema.parse('teal')).toBe('turquoise')
        })

        it('normalizes aliases case-insensitively', () => {
            expect(ColorOutputSchema.parse('GREY')).toBe('gray')
            expect(ColorOutputSchema.parse('Grey')).toBe('gray')
            expect(ColorOutputSchema.parse('TEAL')).toBe('turquoise')
            expect(ColorOutputSchema.parse('Teal')).toBe('turquoise')
        })
    })

    describe('truly unrecognized values coerce to undefined', () => {
        it.each(['purple', 'unknown-color', 'fuschia', ''])('parse("%s") → undefined', (input) => {
            expect(ColorOutputSchema.parse(input)).toBeUndefined()
        })
    })

    describe('nullish values coerce to undefined', () => {
        it('handles undefined', () => {
            expect(ColorOutputSchema.parse(undefined)).toBeUndefined()
        })

        it('handles null', () => {
            expect(ColorOutputSchema.parse(null)).toBeUndefined()
        })

        it('handles non-string types', () => {
            expect(ColorOutputSchema.parse(42)).toBeUndefined()
            expect(ColorOutputSchema.parse({})).toBeUndefined()
        })
    })
})

describe('ColorSchema (input)', () => {
    describe('all 20 SDK color keys are accepted', () => {
        it.each(
            colors.map((c) => [c.key, c.key] as [string, string]),
        )('parse("%s") → "%s"', (input, expected) => {
            expect(ColorSchema.parse(input)).toBe(expected)
        })
    })

    describe('display names are accepted (case-insensitive)', () => {
        it('accepts "Berry Red" → "berry_red"', () => {
            expect(ColorSchema.parse('Berry Red')).toBe('berry_red')
        })

        it('accepts lowercase display name "berry red" → "berry_red"', () => {
            expect(ColorSchema.parse('berry red')).toBe('berry_red')
        })

        it('accepts "Mint Green" → "mint_green"', () => {
            expect(ColorSchema.parse('Mint Green')).toBe('mint_green')
        })

        it('accepts "Sky Blue" → "sky_blue"', () => {
            expect(ColorSchema.parse('Sky Blue')).toBe('sky_blue')
        })
    })

    describe('known API aliases are normalized to SDK keys', () => {
        it('normalizes "grey" to "gray"', () => {
            expect(ColorSchema.parse('grey')).toBe('gray')
        })

        it('normalizes "teal" to "turquoise"', () => {
            expect(ColorSchema.parse('teal')).toBe('turquoise')
        })
    })

    describe('unrecognized colors return undefined', () => {
        it.each(['purple', 'unknown', 'fuschia'])('parse("%s") → undefined', (input) => {
            expect(ColorSchema.parse(input)).toBeUndefined()
        })
    })
})
