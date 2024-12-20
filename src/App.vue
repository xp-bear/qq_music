<template>
  <div id="app">
    <!-- 路由占位符 -->
    <router-view />
    <!-- 角标播放器 -->
    <C_Play></C_Play>
  </div>
</template>
<script>
import C_Play from "./components/C_Play.vue";

export default {
  name: "App",
  components: {
    C_Play,
  },
  mixins: [],
  props: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {},
};
</script>

<style lang="less">
#app {
}
</style>
