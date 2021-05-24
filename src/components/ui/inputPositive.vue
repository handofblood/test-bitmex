<template>
  <input
    @input="$emit('input',$event.target.value<0 ? 0 : $event.target.value )"
    :value="value"
    min="0"
    type="number">
</template>

<script>
  export default {
    name: "inputPositive",
    props:{
      value:{},
    },

  }
</script>

<style scoped lang="scss">
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
</style>