import request from './request';

export default {
  // 获取医生列表
  getDoctor: (data) => request.get('/admin/getDoctor', data),
  
  // 添加医生
  addDoctor: (data, options) => request.post('/admin/addDoctor', data, options),
  
  // 修改医生
  updateDoctor: (data, options) => request.post('/admin/updateDoctor', data, options),
  
  // 删除医生
  deleteDoctor: (doctor_id) => request.delete(`/admin/deleteDoctor?doctor_id=${doctor_id}`),
  
  // 获取所有医生（用于选择列表）
  getAllDoctor: () => request.get('/admin/getAllDoctor')
}
