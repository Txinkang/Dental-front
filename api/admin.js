import request from './request';

export default {
  // 获取管理员信息
  getAdminInfo: () => request.get('/admin/getAdminInfo'),
  
  // 退出登录
  logout: () => request.get('/admin/logout')
} 