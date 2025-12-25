import { defineEventHandler, getQuery, type H3Event } from 'h3'
import type { QDBI } from '../../shared/types'
import hdetails from '../../data/editions/en.json'
import hbook from '../../data/quran.json'

export interface QSDT {
    chapter: number
    verse: number
    text: string
}

/**
 * GET /api/quran
 * Returns an array of chapters with ayat, or chapter details when using ?s={id}
 */
export default defineEventHandler((event: H3Event) => {
    const params = getQuery(event) as Record<string, any>
    const s = params?.s

    const ready: Array<{
        id: number
        name: string
        e_name: string
        type: string
        total_verses: number
        ayat: QSDT[]
    }> = []

    // hdetails is a map keyed by chapter number (string) -> array of verses with english text
    // hbook is the arabic text with same shape. We will use metadata from hdetails and ayat from hbook.
    Object.keys(hdetails as any).forEach((key) => {
        const id = Number(key)
        const metaSample = ((hdetails as any)[key] || [])[0] as any
        const ayat = ((hbook as any)[key] || []) as QSDT[]
        if (!Array.isArray(ayat)) return
        ready.push({
            id,
            name: String(metaSample?.suraName || ''),
            e_name: String(metaSample?.suraName || ''),
            type: String(metaSample?.type || ''),
            total_verses: ayat.length,
            ayat: ayat as QSDT[],
        })
    })

    if (s) {
        const idx = Number(Array.isArray(s) ? s[0] : s)
        const found = ready.find((r) => r.id === idx)
        return found as unknown as QDBI
    }
    return ready as unknown as QDBI
})
