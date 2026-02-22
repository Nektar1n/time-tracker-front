//import lsp from '@/lib/LocalStoragePack'
import Api from "@/libs/apiCall";
import Vue from "vue";

const state = {
  users: null,
};

const getters = {
  getUsers: (state) => state.users,
};

const mutations = {
  SET_USER: (state, candidate) => {
    const index = state.users.findIndex((i) => i.id === candidate.id);

    if (index > -1) {
      Vue.set(state.users, index, { ...state.users[index], ...candidate });
    } else {
      state.users.push({ ...candidate });
    }
  },

  SET_USERS: (state, list) => {
    state.users = list;
  },
};

const actions = {
  UPDATE_USER: async ({ commit }, data) => {
    const candidate = await Api.post(`/users/update-user`, data);
    commit("SET_USER", candidate);
  },

  ADD_USER: async ({ commit }, data) => {
    const candidate = await Api.post(`/users`, data);
    commit("SET_USER", candidate);
    return candidate;
  },

  CHECK_EMAIL: async (_, email) => {
    return await Api.post(`/users/check-email`, { email });
  },

  GET_USERS: async ({ getters, commit }, force = false) => {
    try {
      if (getters.getUsers && !force) return getters.getUsers;
      const list = await Api.get(`/users`);
      commit("SET_USERS", list);
    } catch (error) {
      Vue.$toast.error(error);
    }
  },
  GENERATE_RESET_PASSWORD_TOKEN: async ({ commit }, userId) => {
    try {
      // возвращаем теперь весь объект user, у него там и ФИО и токен сброса
      return await Api.post(`users/${userId}/generate-reset-password-token`);
    } catch (err) {
      commit("SET_ERROR", {
        head: "Ошибка генерации токена сброса пароля",
        err,
      });
      throw new Error("Ошибка генерации токена сброса пароля");
    }
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
