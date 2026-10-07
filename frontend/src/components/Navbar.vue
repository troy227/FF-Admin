<script setup>
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { isFlagEnabled, loadFlags } from '../services/flags.js';

onMounted(() => {
  loadFlags();
});
</script>

<template>
  <nav class="navbar">
    <RouterLink
      to="/"
      class="tab"
      active-class="active"
    >
      Home
    </RouterLink>
    <RouterLink
      to="/tab-2"
      class="tab"
      active-class="active"
      :class="{ disabled: !isFlagEnabled('tab-2') }"
    >
      Tab 2
    </RouterLink>
    <RouterLink
      to="/tab-3"
      class="tab"
      active-class="active"
      :class="{ disabled: !isFlagEnabled('tab-3') }"
    >
      Tab 3
    </RouterLink>
    <RouterLink
      to="/tab-4"
      class="tab"
      active-class="active"
      :class="{ disabled: !isFlagEnabled('tab-4') }"
    >
      Tab 4
    </RouterLink>
    <RouterLink to="/flags" class="tab" active-class="active">FF Control</RouterLink>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ddd;
  background: #fafafa;
}

.tab {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 0.95rem;
  text-decoration: none;
  color: inherit;
}

.tab:hover:not(.disabled) {
  background: #f0f0f0;
}

.tab.active {
  border-color: #333;
  background: #333;
  color: #fff;
}

.tab.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
