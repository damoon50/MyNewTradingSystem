<template>
  <v-container id="main-view" class="customer-ledger-page" data-testid="customer-purchased-page">
    <section class="customer-ledger-page__hero" data-testid="customer-purchased-hero">
      <div class="customer-ledger-page__hero-copy">
        <p class="customer-ledger-page__eyebrow">Holdings ledger</p>
        <h1 class="customer-ledger-page__title">已购商品台账</h1>
        <p class="customer-ledger-page__intro">
          已购商品集中整理成持仓账卡，方便回看价格、发行者和入账时间。
        </p>
      </div>
      <div class="customer-ledger-page__hero-side">
        <div class="customer-ledger-status-chip customer-ledger-status-chip--warning" data-testid="customer-purchased-status-chip">
          Return closed
        </div>
        <div class="customer-ledger-page__hero-note">
          <span class="customer-ledger-page__hero-label">Held items</span>
          <span class="customer-ledger-page__hero-value token-mono" data-ledger="count">{{ formatNumber(goods.length) }}</span>
        </div>
      </div>
    </section>

    <v-card class="customer-ledger-panel" elevation="1">
      <div class="customer-ledger-panel__section">
        <div class="customer-ledger-panel__heading">
          <div>
            <p class="customer-ledger-panel__eyebrow">Holding snapshot</p>
            <h2 class="customer-ledger-panel__title">持有摘要</h2>
            <p class="customer-ledger-panel__subtitle">突出数量、总值和商家分布，方便快速回看当前持仓。</p>
          </div>
        </div>

        <div class="customer-ledger-summary" data-testid="customer-purchased-summary">
          <article class="customer-ledger-summary__item" data-testid="customer-purchased-summary-card">
            <span class="customer-ledger-summary__label">Items held</span>
            <span class="customer-ledger-summary__value token-mono" data-ledger="count" data-testid="customer-purchased-summary-count">
              {{ formatNumber(goods.length) }}
            </span>
            <span class="customer-ledger-summary__helper">当前已购商品数</span>
          </article>

          <article class="customer-ledger-summary__item" data-testid="customer-purchased-summary-card">
            <span class="customer-ledger-summary__label">Holding value</span>
            <span class="customer-ledger-summary__value token-mono" data-ledger="amount" data-testid="customer-purchased-summary-value">
              {{ formatNumber(totalPrice) }}
            </span>
            <span class="customer-ledger-summary__helper">已购商品价格合计</span>
          </article>

          <article class="customer-ledger-summary__item" data-testid="customer-purchased-summary-card">
            <span class="customer-ledger-summary__label">Merchants</span>
            <span class="customer-ledger-summary__value token-mono" data-ledger="count" data-testid="customer-purchased-summary-issuers">
              {{ formatNumber(issuerCount) }}
            </span>
            <span class="customer-ledger-summary__helper">已合作商家数量</span>
          </article>
        </div>
      </div>
    </v-card>

    <v-card class="customer-ledger-panel" elevation="1">
      <div class="customer-ledger-panel__section">
        <div class="customer-ledger-panel__heading">
          <div>
            <p class="customer-ledger-panel__eyebrow">Holding ledger</p>
            <h2 class="customer-ledger-panel__title">持仓账卡</h2>
            <p class="customer-ledger-panel__subtitle">退货逻辑保持不变，这里只把现有持仓整理成更清楚的账本阅读格式。</p>
          </div>
        </div>

        <div v-if="goods.length" class="customer-ledger-catalog" data-testid="customer-purchased-record-list">
          <article
            v-for="(good, index) in goods"
            :key="good.commodityId || index"
            class="customer-ledger-card"
            data-testid="customer-purchased-record-card"
          >
            <div class="customer-ledger-card__main">
              <div>
                <p class="customer-ledger-panel__eyebrow">Holding item</p>
                <h3 class="customer-ledger-card__title">{{ good.name }}</h3>
                <p class="customer-ledger-card__meta">发行者 {{ good.issuer }}</p>
              </div>

              <div class="customer-ledger-card__aside">
                <div class="customer-ledger-card__price">
                  <span class="token-mono" data-ledger="amount">{{ formatNumber(good.price) }}</span>
                  <span>RMB</span>
                </div>
                <div class="customer-ledger-status-chip" data-testid="customer-purchased-card-status-chip">Holding</div>
              </div>
            </div>

            <div class="customer-ledger-card__grid">
              <div class="customer-ledger-card__metric">
                <span class="customer-ledger-card__label">Issued by</span>
                <span class="customer-ledger-card__value">{{ good.issuer }}</span>
              </div>
              <div class="customer-ledger-card__metric">
                <span class="customer-ledger-card__label">Purchased at</span>
                <time class="customer-ledger-card__value token-mono" :datetime="String(good.time)" data-timestamp>
                  {{ good.time }}
                </time>
              </div>
            </div>

            <div class="customer-ledger-card__actions">
              <div class="text--secondary">退货功能暂未开放，可先保留这张账卡作为持仓记录。</div>
              <v-btn
                text
                color="primary"
                class="customer-ledger-card__action"
                data-testid="customer-purchased-action"
                @click="choosegood(index)"
              >
                点击退货
              </v-btn>
            </div>
          </article>
        </div>

        <div v-else class="customer-ledger-empty" data-testid="customer-purchased-empty-state">
          <p class="customer-ledger-empty__title">还没有已购商品</p>
          <p class="customer-ledger-empty__copy">完成购买后，持仓记录会整理成账卡显示在这里。</p>
        </div>
      </div>
    </v-card>

    <v-dialog v-model="dialog" persistent max-width="420">
      <v-card>
        <v-card-title class="text-h5">请您确认退货信息</v-card-title>
        <v-card-text>
          <div class="customer-ledger-dialog" data-testid="customer-purchased-dialog">
            <div class="customer-ledger-dialog__copy">
              <div class="customer-ledger-dialog__line">
                <span class="customer-ledger-dialog__label">名称</span>
                <span class="customer-ledger-dialog__value">{{ choose.name }}</span>
              </div>
              <div class="customer-ledger-dialog__line">
                <span class="customer-ledger-dialog__label">价格</span>
                <span class="customer-ledger-dialog__value token-mono" data-ledger="amount">{{ formatNumber(choose.price) }} RMB</span>
              </div>
              <div class="customer-ledger-dialog__line">
                <span class="customer-ledger-dialog__label">发行者</span>
                <span class="customer-ledger-dialog__value">{{ choose.issuer }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="customer-ledger-action-row">
          <v-btn text @click="dialog = false">算了吧</v-btn>
          <v-btn color="primary" text data-testid="customer-purchased-confirm" @click="returnGood()">好耶</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import GoodService from '../../api/goods/goods'
import ResponseExtractor from '../../utils/response-extractor'
import TimeService from '../../api/time/time'
import GlobalMessage from '../../components/GlobalMsgbar/api'

export default {
  name: 'GoodsBeBaught',
  mounted() {
    this.getGoodList()
  },
  computed: {
    totalPrice() {
      return this.goods.reduce((sum, good) => sum + this.toNumber(good.price), 0)
    },
    issuerCount() {
      return new Set(this.goods.map((good) => good.issuerId || good.issuer).filter(Boolean)).size
    },
  },
  methods: {
    choosegood(index) {
      this.choose = this.goods[index]
      this.dialog = true
    },
    returnGood() {
      GlobalMessage.success('该功能还未开放哦')
      this.dialog = false
    },
    getGoodList() {
      GoodService.getAllGoodBeBaught().then((resp) => {
        const goodsList = ResponseExtractor.getData(resp)
        this.goods = goodsList.map((good, index) => ({
          id: index,
          name: good.name,
          price: good.price,
          time: TimeService.timesampToTime(good.lastUpdate),
          issuer: good.issuerName,
          issuerId: good.issuerId,
          commodityId: good.id,
        }))
      })
    },
    formatNumber(value) {
      const numericValue = Number(value)
      if (Number.isNaN(numericValue)) {
        return value
      }
      return new Intl.NumberFormat('zh-CN').format(numericValue)
    },
    toNumber(value) {
      const numericValue = Number(value)
      return Number.isNaN(numericValue) ? 0 : numericValue
    },
  },
  data() {
    return {
      goodIndex: 0,
      dialog: false,
      goods: [],
      choose: {},
      issuer: '',
    }
  },
}
</script>

<style scoped lang="scss">
@import '../../styles/customer-ledger';

#main-view {
  max-width: var(--ts-page-max-width);
}
</style>
