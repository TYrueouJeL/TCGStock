<script setup lang="ts">
import type { ProductType } from '~/types'

/** Stacked columns: items opened per month, split by product type. */
const props = defineProps<{ months: { month: string; items: Record<ProductType, number>; spent: number }[] }>()

// The drawing follows the container width so text stays at its real size.
const box = ref<HTMLElement | null>(null)
const W = ref(720)
const H = 240
const pad = { top: 12, right: 8, bottom: 28, left: 34 }
const plotW = computed(() => W.value - pad.left - pad.right)
const plotH = H - pad.top - pad.bottom
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(([entry]) => (W.value = Math.max(300, Math.round(entry!.contentRect.width))))
  if (box.value) ro.observe(box.value)
})
onBeforeUnmount(() => ro?.disconnect())

const max = computed(() => Math.max(1, ...props.months.map((m) => PRODUCT_TYPES.reduce((s, p) => s + m.items[p.value], 0))))
const ticks = computed(() => {
  const raw = max.value / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? raw
  const top = Math.ceil(max.value / step) * step
  return { step, top, values: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) }
})
const y = (v: number) => pad.top + plotH - (v / ticks.value.top) * plotH
const band = computed(() => plotW.value / Math.max(1, props.months.length))
const barW = computed(() => Math.min(36, band.value * 0.62))

function roundedTop(x: number, yTop: number, w: number, h: number, r = 4) {
  const rr = Math.min(r, h, w / 2)
  return `M${x},${yTop + h}V${yTop + rr}Q${x},${yTop} ${x + rr},${yTop}H${x + w - rr}Q${x + w},${yTop} ${x + w},${yTop + rr}V${yTop + h}Z`
}

const columns = computed(() =>
  props.months.map((m, i) => {
    const x = pad.left + i * band.value + (band.value - barW.value) / 2
    let acc = 0
    const present = PRODUCT_TYPES.filter((p) => m.items[p.value] > 0)
    const segs = present.map((p, k) => {
      const v = m.items[p.value]
      const y0 = y(acc)
      const y1 = y(acc + v)
      acc += v
      // 2px surface gap below every segment except the first one
      const h = Math.max(1, y0 - y1 - (k > 0 ? 2 : 0))
      return { type: p.value, top: k === present.length - 1, x, y: y1, h, w: barW.value }
    })
    return { ...m, i, x, total: acc, segs, cx: x + barW.value / 2 }
  })
)
const labelEvery = computed(() => Math.ceil(props.months.length / Math.max(1, Math.floor(plotW.value / 56))))

const hover = ref<number | null>(null)
const tip = computed(() => (hover.value === null ? null : columns.value[hover.value]))
</script>

<template>
  <div ref="box" class="chart">
    <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Produits ouverts par mois" @mouseleave="hover = null">
      <g class="grid">
        <g v-for="t in ticks.values" :key="t">
          <line :x1="pad.left" :x2="W - pad.right" :y1="y(t)" :y2="y(t)" />
          <text :x="pad.left - 6" :y="y(t) + 4" text-anchor="end">{{ t }}</text>
        </g>
      </g>
      <g v-for="c in columns" :key="c.month">
        <template v-for="s in c.segs" :key="s.type">
          <path v-if="s.top" :d="roundedTop(s.x, s.y, s.w, s.h)" :fill="`var(--${s.type})`" :opacity="hover === null || hover === c.i ? 1 : 0.45" />
          <rect v-else :x="s.x" :y="s.y" :width="s.w" :height="s.h" :fill="`var(--${s.type})`" :opacity="hover === null || hover === c.i ? 1 : 0.45" />
        </template>
        <text v-if="c.i % labelEvery === 0" class="xl" :x="c.cx" :y="H - 8" text-anchor="middle">{{ monthFr(c.month) }}</text>
        <rect :x="pad.left + c.i * band" :y="pad.top" :width="band" :height="plotH" fill="transparent" @mouseenter="hover = c.i" />
      </g>
    </svg>
    <div v-if="tip" class="tip" :style="{ left: `${Math.min(Math.max(tip.cx, 70), W - 70)}px` }">
      <strong>{{ monthFr(tip.month) }}</strong>
      <template v-for="p in PRODUCT_TYPES" :key="p.value">
        <span v-if="tip.items[p.value]" class="ptype" :class="'pt-' + p.value">{{ plural(tip.items[p.value], p.label.toLowerCase()) }}</span>
      </template>
      <span v-if="!tip.total" class="muted">Aucune ouverture</span>
      <span v-if="tip.spent" class="muted">{{ eur(tip.spent) }} dépensés</span>
    </div>
    <div class="legend">
      <span v-for="p in PRODUCT_TYPES" :key="p.value" class="ptype" :class="'pt-' + p.value">{{ p.plural }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart { position: relative; }
svg { width: 100%; height: auto; display: block; }
.grid line { stroke: var(--line); stroke-width: 1; }
.grid text, .xl { fill: var(--ink-2); font-size: 11px; font-family: var(--f-mono); }
.tip { position: absolute; top: 0; transform: translateX(-50%); background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; font-size: 13px; pointer-events: none; box-shadow: 0 4px 16px rgb(0 0 0 / .12); white-space: nowrap; }
.legend { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 6px; }
</style>
