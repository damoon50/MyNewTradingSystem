<template>
  <div class="page-shell" data-testid="page-shell">
    <header id="navbar" class="top-nav" data-testid="top-nav">
      <div class="top-nav__toolbar">
        <div class="top-nav__identity">
          <div class="top-nav__brand-mark" aria-hidden="true">
            <span class="top-nav__brand-code">TS</span>
          </div>
          <div class="top-nav__brand-copy">
            <span class="top-nav__eyebrow">Trading System</span>
            <strong class="top-nav__title">Authenticated Console</strong>
          </div>
        </div>

        <div class="top-nav__status">
          <div class="top-nav__status-chip top-nav__status-chip--role">
            {{ roleLabel }}
          </div>
          <div class="top-nav__status-chip top-nav__status-chip--route">
            <span class="top-nav__status-label">Route</span>
            <span class="top-nav__status-value">{{ currentRouteLabel }}</span>
          </div>
          <div class="top-nav__status-chip top-nav__status-chip--user">
            <span class="top-nav__status-label">User</span>
            <span class="top-nav__status-value">{{ userLabel }}</span>
          </div>
          <v-btn
            icon
            class="top-nav__logout"
            data-testid="nav-logout"
            aria-label="退出登录"
            @click="logout"
          >
            <v-icon>mdi-logout-variant</v-icon>
          </v-btn>
        </div>
      </div>

      <nav class="top-nav__rail" aria-label="主导航">
        <template v-for="navMenu in navMenus">
          <v-menu
            v-if="navMenu.hasSubMenu"
            :key="navKey(navMenu)"
            offset-y
            content-class="customMenu"
            open-on-hover
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                text
                class="top-nav__item"
                :class="{ customNavBtn: isMenuActive(navMenu) }"
                :data-testid="navItemTestId(navMenu)"
                :data-nav-active="String(isMenuActive(navMenu))"
                :data-nav-state="isMenuActive(navMenu) ? 'active' : 'idle'"
                :aria-current="isMenuActive(navMenu) ? 'page' : null"
              >
                <span class="top-nav__item-label">{{ navMenu.name }}</span>
                <span class="top-nav__item-path">{{ routeCode(navMenu.route) }}</span>
                <v-icon dense right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-list v-if="navMenu.hasSubMenu">
                <v-list-item
                  v-for="item in navMenu.subMenu"
                  :key="navKey(item)"
                  link
                  :to="resolveRoute(item.route)"
                  :data-testid="navItemTestId(item)"
                  :data-nav-active="String(isRouteActive(item.route))"
                  :data-nav-state="isRouteActive(item.route) ? 'active' : 'idle'"
                  :aria-current="isRouteActive(item.route) ? 'page' : null"
                >
                  <v-list-item-subtitle>{{ item.name }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>

          <v-btn
            v-else
            :key="navKey(navMenu)"
            text
            class="top-nav__item"
            :class="{ customNavBtn: isMenuActive(navMenu) }"
            :to="resolveRoute(navMenu.route)"
            :data-testid="navItemTestId(navMenu)"
            :data-nav-active="String(isMenuActive(navMenu))"
            :data-nav-state="isMenuActive(navMenu) ? 'active' : 'idle'"
            :aria-current="isMenuActive(navMenu) ? 'page' : null"
          >
            <span class="top-nav__item-label">{{ navMenu.name }}</span>
            <span class="top-nav__item-path">{{ routeCode(navMenu.route) }}</span>
          </v-btn>
        </template>
      </nav>
    </header>

    <main class="page-shell__main">
      <div class="page-shell__content">
        <router-view name="main"></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { generateNavMenu } from "../../utils/nav-generator";

export default {
  name: "AppNav",
  computed: {
    navMenus() {
      return generateNavMenu(this.$store.state.user.permittedRouteList);
    },
    currentRouteLabel() {
      const activeMenu = this.navMenus.find((menu) => this.isMenuActive(menu));
      return activeMenu ? activeMenu.name : "控制台";
    },
    roleLabel() {
      const roleMap = {
        1: "监管视图",
        2: "商家视图",
        3: "消费者视图",
      };
      return roleMap[this.$store.state.user.role] || "活跃会话";
    },
    userLabel() {
      return this.$store.state.user.name || this.$store.state.user.account || "session";
    },
  },
  methods: {
    logout() {
      this.$store.dispatch("user/userLogout").then(() => {
        this.$router.push("/login");
      });
    },
    navKey(item) {
      return this.normalizeKey(
        (item.route && (item.route.path || item.route.name)) || item.name
      );
    },
    navItemTestId(item) {
      return `nav-item-${this.navKey(item)}`;
    },
    normalizeKey(value) {
      return String(value || "item")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "item";
    },
    resolveRoute(routeRecord) {
      const routePath = routeRecord && routeRecord.path ? routeRecord.path : "/";
      if (routePath === "/") {
        return routePath;
      }
      return routePath.startsWith("/") ? routePath : `/${routePath}`;
    },
    routeCode(routeRecord) {
      const routePath = this.resolveRoute(routeRecord);
      if (routePath === "/") {
        return "root";
      }
      return routePath.replace(/^\//, "").toUpperCase();
    },
    isRouteActive(routeRecord) {
      return this.$route.path === this.resolveRoute(routeRecord);
    },
    isMenuActive(navMenu) {
      if (navMenu.hasSubMenu && Array.isArray(navMenu.subMenu)) {
        return navMenu.subMenu.some((item) => this.isRouteActive(item.route));
      }
      return this.isRouteActive(navMenu.route);
    },
  },
};
</script>

<style>
.theme--light.v-btn--active::before {
  opacity: 0;
}

.page-shell {
  min-height: 100%;
}

#navbar.top-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: block;
  padding: var(--ts-space-3) var(--ts-space-4) var(--ts-space-2);
}

.top-nav__toolbar,
.top-nav__rail,
.page-shell__content {
  width: min(calc(100% - (var(--ts-space-4) * 2)), calc(var(--ts-page-max-width) + var(--ts-space-8)));
  margin: 0 auto;
}

.top-nav__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ts-space-4);
  margin-bottom: var(--ts-space-2);
}

.top-nav__identity {
  display: flex;
  align-items: center;
  gap: var(--ts-space-3);
  min-width: 0;
}

.top-nav__brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--ts-radius-sm);
  background:
    linear-gradient(135deg, rgba(22, 93, 255, 1), rgba(6, 174, 212, 0.92));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.top-nav__brand-code {
  color: var(--ts-color-surface);
  font-family: var(--ts-font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.top-nav__brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.top-nav__eyebrow {
  color: var(--ts-color-muted-text);
  font-family: var(--ts-font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.top-nav__title {
  color: var(--ts-color-text);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.top-nav__status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--ts-space-2);
}

.top-nav__status-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--ts-space-2);
  min-height: 36px;
  padding: 0 var(--ts-space-3);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-pill);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.top-nav__status-chip--role {
  border-color: rgba(22, 93, 255, 0.2);
  background: linear-gradient(135deg, var(--ts-color-primary-soft), rgba(6, 174, 212, 0.1));
  color: var(--ts-color-primary);
  font-weight: 600;
}

.top-nav__status-label {
  color: var(--ts-color-muted-text);
  font-family: var(--ts-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.top-nav__status-value {
  color: var(--ts-color-text);
  font-size: 0.82rem;
  font-weight: 600;
}

.top-nav__logout {
  min-width: 40px !important;
  width: 40px;
  height: 40px;
  border: 1px solid var(--ts-color-border) !important;
  background: rgba(255, 255, 255, 0.76) !important;
}

.top-nav__rail {
  display: flex;
  align-items: center;
  gap: var(--ts-space-2);
  overflow-x: auto;
  padding-bottom: var(--ts-space-1);
  scrollbar-width: none;
}

.top-nav__rail::-webkit-scrollbar {
  display: none;
}

#navbar .top-nav__item {
  display: inline-flex;
  align-items: center;
  gap: var(--ts-space-2);
  min-height: 40px;
  padding: 0 var(--ts-space-3) !important;
  border: 1px solid transparent;
  border-radius: var(--ts-radius-pill) !important;
  background: transparent !important;
  color: var(--ts-color-text) !important;
  flex-shrink: 0;
}

#navbar .top-nav__item:hover {
  border-color: rgba(22, 93, 255, 0.16);
  background: rgba(255, 255, 255, 0.7) !important;
}

.top-nav__item-label {
  font-size: 0.92rem;
  font-weight: 600;
  white-space: nowrap;
}

.top-nav__item-path {
  color: var(--ts-color-muted-text);
  font-family: var(--ts-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

#navbar .top-nav__item.customNavBtn {
  border-color: rgba(22, 93, 255, 0.22);
  background: linear-gradient(135deg, var(--ts-color-primary-soft), rgba(6, 174, 212, 0.12)) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

#navbar .top-nav__item.customNavBtn .top-nav__item-path {
  color: var(--ts-color-primary);
}

.page-shell__main {
  padding: var(--ts-space-4);
}

.page-shell__content {
  width: min(calc(100% - (var(--ts-space-4) * 2)), calc(var(--ts-page-max-width) + var(--ts-space-8)));
}

.page-shell__content > * {
  width: 100%;
}

.page-shell__content .container {
  max-width: var(--ts-page-max-width) !important;
  padding-right: var(--ts-space-4) !important;
  padding-left: var(--ts-space-4) !important;
}

.page-shell__content .main-wrapper,
.page-shell__content #main-view {
  width: min(100%, var(--ts-page-max-width));
}

@media (max-width: 960px) {
  #navbar.top-nav {
    padding-right: var(--ts-space-3);
    padding-left: var(--ts-space-3);
  }

  .top-nav__toolbar,
  .top-nav__rail,
  .page-shell__content {
    width: 100%;
  }

  .top-nav__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .top-nav__status {
    width: 100%;
    justify-content: space-between;
  }

  .top-nav__item-path,
  .top-nav__status-chip--user {
    display: none;
  }

  .page-shell__main {
    padding: var(--ts-space-3);
  }

  .page-shell__content .container {
    padding-right: var(--ts-space-3) !important;
    padding-left: var(--ts-space-3) !important;
  }
}
</style>
