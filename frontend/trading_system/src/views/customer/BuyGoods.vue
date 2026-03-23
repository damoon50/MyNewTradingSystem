<template>
  <v-container id="main-view" class="customer-ledger-page" data-testid="customer-buy-page">
    <section class="customer-ledger-page__hero" data-testid="customer-buy-hero">
      <div class="customer-ledger-page__hero-copy">
        <p class="customer-ledger-page__eyebrow">Marketplace ledger</p>
        <h1 class="customer-ledger-page__title">待购商品列表</h1>
        <p class="customer-ledger-page__intro">
          用紧凑的账卡浏览待售商品，先核对价格、发行者与上架时间，再发起购买请求。
        </p>
      </div>
      <div class="customer-ledger-page__hero-side">
        <div
          class="customer-ledger-status-chip customer-ledger-status-chip--primary"
          data-testid="customer-buy-status-chip"
        >
          Market open
        </div>
        <div class="customer-ledger-page__hero-note">
          <span class="customer-ledger-page__hero-label">Open offers</span>
          <span class="customer-ledger-page__hero-value token-mono" data-ledger="count">{{ formatNumber(goods.length) }}</span>
        </div>
      </div>
    </section>

    <v-card class="customer-ledger-panel" elevation="1">
      <div class="customer-ledger-panel__section">
        <div class="customer-ledger-panel__heading">
          <div>
            <p class="customer-ledger-panel__eyebrow">Buying snapshot</p>
            <h2 class="customer-ledger-panel__title">购买摘要</h2>
            <p class="customer-ledger-panel__subtitle">摘要区突出商品数量、总金额和商家覆盖范围。</p>
          </div>
        </div>

        <div class="customer-ledger-summary" data-testid="customer-buy-summary">
          <article class="customer-ledger-summary__item" data-testid="customer-buy-summary-card">
            <span class="customer-ledger-summary__label">Offers</span>
            <span class="customer-ledger-summary__value token-mono" data-ledger="count" data-testid="customer-buy-summary-count">
              {{ formatNumber(goods.length) }}
            </span>
            <span class="customer-ledger-summary__helper">当前在售商品数</span>
          </article>

          <article class="customer-ledger-summary__item" data-testid="customer-buy-summary-card">
            <span class="customer-ledger-summary__label">Combined value</span>
            <span class="customer-ledger-summary__value token-mono" data-ledger="amount" data-testid="customer-buy-summary-value">
              {{ formatNumber(totalPrice) }}
            </span>
            <span class="customer-ledger-summary__helper">所有挂单价格合计</span>
          </article>

          <article class="customer-ledger-summary__item" data-testid="customer-buy-summary-card">
            <span class="customer-ledger-summary__label">Merchants</span>
            <span class="customer-ledger-summary__value token-mono" data-ledger="count" data-testid="customer-buy-summary-issuers">
              {{ formatNumber(issuerCount) }}
            </span>
            <span class="customer-ledger-summary__helper">正在发售的商家数量</span>
          </article>
        </div>
      </div>
    </v-card>

    <v-card class="customer-ledger-panel" elevation="1">
      <div class="customer-ledger-panel__section">
        <div class="customer-ledger-panel__heading">
          <div>
            <p class="customer-ledger-panel__eyebrow">Offer ledger</p>
            <h2 class="customer-ledger-panel__title">待售账卡</h2>
            <p class="customer-ledger-panel__subtitle">每条记录都按账单视图压缩展示，保留价格和时间戳的单宽字体对齐。</p>
          </div>
        </div>

        <div v-if="goods.length" class="customer-ledger-catalog" data-testid="customer-buy-record-list">
          <article
            v-for="(good, index) in goods"
            :key="good.commodityId || index"
            class="customer-ledger-card"
            data-testid="customer-buy-record-card"
          >
            <div class="customer-ledger-card__main">
              <div>
                <p class="customer-ledger-panel__eyebrow">Commodity</p>
                <h3 class="customer-ledger-card__title">{{ good.name }}</h3>
                <p class="customer-ledger-card__meta">发行者 {{ good.issuer }}</p>
              </div>

              <div class="customer-ledger-card__aside">
                <div class="customer-ledger-card__price">
                  <span class="token-mono" data-ledger="amount">{{ formatNumber(good.price) }}</span>
                  <span>RMB</span>
                </div>
                <div class="customer-ledger-status-chip customer-ledger-status-chip--success" data-testid="customer-buy-card-status-chip">
                  Ready to buy
                </div>
              </div>
            </div>

            <div class="customer-ledger-card__grid">
              <div class="customer-ledger-card__metric">
                <span class="customer-ledger-card__label">Issued by</span>
                <span class="customer-ledger-card__value">{{ good.issuer }}</span>
              </div>
              <div class="customer-ledger-card__metric">
                <span class="customer-ledger-card__label">Listed at</span>
                <time class="customer-ledger-card__value token-mono" :datetime="String(good.time)" data-timestamp>
                  {{ good.time }}
                </time>
              </div>
            </div>

            <div class="customer-ledger-card__actions">
              <div class="text--secondary">确认账卡后可立即发起购买。</div>
              <v-btn
                color="primary"
                depressed
                class="customer-ledger-card__action"
                data-testid="customer-buy-action"
                @click="choosegood(index)"
              >
                点击购买
              </v-btn>
            </div>
          </article>
        </div>

        <div v-else class="customer-ledger-empty" data-testid="customer-buy-empty-state">
          <p class="customer-ledger-empty__title">当前没有待售商品</p>
          <p class="customer-ledger-empty__copy">市场一旦有新商品上架，账卡会第一时间显示在这里。</p>
        </div>
      </div>
    </v-card>

    <v-dialog v-model="dialog" persistent max-width="420">
      <v-card>
        <v-card-title class="text-h5">请您确认购买信息</v-card-title>
        <v-card-text>
          <div class="customer-ledger-dialog" data-testid="customer-buy-dialog">
            <div class="customer-ledger-dialog__copy">
              <div class="customer-ledger-dialog__line">
                <span class="customer-ledger-dialog__label">名称</span>
                <span class="customer-ledger-dialog__value">{{ goodchose.name }}</span>
              </div>
              <div class="customer-ledger-dialog__line">
                <span class="customer-ledger-dialog__label">价格</span>
                <span class="customer-ledger-dialog__value token-mono" data-ledger="amount">{{ formatNumber(goodchose.price) }} RMB</span>
              </div>
              <div class="customer-ledger-dialog__line">
                <span class="customer-ledger-dialog__label">发行者</span>
                <span class="customer-ledger-dialog__value">{{ goodchose.issuer }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="customer-ledger-action-row">
          <v-btn text @click="dialog = false">算了吧</v-btn>
          <v-btn color="primary" text data-testid="customer-buy-confirm" @click="buyGood()">好耶</v-btn>
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
import store from '../../store'

export default {
  name: 'BuyGoods',
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
      this.goodchose = this.goods[index]
      this.dialog = true
    },
    buyGood() {
      var tradeTime = new Date().getTime()
      const buydata = {
        tradeTime: tradeTime,
        price: this.goodchose.price,
        buyerId: store.state.user.account,
        salerId: this.goodchose.issuerId,
        commodityId: this.goodchose.commodityId,
      }
      GoodService.buyGood(buydata).then(() => {
        GlobalMessage.success('购买申请已提交，请耐心等待，数据更新会有延迟，请稍后刷新查看')
      })
      this.dialog = false
      this.$router.push({ path: '/CusGoodsBeBaught' }).catch((err) => console.log(err))
    },
    getGoodList() {
      GoodService.getAllSaleGoodList().then((resp) => {
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
      goodchose: {},
      goodIndex: 0,
      dialog: false,
      goods: [],
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
