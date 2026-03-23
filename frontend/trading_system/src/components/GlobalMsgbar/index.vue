<template>
  <div>
    <v-snackbar
      top
      v-model="snackbarVisible"
      :content-class="['global-message__content', toneClass]"
    >
      <div class="global-message__body" data-testid="global-message">
        <span class="global-message__text">{{ msg }}</span>
        <v-btn
          v-if="showClose"
          text
          icon
          class="global-message__close"
          data-testid="global-message-close"
          @click="close"
        >
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "GlobalMsgbar",
  computed: {
    snackbarVisible: {
      get() {
        return this.$store.state.GlobalMsgbar.visible
      },
      set(value) {
        if (!value) {
          this.close()
        }
      }
    },
    showClose() {
      return this.$store.state.GlobalMsgbar.showClose
    },
    color() {
      return this.$store.state.GlobalMsgbar.color
    },
    msg() {
      return this.$store.state.GlobalMsgbar.msg
    },
    toneClass() {
      const tone = this.color || 'info'
      return `global-message__content--${tone}`
    }
  },
  methods: {
    close() {
      this.$store.commit('GlobalMsgbar/CLOSE_SNACKBAR')
    }
  }
}
</script>

<style scoped>
.global-message__body {
  display: flex;
  align-items: center;
  gap: var(--ts-space-3);
  width: 100%;
}

.global-message__text {
  flex: 1 1 auto;
}

.global-message__close {
  flex: 0 0 auto;
}
</style>
