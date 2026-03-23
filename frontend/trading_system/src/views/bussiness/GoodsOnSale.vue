<template>
  <div class="inventory-page" data-testid="goods-on-sale-page">
    <v-container id="main-view" class="inventory-page__container">
      <section class="inventory-header">
        <div class="inventory-header__copy">
          <p class="inventory-header__eyebrow">Inventory watch</p>
          <h1 class="inventory-header__title">待售商品</h1>
          <p class="inventory-header__description">
            快速查看当前在售库存、货值与最近更新时间，优先处理最需要补货的商品。
          </p>
        </div>
        <v-btn
          depressed
          color="primary"
          class="inventory-header__action"
          to="/SaleGoods"
          data-testid="goods-on-sale-primary-action"
        >
          去上架新商品
        </v-btn>
      </section>

      <section class="inventory-summary" data-testid="goods-on-sale-summary">
        <article class="inventory-summary__card" data-testid="goods-on-sale-summary-count">
          <p class="inventory-summary__label">在售数量</p>
          <strong class="inventory-summary__value token-mono" data-ledger="count">{{ goods.length }}</strong>
          <span class="inventory-summary__hint">当前可售库存总数</span>
        </article>
        <article class="inventory-summary__card" data-testid="goods-on-sale-summary-value">
          <p class="inventory-summary__label">在售货值</p>
          <strong class="inventory-summary__value token-mono" data-ledger="amount">{{ totalValue }}</strong>
          <span class="inventory-summary__hint">按当前标价合计</span>
        </article>
        <article class="inventory-summary__card" data-testid="goods-on-sale-summary-update">
          <p class="inventory-summary__label">最近更新</p>
          <strong class="inventory-summary__value inventory-summary__value--small">{{ latestUpdateLabel }}</strong>
          <span class="inventory-summary__hint">方便判断补货和刷新节奏</span>
        </article>
      </section>

      <section v-if="goods.length" class="inventory-list" data-testid="goods-on-sale-list">
        <article
          v-for="good in goods"
          :key="good.id"
          class="inventory-card"
          :data-testid="inventoryCardTestId(good)"
        >
          <div class="inventory-card__main">
            <div class="inventory-card__title-row">
              <div>
                <p class="inventory-card__eyebrow">On shelf</p>
                <h2 class="inventory-card__title">{{ good.name }}</h2>
              </div>
              <span class="inventory-card__status">在售</span>
            </div>

            <div class="inventory-card__metrics">
              <div class="inventory-card__metric">
                <span class="inventory-card__metric-label">标价</span>
                <strong class="inventory-card__metric-value token-mono" data-ledger="amount">
                  {{ formatAmount(good.price) }} 元
                </strong>
              </div>
              <div class="inventory-card__metric">
                <span class="inventory-card__metric-label">上架时间</span>
                <strong class="inventory-card__metric-value token-mono" data-timestamp="goods-on-sale-updated-at">
                  {{ good.time }}
                </strong>
              </div>
            </div>
          </div>

          <div class="inventory-card__actions">
            <v-btn
              text
              class="inventory-card__text-action"
              :data-testid="`${inventoryCardTestId(good)}-hint-action`"
              @click="showMessage"
            >
              查看提示
            </v-btn>
            <v-btn
              icon
              :data-testid="`${inventoryCardTestId(good)}-toggle`"
              @click="good.showDetails = !good.showDetails"
            >
              <v-icon>{{ good.showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-show="good.showDetails" class="inventory-card__details">
              <div class="inventory-card__detail-grid">
                <div class="inventory-card__detail-item">
                  <span class="inventory-card__detail-label">库存状态</span>
                  <strong>等待成交</strong>
                </div>
                <div class="inventory-card__detail-item">
                  <span class="inventory-card__detail-label">最近写入</span>
                  <strong class="token-mono" data-timestamp="goods-on-sale-detail-time">{{ good.time }}</strong>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </article>
      </section>

      <section
        v-else
        class="inventory-empty-state"
        data-testid="goods-on-sale-empty-state"
      >
        <v-icon color="primary" large>mdi-package-variant-closed</v-icon>
        <strong>当前没有待售商品</strong>
        <p>先创建一条商品记录，新的库存会立刻出现在这张看板里。</p>
        <v-btn outlined color="primary" to="/SaleGoods">现在去上架</v-btn>
      </section>
    </v-container>
  </div>
</template>

<script>

import GoodService from "../../api/goods/goods";
import TimeService from "../../api/time/time";
import GlobalMessage from '../../components/GlobalMsgbar/api';
import ResponseExtractor from "../../utils/response-extractor";

export default {
  mounted() {
    this.getGoodList();

  },
  name: "GoodsOnSalePage",
  components:{

  },
  data () {
    return {
      goods :[]
    }


  },
  computed: {
    totalValue() {
      const total = this.goods.reduce((sum, good) => sum + Number(good.price || 0), 0);
      return this.formatAmount(total);
    },
    latestUpdateLabel() {
      if (!this.goods.length) {
        return "暂无更新";
      }
      const latestItem = this.goods.reduce((latest, current) => {
        return Number(current.updatedAt || 0) > Number(latest.updatedAt || 0) ? current : latest;
      }, this.goods[0]);
      return latestItem.time;
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
    inventoryCardTestId(good) {
      return `goods-on-sale-card-${this.normalizeKey(good.name || good.id)}`;
    },
    showMessage(){
      GlobalMessage.success("还没想好要搞什么功能噢")
    },
    getGoodList(){
      GoodService.getSaleGoodListByAccount().then((resp) =>{
        const goodsList = ResponseExtractor.getData(resp);
        console.log("getGoodList", goodsList);
        for(var i = 0;i < goodsList.length;i ++){
          var good = {
            "id": goodsList[i].id || i,
            "name": goodsList[i].name,
            "price": goodsList[i].price,
            "time": TimeService.timesampToTime(goodsList[i].lastUpdate),
            "updatedAt": goodsList[i].lastUpdate,
            "showDetails": false
          }
          this.goods.push(good)
        }
      })
    }


  },
}
</script>

<style scoped>
#main-view {
  max-width: var(--ts-page-max-width);
}

.inventory-page__container {
  padding-top: var(--ts-space-4);
  padding-bottom: var(--ts-space-8);
}

.inventory-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ts-space-4);
  margin-bottom: var(--ts-space-4);
  padding: var(--ts-space-5);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg);
  background:
    linear-gradient(135deg, var(--ts-color-primary-soft), var(--ts-color-info-soft)),
    var(--ts-color-surface-glass);
  box-shadow: var(--ts-shadow-md);
}

.inventory-header__copy {
  display: grid;
  gap: var(--ts-space-2);
  max-width: 680px;
}

.inventory-header__eyebrow,
.inventory-card__eyebrow {
  margin: 0;
  color: var(--ts-color-muted-text);
  font-family: var(--ts-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.inventory-header__title,
.inventory-card__title {
  margin: 0;
  color: var(--ts-color-text);
  font-size: clamp(1.5rem, 2vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.inventory-header__description {
  margin: 0;
  color: var(--ts-color-muted-text);
  line-height: 1.7;
}

.inventory-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ts-space-3);
  margin-bottom: var(--ts-space-4);
}

.inventory-summary__card,
.inventory-card,
.inventory-empty-state {
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg);
  background: var(--ts-color-surface);
  box-shadow: var(--ts-shadow-sm);
}

.inventory-summary__card {
  display: grid;
  gap: var(--ts-space-2);
  padding: var(--ts-space-4);
}

.inventory-summary__label,
.inventory-summary__hint,
.inventory-card__metric-label,
.inventory-card__detail-label {
  color: var(--ts-color-muted-text);
  font-size: 0.8rem;
}

.inventory-summary__label,
.inventory-summary__hint,
.inventory-summary__value {
  margin: 0;
}

.inventory-summary__value {
  color: var(--ts-color-primary);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.inventory-summary__value--small {
  color: var(--ts-color-text);
  font-size: 1rem;
  line-height: 1.5;
}

.inventory-list {
  display: grid;
  gap: var(--ts-space-3);
}

.inventory-card {
  display: grid;
  gap: var(--ts-space-4);
  padding: var(--ts-space-4);
}

.inventory-card__main,
.inventory-card__title-row,
.inventory-card__actions,
.inventory-card__metrics {
  display: flex;
  gap: var(--ts-space-3);
}

.inventory-card__title-row,
.inventory-card__actions {
  align-items: flex-start;
  justify-content: space-between;
}

.inventory-card__main {
  flex-direction: column;
}

.inventory-card__title {
  font-size: 1.2rem;
}

.inventory-card__status {
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

.inventory-card__metrics {
  flex-wrap: wrap;
}

.inventory-card__metric {
  display: grid;
  gap: var(--ts-space-1);
  min-width: 220px;
}

.inventory-card__metric-value {
  color: var(--ts-color-text);
  font-size: 1rem;
}

.inventory-card__text-action {
  color: var(--ts-color-primary) !important;
}

.inventory-card__details {
  padding-top: var(--ts-space-4);
  border-top: 1px solid var(--ts-color-border);
}

.inventory-card__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--ts-space-3);
}

.inventory-card__detail-item {
  display: grid;
  gap: var(--ts-space-1);
  padding: var(--ts-space-3);
  border-radius: var(--ts-radius-md);
  background: var(--ts-color-elevated-surface);
}

.inventory-empty-state {
  display: grid;
  justify-items: start;
  gap: var(--ts-space-2);
  padding: var(--ts-space-5);
  border-style: dashed;
}

.inventory-empty-state strong,
.inventory-empty-state p {
  margin: 0;
}

.inventory-empty-state p {
  color: var(--ts-color-muted-text);
  line-height: 1.6;
}

@media (max-width: 960px) {
  .inventory-page__container {
    padding-top: 0;
  }

  .inventory-header,
  .inventory-card__title-row,
  .inventory-card__actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .inventory-summary,
  .inventory-card__detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .inventory-summary {
    grid-template-columns: 1fr;
  }
}
</style>
