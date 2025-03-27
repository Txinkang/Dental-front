import request from './request';

// 项目相关接口
export default {
  // GET请求：参数会自动转换为查询参数（URL参数）
  getItem: (data) => request.get('/admin/getItem', data),
  
  // POST请求：支持URL参数和请求体参数
  addItem: (params, data) => request.post('/admin/addItem', data, { params }),
  
  // PATCH请求：支持URL参数和请求体参数
  updateItem: (params, data) => request.patch('/admin/updateItem', data, { params }),
  
  // DELETE请求：简单参数可以放在URL中
  deleteItem: (item_id) => request.delete(`/admin/deleteItem?item_id=${item_id}`),
  
  // DELETE请求：简单参数可以放在URL中
  deleteItemDoctor: (item_id, doctor_id) => request.delete(`/admin/deleteItemDoctor?item_id=${item_id}&doctor_id=${doctor_id}`)
};
