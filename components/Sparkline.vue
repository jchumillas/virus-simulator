<template>
  <v-sparkline
    :fill="true"
    :gradient="['#42b3f4']"
    label-size="4"
    line-width="2"
    padding="8"
    smooth="20"
    :value="agesDistribution"
  >
    <template v-if="chartType == 'ageDist'" v-slot:label="item">
      {{ agesDistributionLabel[item.index] }}
    </template>
    <template v-else-if="chartType == 'fatalityDist'" v-slot:label="item">
      {{ agesDistributionLabel[item.index] }}
      ({{ item.value }}%)
    </template>
  </v-sparkline>
</template>

<script>
export default {
  props: {
    agesDistribution: { type: Array, required: true },
    agesDistributionLabel: { type: Array, required: true },
    chartType: { type: String, required: true }
  }
};
</script>
