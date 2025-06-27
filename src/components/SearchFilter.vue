<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search photos..."
        class="w-full bg-gray-900 border border-gray-600 p-3 pl-10 text-white focus:border-ncad-green focus:outline-none transition-colors"
        @input="onSearchInput"
      />
      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>
    
    <!-- Filter Options -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="filter in filters"
        :key="filter.key"
        @click="toggleFilter(filter.key)"
        :class="{
          'bg-ncad-green text-black': activeFilters.includes(filter.key),
          'bg-gray-800 text-white hover:bg-gray-700': !activeFilters.includes(filter.key)
        }"
        class="px-3 py-1 text-sm font-medium transition-colors"
      >
        {{ filter.label }}
      </button>
    </div>
    
    <!-- Sort Options -->
    <div class="flex items-center space-x-4">
      <label class="text-sm font-medium text-gray-400">Sort by:</label>
      <select
        v-model="sortBy"
        @change="onSortChange"
        class="bg-gray-900 border border-gray-600 p-2 text-white focus:border-ncad-green focus:outline-none"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="most-liked">Most Liked</option>
        <option value="most-visited">Most Visited</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from '../utils/performance'

interface Filter {
  key: string
  label: string
}

interface Props {
  modelValue: {
    search: string
    filters: string[]
    sort: string
  }
}

interface Emits {
  (e: 'update:modelValue', value: Props['modelValue']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref(props.modelValue.search)
const activeFilters = ref([...props.modelValue.filters])
const sortBy = ref(props.modelValue.sort)

const filters: Filter[] = [
  { key: 'temporary', label: 'Temporary' },
  { key: 'has-location', label: 'Has Location' },
  { key: 'recent', label: 'Last 7 Days' }
]

const debouncedSearch = debounce((query: string) => {
  emitUpdate()
}, 300)

const onSearchInput = () => {
  debouncedSearch(searchQuery.value)
}

const toggleFilter = (filterKey: string) => {
  const index = activeFilters.value.indexOf(filterKey)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(filterKey)
  }
  emitUpdate()
}

const onSortChange = () => {
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', {
    search: searchQuery.value,
    filters: [...activeFilters.value],
    sort: sortBy.value
  })
}
</script>