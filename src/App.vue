<template>
  <v-app>
    <app-header />
    <running-timers-popup />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
  import AppHeader from './components/AppHeader.vue'
  import RunningTimersPopup from './components/RunningTimersPopup.vue'

  export default {
    name: 'App',
    components: { AppHeader, RunningTimersPopup },
  }
</script>

<style scope>
@font-face {
  font-family: "ErbaumBook";
  src: url("./assets/fonts/Erbaum-Book.eot");
  src:
    local("Erbaum Book"),
    local("Erbaum-Book"),
    url("./assets/fonts/Erbaum-Book.eot?#iefix") format("embedded-opentype"),
    url("./assets/fonts/Erbaum-Book.woff2") format("woff2"),
    url("./assets/fonts/Erbaum-Book.woff") format("woff"),
    url("./assets/fonts/Erbaum-Book.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

.logo-content {
  font-family: "ErbaumBook", sans-serif !important;
  align-items: center;
  display: flex;
  font-weight: bold;
  font-size: 1.5em;
  height: 48px;
  background: linear-gradient(
    to right,
    rgb(255, 255, 255) 45%,
    rgb(245, 245, 245) 66%
  );
  box-shadow:
    0 2px 4px -1px rgb(0 0 0 / 20%),
    0 4px 5px 0 rgb(0 0 0 / 14%),
    0 1px 10px 0 rgb(0 0 0 / 12%);
}
.tip {
  border-bottom-width: 1px;
  border-bottom-style: dashed;
  cursor: pointer;
  transition: opacity 0.2s ease;
  opacity: 0.6;
}
.tip:hover {
  opacity: 1;
}
/* Класс (цвет) подсветки в поиске */
.highlight {
  background-color: lightskyblue;
}

.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>

<style>
.red-line {
  text-indent: 1.5em;
}

.cursor-help {
  cursor: help;
}

.pointer {
  cursor: pointer;
}

::-webkit-scrollbar {
  width: calc(6px);
  height: calc(6px);
}

::-webkit-scrollbar-track {
  cursor: pointer !important;
  background: white;
}

::-webkit-scrollbar-thumb {
  cursor: pointer !important;
  background: #c4c6c4;
  border-radius: calc(5px);
}
</style>
