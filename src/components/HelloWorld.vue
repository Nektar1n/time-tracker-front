<template>
  <v-container class="fill-height d-flex align-center" max-width="1200">
    <div>
      <!-- <v-row justify="center">
        <v-col cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-rocket-launch-outline"
            rounded="lg"
            variant="tonal"
          >
            <v-date-picker
              header-date-format="monthAndDate"
              landscape
              show-adjacent-months
            /> </v-card
        ></v-col>
      </v-row> -->
      <!-- <v-row>
        <v-col cols="12">
          <main-calendar />
        </v-col>
      </v-row> -->
      <v-row>
        <v-col cols="6">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-calendar"
            rounded="lg"
            variant="tonal"
          >
            <event-calendar @change="setEvents" /> </v-card
        ></v-col>
        <v-col cols="6"> <day-events :value="events" /></v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-rocket-launch-outline"
            rounded="lg"
            variant="tonal"
          >
            <template #image>
              <v-img position="top right" />
            </template>

            <template #title>
              <h2 class="text-h5 font-weight-bold">Get started</h2>
            </template>

            <template #subtitle>
              <div class="text-subtitle-1">
                Change this page by updating
                <v-kbd>{{ `<HelloWorld />` }}</v-kbd> in
                <v-kbd>components/HelloWorld.vue</v-kbd>.
              </div>
            </template>
          </v-card>
        </v-col>

        <v-col v-for="link in links" :key="link.href" cols="6">
          <v-card
            append-icon="mdi-open-in-new"
            class="py-4"
            color="surface-variant"
            :href="link.href"
            :prepend-icon="link.icon"
            rel="noopener noreferrer"
            rounded="lg"
            :subtitle="link.subtitle"
            target="_blank"
            :title="link.title"
            variant="tonal"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { da } from "vuetify/locale";
import DayEvents from "./DayEvents.vue";
import EventCalendar from "./EventCalendar.vue";
import MainCalendar from "./MainCalendar.vue";

export default {
  name: "HelloWorld",
  components: { DayEvents, EventCalendar },
  data: () => ({
    events: [],
    links: [
      {
        href: "https://vuetifyjs.com/",
        icon: "mdi-text-box-outline",
        subtitle: "Learn about all things Vuetify in our documentation.",
        title: "Documentation",
      },
      {
        href: "https://vuetifyjs.com/introduction/why-vuetify/#feature-guides",
        icon: "mdi-star-circle-outline",
        subtitle: "Explore available framework Features.",
        title: "Features",
      },

      {
        href: "https://vuetifyjs.com/components/all",
        icon: "mdi-widgets-outline",
        subtitle: "Discover components in the API Explorer.",
        title: "Components",
      },

      {
        href: "https://discord.vuetifyjs.com",
        icon: "mdi-account-group-outline",
        subtitle: "Connect with Vuetify developers.",
        title: "Community",
      },
    ],
  }),
  mounted() {},

  methods: {
    setEvents(data) {
      this.events = data;
    },
  },
};
</script>
