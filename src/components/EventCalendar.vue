<template>
  <div>
    <v-sheet class="d-flex align-center px-2" tile>
      <v-btn class="ma-2" icon variant="text" @click="prev">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <p class="text-subtitle-1 font-weight-medium">{{ calendarTitle }}</p>

      <v-select
        v-model="type"
        :items="types"
        class="ma-2"
        density="comfortable"
        hide-details
        label="Вид"
        variant="outlined"
      />

      <v-spacer />

      <v-btn class="ma-2" icon variant="text" @click="next">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-sheet>

    <v-sheet height="600">
      <v-calendar
        ref="calendar"
        v-model="focus"
        :events="events"
        :type="type"
        :weekdays="weekdays"
        @click:date="selectDate"
        @change="updateTitle"
      />
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: "EventCalendar",
  props: {
    events: {
      type: Array,
      default: () => [],
    },
    selectedDate: {
      type: [String, Date],
      default: null,
    },
  },
  emits: ["update:selectedDate"],
  data: () => ({
    calendarTitle: "",
    type: "month",
    types: [
      { title: "Месяц", value: "month" },
      { title: "Неделя", value: "week" },
    ],
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    focus: "",
  }),
  mounted() {
    this.focus = this.normalizeDate(this.selectedDate || new Date());
    this.$nextTick(this.updateTitle);
  },
  watch: {
    selectedDate(value) {
      this.focus = this.normalizeDate(value || new Date());
    },
  },
  methods: {
    normalizeDate(value) {
      if (!value) {
        return new Date().toISOString().split("T")[0];
      }
      if (value instanceof Date) {
        return value.toISOString().split("T")[0];
      }
      return value;
    },
    selectDate({ date }) {
      this.focus = date;
      this.$emit("update:selectedDate", date);
    },
    updateTitle() {
      this.calendarTitle = this.$refs.calendar?.title || "";
    },
    prev() {
      this.$refs.calendar?.prev();
      this.$nextTick(this.updateTitle);
    },
    next() {
      this.$refs.calendar?.next();
      this.$nextTick(this.updateTitle);
    },
  },
};
</script>
