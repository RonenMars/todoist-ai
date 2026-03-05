import type { ColorKey } from '@doist/todoist-api-typescript'
import { colors } from '@doist/todoist-api-typescript'
import { z } from 'zod'

const colorKeys = colors.map((c) => c.key) as [ColorKey, ...ColorKey[]]

// Known aliases: the Todoist REST API returns these keys but the SDK uses different names.
// See https://developer.todoist.com/guides/#colors
export const API_COLOR_ALIASES: Record<string, string> = {
    grey: 'gray', // API returns "grey" (British spelling), SDK uses "gray"
    teal: 'turquoise', // API docs list "teal" for ID 38, SDK uses "turquoise"
}

function normalizeColor(val: unknown): string | undefined {
    if (typeof val !== 'string') return undefined
    const lower = val.toLowerCase()
    const aliased = API_COLOR_ALIASES[lower] ?? lower
    const found =
        colors.find((c) => c.key === aliased) ??
        colors.find((c) => c.displayName.toLowerCase() === aliased)
    return found?.key // undefined if not recognized
}

function normalizeOutputColor(val: unknown): unknown {
    if (typeof val !== 'string') return val
    const lower = val.toLowerCase()
    return API_COLOR_ALIASES[lower] ?? lower
}

const colorDescription =
    'Color for the entity. Accepts a color key (e.g. "berry_red") or display name (e.g. "Berry Red"). ' +
    `Valid colors: ${colorKeys.join(', ')}. ` +
    'Aliases "grey" (→ gray) and "teal" (→ turquoise) are also accepted. ' +
    'Unrecognized colors are omitted and charcoal will be used as the default.'

// For INPUT: normalizes key or display name → canonical key (or undefined if unrecognized)
export const ColorSchema = z
    .preprocess(normalizeColor, z.enum(colorKeys).optional())
    .describe(colorDescription)

// For OUTPUT: strict enum. Kept for reference — output schemas use ColorOutputSchema.
export const ColorKeySchema = z.enum(colorKeys).describe('The color key of the entity.')

// For OUTPUT (tolerant): normalizes known API aliases (e.g. "grey" → "gray", "teal" →
// "turquoise") and silently coerces truly unrecognised values to undefined instead of
// raising a validation error.  Fixes both failure modes described in issue #343:
//   1. Full list — loud MCP output-validation error (-32602)
//   2. Name search — silent empty result set due to swallowed validation error
// This is the output-side counterpart to ColorSchema, which uses .preprocess()/.catch() for
// input normalisation (added in PR #328).
export const ColorOutputSchema = z
    .preprocess(normalizeOutputColor, z.enum(colorKeys).optional())
    .catch(undefined)
    .describe('The color key of the entity.')
