import request from './request';

export default {
  // 获取科普信息列表
  getEducation: (data) => request.get('/admin/getEducation', data),
  
  // 添加科普信息
  addEducation: (data) => request.post('/admin/addEducation', data),
  
  // 修改科普信息
  updateEducation: (data) => request.patch('/admin/updateEducation', data),
  
  // 删除科普信息
  deleteEducation: (education_id) => request.delete(`/admin/deleteEducation?education_id=${education_id}`)
} 