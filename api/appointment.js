import request from './request';

export default {
  // 获取预约记录
  getAppointment: (data) => request.get('/admin/getAppointment', data),
  
  // 上传就诊结果
  uploadResult: (data) => request.patch('/admin/uploadResult', data),

  // 标记毁约
  breachAppointment: (data) => request.patch('/admin/breachAppointment', data)
} 