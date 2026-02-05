<template>
  <div>
    <v-sheet class="d-flex" tile>
      <v-btn class="ma-2" variant="text" icon @click="next()">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <p>
        {{ calendarTitle }}
      </p>
      <v-select
        v-model="type"
        :items="types"
        class="ma-2"
        density="comfortable"
        label="type"
        variant="outlined"
        hide-details
      ></v-select>
      <!-- <v-select
        v-model="mode"
        :items="modes"
        class="ma-2"
        density="comfortable"
        label="event-overlap-mode"
        variant="outlined"
        hide-details
      ></v-select>
      <v-select
        v-model="weekday"
        :items="weekdays"
        class="ma-2"
        density="comfortable"
        label="weekdays"
        variant="outlined"
        hide-details
      ></v-select> -->
      <v-spacer></v-spacer>
      <v-btn class="ma-2" variant="text" icon @click="prev()">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-sheet>
    <v-sheet height="600">
      <v-calendar
        ref="calendar"
        v-model="focus"
        @click:date="viewDay"
        :event-color="getEventColor"
        :event-overlap-mode="mode"
        :event-overlap-threshold="30"
        :events="events"
        :type="type"
        :weekdays="weekday"
        @change="getEvents"
        @mousedown:event="startDrag"
        @mousedown:time="startTime"
        @mouseleave="cancelDrag"
        @mousemove:time="mouseMove"
        @mouseup:time="endDrag"
      >
        <template v-slot:day-label="{ day, date }">
          <div class="pa-1">
            <v-hover v-if="date === focus" v-slot="{ hover }">
              <v-btn
                @click="viewDay(date)"
                text
                dark
                rounded="xl"
                size="small"
                depressed
                :color="hover ? 'red lighten-2' : 'grey lighten-3'"
              >
                <!-- color="red lighten-2" -->
                <p>{{ day }}</p>
              </v-btn>
            </v-hover>
            <v-hover v-else-if="date === todayDate" v-slot="{ hover }">
              <v-btn
                variant="outlined"
                @click="viewDay(date)"
                dark
                rounded="xl"
                size="small"
              >
                <!-- color="red lighten-2" -->
                <p>{{ day }}</p>
              </v-btn>
            </v-hover>
            <v-hover v-else v-slot="{ hover }">
              <v-btn
                @click="viewDay(date)"
                variant="text"
                rounded="xl"
                title="Удалить"
                size="small"
              >
                <!-- color="red lighten-2" -->
                <p>{{ day }}</p>
              </v-btn>
            </v-hover>
          </div>
        </template>
        <template v-slot:day-label-header="{ day, date }">
          <v-hover v-if="date === focus" v-slot="{ hover }">
            <v-btn
              @click="viewDay(date)"
              text
              dark
              rounded="xl"
              size="small"
              depressed
              :color="hover ? 'red lighten-2' : 'grey lighten-3'"
              title="Удалить"
            >
              <!-- color="red lighten-2" -->
              <p>{{ day }}</p>
            </v-btn>
          </v-hover>
          <v-hover v-else v-slot="{ hover }">
            <v-btn
              @click="viewDay(date)"
              variant="text"
              rounded="xl"
              title="Удалить"
              size="small"
            >
              <!-- color="red lighten-2" -->
              <p>{{ day }}</p>
            </v-btn>
          </v-hover>
        </template>
      </v-calendar>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: "EventCalendar",
  data: () => ({
    loading: true,
    calendarTitle: "",
    focus: "",
    todayDate: new Date().toLocaleString("en-CA").split(",")[0],
    type: "month",
    types: ["month", "week"],
    mode: "stack",
    modes: ["stack", "column"],
    weekday: [0, 1, 2, 3, 4, 5, 6],
    weekdays: [
      { title: "Sun - Sat", value: [0, 1, 2, 3, 4, 5, 6] },
      { title: "Mon - Sun", value: [1, 2, 3, 4, 5, 6, 0] },
      { title: "Mon - Fri", value: [1, 2, 3, 4, 5] },
      { title: "Mon, Wed, Fri", value: [1, 3, 5] },
    ],
    value: "",
    events: [],
    colors: [
      "blue",
      "indigo",
      "deep-purple",
      "cyan",
      "green",
      "orange",
      "grey-darken-1",
    ],
    names: [
      "Meeting",
      "Holiday",
      "PTO",
      "Travel",
      "Event",
      "Birthday",
      "Conference",
      "Party",
    ],
    dragEvent: null,
    dragStart: null,
    createEvent: null,
    createStart: null,
    extendOriginal: null,
  }),
  mounted() {
    this.viewDay(new Date());
    this.$refs.calendar.checkChange();
    console.log(this.$refs.calendar, "rhuirhfiurhihftrrefs");
    this.calendarTitle = this.$refs.calendar.title || "";
  },
  // computed: {
  //   getCalendarTitle() {
  //     return this.$refs.calendar?.title || "6";
  //   },
  // },

  methods: {
    viewDay(date) {
      this.focus = date;

      const formatDate = new Date(date);
      // formatDate.setDate(formatDate.getDate() + 1);

      const eventsDay = [];
      const filteredDays = [];

      // this.events.forEach((item) => {
      //   if (item.end <= formatDate) {
      //     eventsDay.push(item);
      //   }
      // });
      this.events.forEach((item) => {
        if (item.start)
          if (
            new Date(item.start).getDate() === formatDate.getDate() ||
            new Date(item.end).getDate() === formatDate.getDate() ||
            (new Date(item.start).getDate() <= formatDate.getDate() &&
              new Date(item.end).getDate() >= formatDate.getDate())
          ) {
            eventsDay.push(item);
          }
      });

      this.$emit("change", { date: formatDate, eventsDay });
      // this.type = "day";
    },
    // getToday() {
    //   const today = new Date();
    //   const dd = String(today.getDate());
    //   const mm = String(today.getMonth() + 1);
    //   const yyyy = today.getFullYear();

    //   today = yyyy + "-" + dd + "-" + mm;

    //   return today;
    // },
    getEvents({ start, end }) {
      const events = [];

      const min = new Date(`${start.date}T00:00:00`);
      const max = new Date(`${end.date}T23:59:59`);
      const days = (max.getTime() - min.getTime()) / 86400000;
      const eventCount = this.rnd(days, days + 20);

      for (let i = 0; i < eventCount; i++) {
        const allDay = this.rnd(0, 3) === 0;
        const firstTimestamp = this.rnd(min.getTime(), max.getTime());
        const first = new Date(firstTimestamp - (firstTimestamp % 900000));
        const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000;
        const second = new Date(first.getTime() + secondTimestamp);

        events.push({
          name: this.names[this.rnd(0, this.names.length - 1)],
          start: first,
          end: second,
          color: this.colors[this.rnd(0, this.colors.length - 1)],
          timed: !allDay,
        });
      }

      this.events = events;
    },
    getEventColor(event) {
      return event.color;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    prev() {
      this.$refs.calendar.prev();
      this.calendarTitle = this.$refs.calendar.title || "";
    },
    next() {
      this.$refs.calendar.next();
      this.calendarTitle = this.$refs.calendar.title || "";
    },
    startDrag(nativeEvent, { event, timed }) {
      if (event && timed) {
        this.dragEvent = event;
        this.dragTime = null;
        this.extendOriginal = null;
      }
    },
    startTime(nativeEvent, tms) {
      const mouse = this.toTime(tms);

      if (this.dragEvent && this.dragTime === null) {
        const start = this.dragEvent.start;

        this.dragTime = mouse - start;
      } else {
        this.createStart = this.roundTime(mouse);
        this.createEvent = {
          name: `Event #${this.events.length}`,
          color: this.rndElement(this.colors),
          start: this.createStart,
          end: this.createStart,
          timed: true,
        };

        this.events.push(this.createEvent);
      }
    },
    extendBottom(event) {
      this.createEvent = event;
      this.createStart = event.start;
      this.extendOriginal = event.end;
    },
    mouseMove(nativeEvent, tms) {
      const mouse = this.toTime(tms);

      if (this.dragEvent && this.dragTime !== null) {
        const start = this.dragEvent.start;
        const end = this.dragEvent.end;
        const duration = end - start;
        const newStartTime = mouse - this.dragTime;
        const newStart = this.roundTime(newStartTime);
        const newEnd = newStart + duration;

        this.dragEvent.start = newStart;
        this.dragEvent.end = newEnd;
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false);
        const min = Math.min(mouseRounded, this.createStart);
        const max = Math.max(mouseRounded, this.createStart);

        this.createEvent.start = min;
        this.createEvent.end = max;
      }
    },
    endDrag() {
      this.dragTime = null;
      this.dragEvent = null;
      this.createEvent = null;
      this.createStart = null;
      this.extendOriginal = null;
    },
    cancelDrag() {
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal;
        } else {
          const i = this.events.indexOf(this.createEvent);
          if (i !== -1) {
            this.events.splice(i, 1);
          }
        }
      }

      this.createEvent = null;
      this.createStart = null;
      this.dragTime = null;
      this.dragEvent = null;
    },
    roundTime(time, down = true) {
      const roundTo = 15; // minutes
      const roundDownTime = roundTo * 60 * 1000;

      return down
        ? time - (time % roundDownTime)
        : time + (roundDownTime - (time % roundDownTime));
    },
    toTime(tms) {
      return new Date(
        tms.year,
        tms.month - 1,
        tms.day,
        tms.hour,
        tms.minute,
      ).getTime();
    },
    getEventColor(event) {
      const rgb = parseInt(event.color.substring(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      return event === this.dragEvent
        ? `rgba(${r}, ${g}, ${b}, 0.7)`
        : event === this.createEvent
          ? `rgba(${r}, ${g}, ${b}, 0.7)`
          : event.color;
    },
    rndElement(arr) {
      return arr[this.rnd(0, arr.length - 1)];
    },
  },
};
</script>
