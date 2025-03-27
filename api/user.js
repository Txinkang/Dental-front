import request from './request.js';

const userAPI = {
  // 获取个人信息
  getUserInfo() {
    return request.get('/user/getUserInfo');
  },

  // 更新个人信息
  updateUserInfo(data) {
    return request.patch('/user/updateUserInfo', data);
  },

  // 获取预约记录
  getAppointments() {
    return request.get('/user/getAppointment');
  },

  // 取消预约
  cancelAppointment(appointmentId) {
    return request.get('/user/cancelAppointment', { appointmentId });
  },

  // 用户注册
  register(data) {
    return request.post('/user/register', data);
  },

  // 用户退出登录
  logout() {
    // 清除本地存储的token
    wx.removeStorageSync('token');
    wx.removeStorageSync('tokenExpireTime');
  }
};

export default userAPI; 