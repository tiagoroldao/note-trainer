<template>
  <v-app id="app">
    <v-app-bar
      app
      clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>
        The Diatonic Débutant
      </v-toolbar-title>
      <v-spacer />
      <SettingsModal>
        <template v-slot:default="slotProps">
          <v-icon
            class="settings"
            v-on="slotProps.on">
            settings
          </v-icon>
        </template>
      </SettingsModal>
      <octolink class="octolink" />
      <!-- -->
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      app
      :clipped="true"
      :width="400">
      <navigation>
        <router-view name="sidebar" />
      </navigation>
    </v-navigation-drawer>
    <v-content
      app
      :style="{ height:'100%' }">
      <router-view />
    </v-content>
  </v-app>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Octolink from './components/Octolink.vue';
import Navigation from './components/Navigation.vue';
import SettingsModal from './components/SettingsModal.vue';

@Component({
  components: {
    Octolink,
    Navigation,
    SettingsModal,
  },
})
export default class Home extends Vue {
  drawer = true;

  links = [
    { to: '/', text: 'Pitch Finder' },
    { to: '/teacher', text: 'Teacher' },
    { to: '/accordion', text: 'Accordion' },
    { to: '/about', text: 'About' },
  ];
}
</script>

<style lang="scss">
html.html:not(.overflow-y-hidden) {
  overflow-y: auto;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  position: absolute;
  right: 0;
  left: 0;
  background: transparent;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }

  .separator {
    margin: 0px 10px;
  }
}

.octolink {
  height: 56px;
  width: 56px;
  margin-right: -16px;
  flex-shrink: 0;
}

.view-title {
  padding: 20px 0px;
}
</style>
