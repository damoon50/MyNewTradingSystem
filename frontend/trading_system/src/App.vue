<template>
  <v-app class="app-root" :class="{ 'app-root--shell': isShellRoute }">
    <v-main class="app-main" :class="{ 'app-main--shell': isShellRoute }">
      <router-view />
      <GlobalMsgbar></GlobalMsgbar>
    </v-main>
  </v-app>
</template>

<script>
import GlobalMsgbar from "./components/GlobalMsgbar/index.vue";
export default {
  name: "App",
  components: {
    GlobalMsgbar,
  },
  computed: {
    isShellRoute() {
      return !["/login", "/register", "/404"].includes(this.$route.path);
    },
  },
};
</script>

<style>
.app-root {
  background: transparent !important;
}

.app-main {
  min-height: 100vh;
  padding: 0 !important;
}

.app-main--shell {
  position: relative;
}

.app-main--shell::before {
  content: "";
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 180px;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(6, 174, 212, 0.08), rgba(6, 174, 212, 0)),
    linear-gradient(135deg, rgba(22, 93, 255, 0.14), rgba(22, 93, 255, 0));
  opacity: 0.9;
}
</style>
