import request from './request';

export default {
  login: (data) => request.post('/admin/login', data),
  logout: () => request.get('/admin/logout'),
};
