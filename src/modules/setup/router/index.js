export default {
  path: '/setup',
  name: 'Setup',
  component: () => import('@/modules/setup/view/SetupView.vue'),
  meta: {
    title: 'Настройки',
    menu: true,
    icon: 'mdi-cog',
  },
  children: [
    {
      path: '/users',
      name: 'setup.users',
      component: () =>
        import('@/modules/setup/setup-users/view/SetupUsersView.vue'),
      meta: {
        title: 'Пользователи',
        menu: true,
        icon: 'mdi-account',
      },
    },
  ],
}
