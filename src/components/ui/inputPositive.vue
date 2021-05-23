<template>
  <input
    @input="$emit('input',$event.target.value)"
    :value="value"
    type="number">
</template>

<script>
  export default {
    name: "inputPositive",
    props:{
      value:{},
    },
    watch:{
      value(){
        if (this.value<1 && this.value){
          this.value=1;
        }
      }
    }
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