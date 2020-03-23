<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" temporary :clipped="clipped" fixed app>
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2020 Virus simulator v0.5</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: true,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-play-speed',
          title: 'Simulator',
          to: '/'
        },
        {
          icon: 'mdi-information-outline',
          title: 'About',
          to: '/about'
        }
      ],
      title: 'Virus Simulator v0.5'
    };
  },
  head() {
    return {
      title: 'Virus Simulator',
      meta: [
        {
          hid: 'Virus Simulator v0.5',
          name: 'Virus Simulator by José Chumillas García',
          content:
            'Virus Simulator is an experimental project that aims to recreate an emulated environment of viral spread.'
        }
      ]
    };
  }
};
</script>
