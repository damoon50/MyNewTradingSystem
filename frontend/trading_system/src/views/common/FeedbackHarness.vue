<template>
  <div class="feedback-harness">
    <v-container class="feedback-harness__container">
      <section class="feedback-harness__intro ts-feedback-panel">
        <div class="ts-feedback-panel__header">
          <span class="ts-feedback-panel__eyebrow">Feedback Harness</span>
          <h1 class="ts-feedback-panel__title">消息条与上传面板验证场景</h1>
          <p class="ts-feedback-panel__copy">
            该页面仅用于稳定验证全局提示、头像上传对话框与文件拖拽上传区的表现。
          </p>
        </div>
        <div class="ts-feedback-panel__body feedback-harness__actions-grid">
          <v-btn color="success" depressed data-testid="feedback-trigger-success" @click="openSuccessMessage">
            触发成功消息
          </v-btn>
          <v-btn color="warning" outlined @click="openWarningMessage">
            触发警告消息
          </v-btn>
          <AvatarUpload />
        </div>
      </section>

      <Dropzone class="feedback-harness__dropzone" :homework="homework" />
    </v-container>
  </div>
</template>

<script>
import AvatarUpload from "../../components/AvatarUpload.vue";
import Dropzone from "../../components/Dropzone/index.vue";
import GlobalMessage from "../../components/GlobalMsgbar/api";

export default {
  name: "FeedbackHarness",
  components: {
    AvatarUpload,
    Dropzone,
  },
  data() {
    return {
      homework: {
        title: "feedback-fixture",
      },
    }
  },
  methods: {
    openSuccessMessage() {
      GlobalMessage.success("反馈提示已触发");
    },
    openWarningMessage() {
      GlobalMessage.warning("请确认上传文件满足格式要求");
    },
  },
};
</script>

<style scoped>
.feedback-harness {
  min-height: 100vh;
  padding: var(--ts-space-6) 0;
}

.feedback-harness__container {
  display: grid;
  gap: var(--ts-space-4);
  width: min(100%, calc(var(--ts-page-max-width) + var(--ts-space-8)));
}

.feedback-harness__actions-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ts-space-3);
}

.feedback-harness__dropzone {
  width: min(100%, 560px);
}

@media (max-width: 960px) {
  .feedback-harness {
    padding: var(--ts-space-4) 0;
  }

  .feedback-harness__container,
  .feedback-harness__dropzone {
    width: 100%;
  }

  .feedback-harness__actions-grid {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
