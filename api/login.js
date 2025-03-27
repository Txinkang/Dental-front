import request from './request';

export default {
  login: (data) => request.post('/user/login', data),
  logout: () => request.get('/user/logout'),
};
