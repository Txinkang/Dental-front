import request from './request.js';

const appointmentAPI = {
  // 获取项目列表
  getItems() {
    return request.get('/user/getItem');
  },

  // 预约项目
  appointItem(data) {
    return request.post('/user/appointentItem', data);
  }
};

export default appointmentAPI; 