<template>
  <n-config-provider :theme="darkTheme" :locale="frFR" :date-locale="dateFrFR" style="max-width: 700px;margin:0 auto ">
    <n-layout v-if="store.user">
      <n-layout-header>
        <Header></Header>
      </n-layout-header>
      <router-view></router-view>

    </n-layout>
    <Login v-else></Login>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { darkTheme, NConfigProvider, NLayout, NLayoutContent, NLayoutHeader, frFR, dateFrFR } from 'naive-ui'
import useStore from './stores/store';
import Login from './pages/Login.vue';
import Header from './Components/Header.vue';
const store = useStore()
</script>