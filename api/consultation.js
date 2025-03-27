import request from './request';

export default {
  // 获取咨询列表
  getConsultation: () => request.get('/admin/getConsultation'),
  
  // 回复咨询
  reply: (data) => request.post('/admin/reply', data)
} 