<template>
  <v-container class="fill-height d-flex align-center" max-width="1200">
    <div class="w-100">
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
              ref="eventCalendarRef"
              :events="events"
              :scroll-sync="scrollSync"
              :selected-date="selectedDate"
              @sync-scroll="onSyncScroll"
              @update:events="onSetAllEvents"
              @update:selected-date="onSetSelectedDate"
            />
          </v-card>
        </v-col>
        <v-col cols="6">
          <day-events
            ref="dayEventsRef"
            :events="events"
            :scroll-sync="scrollSync"
            :selected-date="selectedDate"
            @sync-scroll="onSyncScroll"
            @update:events="onSetAllEvents"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
  import {
    setAllEvents,
    setSelectedDate,
    state,
    syncScroll,
  } from '@/modules/timers/timerState'
  import DayEvents from './DayEvents.vue'
  import EventCalendar from './EventCalendar.vue'

  export default {
    name: 'HelloWorld',
    components: { DayEvents, EventCalendar },
    computed: {
      events () {
        return state.events
      },
      selectedDate () {
        return state.selectedDate
      },
      scrollSync () {
        return state.scrollSync
      },
    },
    methods: {
      onSetAllEvents (events) {
        setAllEvents(events)
      },
      onSetSelectedDate (date) {
        setSelectedDate(date)
      },
      onSyncScroll (payload) {
        syncScroll(payload)
      },
    },
  }
</script>
