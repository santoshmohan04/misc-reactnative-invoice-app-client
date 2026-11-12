export const API_ENDPOINTS = {
  user: {
    login: '/user/login',
    register: '/user/register',
    profile: '/user/user',
    edit: '/user/edit',
    logout: '/user/logout',
    refreshPrimary: '/user/refresh',
    refreshFallback: '/auth/refresh',
  },
  invoice: {
    all: '/invoice/all',
    edit: '/invoice/edit',
    send: '/invoice/send',
  },
  customer: {
    all: '/customer/all',
    create: '/customer/create',
    edit: '/customer/edit',
  },
  item: {
    all: '/item/all',
    create: '/item/create',
    edit: '/item/edit',
  },
  payment: {
    create: '/payment/create',
  },
} as const;

export type ApiEndpointGroup = keyof typeof API_ENDPOINTS;
