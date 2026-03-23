const IN_SCOPE_ROUTES = [
  "/login",
  "/register",
  "/BusHome",
  "/goodsOnSale",
  "/SaleGoods",
  "/GoodsSaled",
  "/CusHome",
  "/CusBuyGoods",
  "/CusGoodsBeBaught",
  "/BusinessInfo",
  "/CustomerInfo",
  "/CommodityInfo",
  "/TradeInfo",
];

const PROTECTED_ROUTES = IN_SCOPE_ROUTES.filter(
  (path) => path !== "/login" && path !== "/register",
);

const ROLE_ROUTE_MATRIX = {
  guest: {
    allowedRoutes: ["/login", "/register"],
    protectedRoutes: PROTECTED_ROUTES,
    visibleNav: [],
    hiddenNav: ["主页", "待售商品", "上架商品", "已售商品", "购买商品", "已购买", "商家信息", "买家信息", "商品信息", "交易信息"],
  },
  business: {
    allowedRoutes: ["/BusHome", "/goodsOnSale", "/SaleGoods", "/GoodsSaled"],
    deniedRoutes: ["/CusHome", "/CusBuyGoods", "/CusGoodsBeBaught", "/BusinessInfo", "/CustomerInfo", "/CommodityInfo", "/TradeInfo"],
    visibleNav: ["主页", "待售商品", "上架商品", "已售商品"],
    hiddenNav: ["购买商品", "已购买", "商家信息", "买家信息", "商品信息", "交易信息"],
  },
  customer: {
    allowedRoutes: ["/CusHome", "/CusBuyGoods", "/CusGoodsBeBaught"],
    deniedRoutes: ["/BusHome", "/goodsOnSale", "/SaleGoods", "/GoodsSaled", "/BusinessInfo", "/CustomerInfo", "/CommodityInfo", "/TradeInfo"],
    visibleNav: ["主页", "购买商品", "已购买"],
    hiddenNav: ["待售商品", "上架商品", "已售商品", "商家信息", "买家信息", "商品信息", "交易信息"],
  },
  superviser: {
    allowedRoutes: ["/BusinessInfo", "/CustomerInfo", "/CommodityInfo", "/TradeInfo"],
    deniedRoutes: ["/BusHome", "/goodsOnSale", "/SaleGoods", "/GoodsSaled", "/CusHome", "/CusBuyGoods", "/CusGoodsBeBaught"],
    visibleNav: ["商家信息", "买家信息", "商品信息", "交易信息"],
    hiddenNav: ["主页", "待售商品", "上架商品", "已售商品", "购买商品", "已购买"],
  },
};

module.exports = {
  IN_SCOPE_ROUTES,
  PROTECTED_ROUTES,
  ROLE_ROUTE_MATRIX,
};
