// 封装wx.request
import errorHandler from '../utils/errorHandler';

const baseURL = 'http://localhost:8080';

// 将对象转换为URL查询字符串
const objectToQueryString = (obj) => {
  if (!obj) return '';
  const parts = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
};

const checkToken = () => {
  const token = wx.getStorageSync('token');
  if (!token) {
    wx.redirectTo({ url: '/pages/logs/logs' });
    return false;
  }
  
  const expireTime = wx.getStorageSync('tokenExpireTime');
  if (expireTime && new Date().getTime() > expireTime) {
    wx.removeStorageSync('token');
    wx.removeStorageSync('tokenExpireTime');
    wx.redirectTo({ url: '/pages/logs/logs' });
    return false;
  }
  
  return token;
};

// 检测是否包含文件上传
const hasFileUpload = (data) => {
  return data && data.tempFilePath && typeof data.tempFilePath === 'string';
};

const request = (url, method, data = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    const token = checkToken();
    if (!token && url !== '/admin/login') {
      reject(new Error('No token available'));
      return;
    }

    // 处理URL参数
    const queryString = options.params ? objectToQueryString(options.params) : '';
    const finalUrl = baseURL + url + queryString;

    // 清理数据对象，移除null和undefined
    const cleanedData = data;
    
    // 检查是否使用FormData（通过选项或存在文件）
    const useFormData = options.useFormData || hasFileUpload(cleanedData);
    
    if (useFormData) {
      // 使用FormData处理数据
      const { tempFilePath, fileFieldName = 'file', ...formData } = cleanedData;
      
      if (tempFilePath) {
        // 如果有文件，使用uploadFile
        wx.uploadFile({
          url: finalUrl,
          filePath: tempFilePath,
          name: fileFieldName,
          formData: formData,
          header: {
            'Authorization': token ? `${token}` : '',
            ...options.header
          },
          success: (res) => {
            if(res.statusCode === 401){
              wx.redirectTo({ url: '/pages/logs/logs' });
              return;
            }
            if (typeof res.data === 'string') {
              try {
                const data = JSON.parse(res.data);
                resolve(data);
              } catch (e) {
                reject(new Error('Response parsing error'));
              }
            } else {
              resolve(res.data);
            }
          },
          fail: (err) => {
            reject(err);
            errorHandler.errorHandlerWithUrl(err, url, '请求失败');
          }
        });
      } else {
        console.log("没有文件但使用FormData格式，URL:", finalUrl);
        console.log("发送的数据:", formData);
        console.log("请求方法:", method);
        // 没有文件但使用FormData格式
        wx.request({
          url: finalUrl,
          method,
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': token ? `${token}` : '',
            ...options.header
          },
          data: formData,
          success: (res) => {
            if(res.statusCode === 401){
              wx.redirectTo({ url: '/pages/logs/logs' });
              return;
            }
            console.log("请求成功，响应数据:", res.data);
            resolve(res.data);
          },
          fail: (err) => {
            console.log("请求失败:", err);
            reject(err);
            errorHandler.errorHandlerWithUrl(err, url, '请求失败');
          }
        });
      }
    } else {
      // 普通JSON请求
      wx.request({
        url: finalUrl,
        method,
        data: cleanedData,
        header: {
          'content-type': 'application/json',
          'Authorization': token ? `${token}` : '',
          ...options.header
        },
        success: (res) => {
          if(res.statusCode === 401){
            wx.redirectTo({ url: '/pages/logs/logs' });
            return;
          }
          resolve(res.data);
        },
        fail: (err) => {
          reject(err);
          errorHandler.errorHandlerWithUrl(err, url, '请求失败');
        }
      });
    }
  });
};

export default {
  get: (url, data = {}, options = {}) => request(url, 'GET', data, options),
  post: (url, data = {}, options = {}) => request(url, 'POST', data, options),
  put: (url, data = {}, options = {}) => request(url, 'PUT', data, options),
  patch: (url, data = {}, options = {}) => request(url, 'PATCH', data, options),
  delete: (url, data = {}, options = {}) => request(url, 'DELETE', data, options)
};