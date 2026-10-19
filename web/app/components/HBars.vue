<script setup lang="ts">
/** Horizontal bars, optionally stacked. Values are printed at the end of each bar. */
type Seg = { value: number; color: string; label: string }
const props = defineProps<{ rows: { key: string | number; label: string; color?: string; segs: Seg[]; display: string }[] }>()
const max = computed(() => Math.max(1, ...props.rows.map((r) => r.segs.reduce((s, x) => s + x.value, 0))))
const hover = ref<string | number | null>(null)
</script>

<template>
  <ul class="hbars">
    <li v-for="r in rows" :key="r.key" @mouseenter="hover = r.key" @mouseleave="hover = null">
      <span class="lbl"><span v-if="r.color" class="dot" :style="{ '--c': r.color }" />{{ r.label }}</span>
      <span class="track">
        <span class="bars">
          <span
            v-for="(s, i) in r.segs.filter((x) => x.value > 0)"
            :key="i"
            class="seg"
            :style="{ width: `${(s.value / max) * 100}%`, background: s.color }"
          />
        </span>
        <span class="val num">{{ r.display }}</span>
      </span>
      <span v-if="hover === r.key && r.segs.length > 1" class="tip">
        <span v-for="(s, i) in r.segs" :key="i">{{ s.label }} : {{ int(s.value) }}</span>
      </span>
    </li>
  </ul>
</template>

<style scoped>
.hbars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { display: grid; grid-template-columns: minmax(0, 11rem) minmax(0, 1fr); gap: 10px; align-items: center; position: relative; }
.lbl { font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.track { display: flex; align-items: center; gap: 8px; min-width: 0; }
.bars { flex: 1; min-width: 0; display: flex; gap: 2px; }
.seg { height: 14px; flex: none; min-width: 2px; }
.seg:last-child { border-radius: 0 4px 4px 0; }
.val { font-size: 12.5px; color: var(--ink-2); white-space: nowrap; flex: none; }
.tip { position: absolute; right: 0; top: -6px; transform: translateY(-100%); background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; display: flex; gap: 10px; font-size: 12.5px; z-index: 2; box-shadow: 0 4px 16px rgb(0 0 0 / .12); }
@media (max-width: 560px) { li { grid-template-columns: minmax(0, 7rem) minmax(0, 1fr); } }
</style>
