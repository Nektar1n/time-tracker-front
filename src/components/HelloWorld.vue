<template>
  <v-container class="fill-height d-flex align-center" max-width="1200">
    <div>
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
            <event-calendar
              :events="events"
              :selected-date="selectedDate"
              @update:events="setAllEvents"
              @update:selected-date="setSelectedDate"
            />
          </v-card>
        </v-col>
        <v-col cols="6">
          <day-events
            :events="events"
            :selected-date="selectedDate"
            @update:events="setAllEvents"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
  import DayEvents from './DayEvents.vue'
  import EventCalendar from './EventCalendar.vue'

  export default {
    name: 'HelloWorld',
    components: { DayEvents, EventCalendar },
    data: () => ({
      events: [],
      selectedDate: new Date(),
    }),
    methods: {
      setAllEvents (events) {
        this.events = [...events]
      },
      setSelectedDate (date) {
        this.selectedDate = new Date(date)
      },
    },
  }
</script>
