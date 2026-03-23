<template>
  <v-container id="main-view" class="audit-console" data-testid="commodity-audit-console">
    <section class="audit-console__hero">
      <div>
        <p class="audit-console__eyebrow text-overline">Superviser ledger / commodity</p>
        <h1 class="audit-console__title text-h4">商品信息总览</h1>
        <p class="audit-console__description text-body-2">
          将商品价格、流转状态与持有人信息压缩进审计卡片，帮助监管侧快速定位高额或已流转记录。
        </p>
      </div>

      <div class="audit-console__hero-grid">
        <article class="audit-summary" data-testid="commodity-audit-summary-total">
          <span class="audit-summary__label text-caption">样本总数</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ commodityList.length }}</strong>
          <span class="audit-summary__hint text-body-2">监管视图中的商品记录</span>
        </article>

        <article class="audit-summary" data-testid="commodity-audit-summary-priority">
          <span class="audit-summary__label text-caption">高额或已流转</span>
          <strong class="audit-summary__value text-h5 token-mono" data-ledger="count">{{ flaggedCount }}</strong>
          <span class="audit-summary__hint text-body-2">建议优先抽样复核</span>
        </article>

        <article class="audit-summary" data-testid="commodity-audit-summary-updated">
          <span class="audit-summary__label text-caption">最近链上刷新</span>
          <strong class="audit-summary__value text-subtitle-1 token-mono" data-timestamp="commodity-latest-update">{{ latestUpdateLabel }}</strong>
          <span class="audit-summary__hint text-body-2">用于比对所有权变更批次</span>
        </article>
      </div>
    </section>

    <section class="audit-console__list" data-testid="commodity-audit-list">
      <article
        v-for="(com, index) in commodityList"
        :key="recordKey(com.name, index)"
        class="audit-row"
        data-testid="commodity-audit-row"
        :data-audit-key="recordKey(com.name, index)"
        :data-review-level="reviewLevel(com)"
      >
        <v-card outlined elevation="0" class="audit-card" data-testid="commodity-audit-card">
          <div class="audit-card__body">
            <div class="audit-card__top">
              <div class="audit-card__identity">
                <p class="audit-card__kicker text-caption">商品档案 #{{ index + 1 }}</p>
                <h2 class="audit-card__title text-h6">{{ com.name }}</h2>
                <div class="audit-card__meta text-body-2">
                  <span class="audit-card__meta-item token-mono" data-ledger="amount">{{ com.price }} RMB</span>
                  <span class="audit-card__meta-item">商家 {{ com.issuername }}</span>
                </div>
              </div>

              <div class="audit-card__signals">
                <span
                  class="audit-chip"
                  :class="`audit-chip--${statusTone(com.state)}`"
                  data-testid="commodity-status-chip"
                  :data-status="com.state"
                >
                  <v-icon x-small>mdi-package-variant-closed-check</v-icon>
                  <span class="text-body-2">{{ com.state }}</span>
                </span>

                <span class="audit-chip" :class="`audit-chip--${reviewTone(com)}`" :data-review-level="reviewLevel(com)">
                  <v-icon x-small>mdi-alert-decagram-outline</v-icon>
                  <span class="text-body-2">{{ reviewLabel(com) }}</span>
                </span>

                <span class="audit-chip audit-chip--timestamp token-mono" data-testid="commodity-timestamp" data-timestamp="commodity-record-update">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  <span class="text-body-2">{{ com.lastupdateTime }}</span>
                </span>
              </div>
            </div>

            <div class="audit-metrics">
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">商品价格</span>
                <strong class="audit-metric__value text-subtitle-1 token-mono" data-ledger="amount">{{ com.price }} 元</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">发行商家</span>
                <strong class="audit-metric__value text-subtitle-1">{{ com.issuername }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">当前持有人</span>
                <strong class="audit-metric__value text-subtitle-1">{{ ownerLabel(com) }}</strong>
              </article>
              <article class="audit-metric">
                <span class="audit-detail__label text-caption">监管备注</span>
                <strong class="audit-metric__value text-subtitle-1">{{ reviewHint(com) }}</strong>
              </article>
            </div>
          </div>

          <v-expand-transition>
            <div v-show="com.showDetails">
              <v-divider></v-divider>
              <div class="audit-detail-grid">
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">商品名称</span>
                  <strong class="audit-detail__value text-body-1">{{ com.name }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">复核等级</span>
                  <strong class="audit-detail__value text-body-1">{{ reviewLabel(com) }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">所有权状态</span>
                  <strong class="audit-detail__value text-body-1">{{ ownerStateLabel(com) }}</strong>
                </article>
                <article class="audit-detail">
                  <span class="audit-detail__label text-caption">链上时间戳</span>
                  <strong class="audit-detail__value text-body-1 token-mono">{{ com.lastupdateTime }}</strong>
                </article>
              </div>
            </div>
          </v-expand-transition>

          <v-card-actions class="audit-card__actions">
            <v-dialog v-model="dialog" persistent max-width="420">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  text
                  class="audit-action audit-action--danger"
                  data-testid="commodity-danger-action"
                  v-bind="attrs"
                  v-on="on"
                >
                  标记危险操作
                </v-btn>
              </template>

              <v-card class="audit-dialog">
                <v-card-title class="audit-dialog__title text-h6">确认执行商品处置</v-card-title>
                <v-card-text class="audit-dialog__copy text-body-2">
                  名称：{{ com.name }}<br>
                  价格：{{ com.price }} 元<br>
                  商家：{{ com.issuername }}<br>
                  持有人：{{ ownerLabel(com) }}
                </v-card-text>
                <v-card-actions class="audit-dialog__actions">
                  <v-spacer></v-spacer>
                  <v-btn text class="audit-action" @click="dialog = false">保留记录</v-btn>
                  <v-btn text class="audit-action audit-action--danger" @click="UnvalidCom(index)">继续提交</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-spacer></v-spacer>

            <v-btn text class="audit-action audit-card__toggle" @click="com.showDetails = !com.showDetails">
              {{ com.showDetails ? '收起审计字段' : '展开审计字段' }}
              <v-icon right>{{ com.showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </article>
    </section>
  </v-container>
</template>

<script>
import ResponseExtractor from "../../utils/response-extractor";
import TimeService from "../../api/time/time";
import GlobalMessage from "../../components/GlobalMsgbar/api";
import UserService from "../../api/auth/user";

export default {
  name: "ShowCommodity",
  computed: {
    flaggedCount() {
      return this.commodityList.filter((com) => this.reviewLevel(com) === "high").length;
    },
    latestUpdateLabel() {
      if (!this.commodityList.length) {
        return "等待链上回执";
      }
      const latestStamp = Math.max(...this.commodityList.map((com) => com.lastUpdateStamp || 0));
      return TimeService.timesampToTime(latestStamp);
    },
  },
  mounted() {
    this.getCommodityList();
  },
  methods: {
    UnvalidCom(index) {
      console.log(index);
      GlobalMessage.success("这功能还没做好，下版本也别想做好了");
      this.dialog = false;
    },
    getCommodityList() {
      UserService.getAllCommodityInfo().then((resp) => {
        const comList = ResponseExtractor.getData(resp);
        this.commodityList = comList.map((item) => ({
          name: item.name,
          price: item.price,
          issuername: item.issuerName,
          ownerName: item.ownerName,
          state: "有效的",
          lastUpdateStamp: item.lastUpdate || item.lastUpdateTime,
          lastupdateTime: TimeService.timesampToTime(item.lastUpdate || item.lastUpdateTime),
          showDetails: false,
        }));
      });
    },
    recordKey(value, index) {
      const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return normalized || `commodity-${index}`;
    },
    ownerLabel(com) {
      return com.ownerName || "待售库存";
    },
    ownerStateLabel(com) {
      return com.ownerName ? "已流转" : "待售";
    },
    statusTone(state) {
      return state === "有效的" ? "success" : "warning";
    },
    reviewLevel(com) {
      const price = Number(com.price) || 0;
      if (price >= 1000 || com.ownerName) {
        return "high";
      }
      if (price >= 300) {
        return "medium";
      }
      return "low";
    },
    reviewTone(com) {
      const toneMap = {
        high: "warning",
        medium: "primary",
        low: "success",
      };
      return toneMap[this.reviewLevel(com)];
    },
    reviewLabel(com) {
      const labelMap = {
        high: "重点审阅",
        medium: "例行复核",
        low: "台账稳定",
      };
      return labelMap[this.reviewLevel(com)];
    },
    reviewHint(com) {
      return this.reviewLevel(com) === "high" ? "关注高额定价或已发生流转" : "按周期抽查";
    },
  },
  data() {
    return {
      dialog: false,
      commodityList: [],
    };
  },
};
</script>

<style scoped lang="scss">
@import "./superviser-audit.scss";
</style>
