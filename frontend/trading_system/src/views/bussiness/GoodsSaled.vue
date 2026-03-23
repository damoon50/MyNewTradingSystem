<template>
  <div class="sold-page" data-testid="goods-saled-page">
    <v-container id="main-view" class="sold-page__container">
      <section class="sold-header">
        <div class="sold-header__copy">
          <p class="sold-header__eyebrow">Closed orders</p>
          <h1 class="sold-header__title">已售商品</h1>
          <p class="sold-header__description">
            复盘成交记录、买家信息和累计回款，帮助你更快判断哪些商品值得继续补货。
          </p>
        </div>
        <v-btn
          depressed
          color="primary"
          class="sold-header__action"
          to="/SaleGoods"
          data-testid="goods-saled-primary-action"
        >
          再上架一件
        </v-btn>
      </section>

      <section class="sold-summary" data-testid="goods-saled-summary">
        <article class="sold-summary__card" data-testid="goods-saled-summary-count">
          <p class="sold-summary__label">成交数量</p>
          <strong class="sold-summary__value token-mono" data-ledger="count">{{ goodsSaled.length }}</strong>
          <span class="sold-summary__hint">累计已售出的商品</span>
        </article>
        <article class="sold-summary__card" data-testid="goods-saled-summary-revenue">
          <p class="sold-summary__label">成交回款</p>
          <strong class="sold-summary__value token-mono" data-ledger="amount">{{ totalRevenue }}</strong>
          <span class="sold-summary__hint">按成交价格汇总</span>
        </article>
        <article class="sold-summary__card" data-testid="goods-saled-summary-latest-buyer">
          <p class="sold-summary__label">最近买家</p>
          <strong class="sold-summary__value sold-summary__value--small">{{ latestBuyerLabel }}</strong>
          <span class="sold-summary__hint">优先跟踪高频成交来源</span>
        </article>
      </section>

      <section v-if="goodsSaled.length" class="sold-list" data-testid="goods-saled-list">
        <article
          v-for="good in goodsSaled"
          :key="good.commodityId"
          class="sold-card"
          :data-testid="soldCardTestId(good)"
        >
          <div class="sold-card__main">
            <div class="sold-card__title-row">
              <div>
                <p class="sold-card__eyebrow">Settled</p>
                <h2 class="sold-card__title">{{ good.name }}</h2>
              </div>
              <span class="sold-card__status">已成交</span>
            </div>

            <div class="sold-card__metrics">
              <div class="sold-card__metric">
                <span class="sold-card__metric-label">成交价格</span>
                <strong class="sold-card__metric-value token-mono" data-ledger="amount">
                  {{ formatAmount(good.price) }} 元
                </strong>
              </div>
              <div class="sold-card__metric">
                <span class="sold-card__metric-label">购买者</span>
                <strong class="sold-card__metric-value">{{ good.owner }}</strong>
              </div>
            </div>
          </div>

          <div class="sold-card__actions">
            <v-btn
              text
              class="sold-card__text-action"
              :data-testid="`${soldCardTestId(good)}-hint-action`"
              @click="explore"
            >
              查看提示
            </v-btn>
            <v-btn
              icon
              :data-testid="`${soldCardTestId(good)}-toggle`"
              @click="good.showDetails = !good.showDetails"
            >
              <v-icon>{{ good.showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-show="good.showDetails" class="sold-card__details">
              <div class="sold-card__detail-grid">
                <div class="sold-card__detail-item">
                  <span class="sold-card__detail-label">上架时间</span>
                  <strong class="token-mono" data-timestamp="goods-saled-time">{{ good.time }}</strong>
                </div>
                <div class="sold-card__detail-item">
                  <span class="sold-card__detail-label">买家账号</span>
                  <strong class="token-mono" data-identifier="goods-saled-owner">{{ good.owner }}</strong>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </article>
      </section>

      <section
        v-else
        class="sold-empty-state"
        data-testid="goods-saled-empty-state"
      >
        <v-icon color="primary" large>mdi-finance</v-icon>
        <strong>还没有成交记录</strong>
        <p>完成第一笔交易后，这里会展示买家和成交金额的复盘信息。</p>
        <v-btn outlined color="primary" to="/SaleGoods">先去上架商品</v-btn>
      </section>
    </v-container>
  </div>
</template>

<script>

import GoodService from "../../api/goods/goods";
import ResponseExtractor from "../../utils/response-extractor";
import TimeService from "../../api/time/time";
import GlobalMessage from "../../components/GlobalMsgbar/api";

export default {
  name: "GoodsSaled",

  mounted() {
    this.getGoodList();
  },

  components:{

  },
  computed: {
    totalRevenue() {
      const total = this.goodsSaled.reduce((sum, good) => sum + Number(good.price || 0), 0);
      return this.formatAmount(total);
    },
    latestBuyerLabel() {
      if (!this.goodsSaled.length) {
        return "暂无买家";
      }
      return this.goodsSaled[0].owner || "待确认";
    },
  },

  methods: {
    formatAmount(value) {
      return Number(value || 0).toLocaleString("zh-CN");
    },
    normalizeKey(value) {
      return String(value || "item")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "item";
    },
    soldCardTestId(good) {
      return `goods-saled-card-${this.normalizeKey(good.name || good.commodityId)}`;
    },
    explore(){
      GlobalMessage.success("还没想好搞什么功能")
    },
    getGoodList(){
      GoodService.getAllGoodSaledByBus().then((resp) => {
        const goodsList = ResponseExtractor.getData(resp);
        console.log("getGoodList", goodsList);
        for(var i = 0;i < goodsList.length;i ++){
          var good = {
            "name": goodsList[i].name,
            "price": goodsList[i].price,
            "time": TimeService.timesampToTime(goodsList[i].lastUpdate),
            "issuer": goodsList[i].issuerName,
            "issuerId": goodsList[i].issuerId,
            "commodityId": goodsList[i].id,
            "owner": goodsList[i].ownerName,
            "showDetails": false
          }
          this.goodsSaled.push(good)
        }

      })

    }

  },
  data () {
    return {
      goodsSaled: []
    }
  }
}
</script>

<style scoped>
#main-view {
  max-width: var(--ts-page-max-width);
}

.sold-page__container {
  padding-top: var(--ts-space-4);
  padding-bottom: var(--ts-space-8);
}

.sold-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ts-space-4);
  margin-bottom: var(--ts-space-4);
  padding: var(--ts-space-5);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg);
  background:
    linear-gradient(135deg, var(--ts-color-primary-soft), var(--ts-color-success-soft)),
    var(--ts-color-surface-glass);
  box-shadow: var(--ts-shadow-md);
}

.sold-header__copy {
  display: grid;
  gap: var(--ts-space-2);
  max-width: 680px;
}

.sold-header__eyebrow,
.sold-card__eyebrow {
  margin: 0;
  color: var(--ts-color-muted-text);
  font-family: var(--ts-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sold-header__title,
.sold-card__title {
  margin: 0;
  color: var(--ts-color-text);
  font-size: clamp(1.5rem, 2vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.sold-header__description {
  margin: 0;
  color: var(--ts-color-muted-text);
  line-height: 1.7;
}

.sold-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ts-space-3);
  margin-bottom: var(--ts-space-4);
}

.sold-summary__card,
.sold-card,
.sold-empty-state {
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg);
  background: var(--ts-color-surface);
  box-shadow: var(--ts-shadow-sm);
}

.sold-summary__card {
  display: grid;
  gap: var(--ts-space-2);
  padding: var(--ts-space-4);
}

.sold-summary__label,
.sold-summary__hint,
.sold-card__metric-label,
.sold-card__detail-label {
  color: var(--ts-color-muted-text);
  font-size: 0.8rem;
}

.sold-summary__label,
.sold-summary__hint,
.sold-summary__value {
  margin: 0;
}

.sold-summary__value {
  color: var(--ts-color-success);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.sold-summary__value--small {
  color: var(--ts-color-text);
  font-size: 1rem;
  line-height: 1.5;
}

.sold-list {
  display: grid;
  gap: var(--ts-space-3);
}

.sold-card {
  display: grid;
  gap: var(--ts-space-4);
  padding: var(--ts-space-4);
}

.sold-card__main,
.sold-card__title-row,
.sold-card__actions,
.sold-card__metrics {
  display: flex;
  gap: var(--ts-space-3);
}

.sold-card__title-row,
.sold-card__actions {
  align-items: flex-start;
  justify-content: space-between;
}

.sold-card__main {
  flex-direction: column;
}

.sold-card__title {
  font-size: 1.2rem;
}

.sold-card__status {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 var(--ts-space-3);
  border-radius: var(--ts-radius-pill);
  background: var(--ts-color-success-soft);
  color: var(--ts-color-success);
  font-size: 0.78rem;
  font-weight: 700;
}

.sold-card__metrics {
  flex-wrap: wrap;
}

.sold-card__metric {
  display: grid;
  gap: var(--ts-space-1);
  min-width: 220px;
}

.sold-card__metric-value {
  color: var(--ts-color-text);
  font-size: 1rem;
}

.sold-card__text-action {
  color: var(--ts-color-primary) !important;
}

.sold-card__details {
  padding-top: var(--ts-space-4);
  border-top: 1px solid var(--ts-color-border);
}

.sold-card__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--ts-space-3);
}

.sold-card__detail-item {
  display: grid;
  gap: var(--ts-space-1);
  padding: var(--ts-space-3);
  border-radius: var(--ts-radius-md);
  background: var(--ts-color-elevated-surface);
}

.sold-empty-state {
  display: grid;
  justify-items: start;
  gap: var(--ts-space-2);
  padding: var(--ts-space-5);
  border-style: dashed;
}

.sold-empty-state strong,
.sold-empty-state p {
  margin: 0;
}

.sold-empty-state p {
  color: var(--ts-color-muted-text);
  line-height: 1.6;
}

@media (max-width: 960px) {
  .sold-page__container {
    padding-top: 0;
  }

  .sold-header,
  .sold-card__title-row,
  .sold-card__actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .sold-summary,
  .sold-card__detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .sold-summary {
    grid-template-columns: 1fr;
  }
}
</style>
