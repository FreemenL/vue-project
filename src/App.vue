<template>
  <div
    id="app"
    class="fillcontain"
  >
    <router-view />
  </div>
</template>

<script>
export default {};
</script>

<style lang="less" module>
:global {
  @import '~ws-less';
  @import './style/common.less';
  .global-normalize();
}
</style>
