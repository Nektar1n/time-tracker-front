<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <v-card prepend-icon="mdi-cog">
          <template v-slot:title>
            <span class="text-h6 font-weight-black">Настройки программы</span>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <router-view />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup></script>

<style scoped></style>
