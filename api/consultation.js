import request from './request.js';

const consultationAPI = {
  // 获取咨询列表
  getConsultations() {
    return request.get('/user/getConsultaion');
  },

  // 提交咨询问题
  submitQuestion(data) {
    return request.post('/user/consult', data);
  }
};

export default consultationAPI; 