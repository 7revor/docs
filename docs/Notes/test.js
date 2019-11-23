const a = {
  path: '/shop-favor',
  component: 'shop-favor',
  children: [
    {
      path: '/coupon',
      component: 'coupon',
      children: [
        {
          path: '/activity',
          component: '/activity',
        },
        {
          path: '/create',
          component: '/create',
        },
        {
          path: '/record',
          component: '/record',
        }
      ]
    },
    {
      path: '/gifts',
      component: 'gifts',
      children: [
        {
          path: '/activity',
          component: '/activity',
        },
        {
          path: '/create',
          component: '/create',
        },
        {
          path: '/record',
          component: '/record',
        }
      ]
    },
  ]
}
