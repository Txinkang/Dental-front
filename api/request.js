// request.js - API request utility

const BASE_URL = 'http://localhost:8888';
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
/**
 * Generic request function
 * @param {string} url - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} data - Request data (body or query params)
 * @param {Object} header - Custom headers
 * @param {boolean} isFormData - Whether to send as FormData
 */
const request = (url, method, data = {}, header = {}, isFormData = false) => {
  return new Promise((resolve, reject) => {
    const token = checkToken();
    if (!token && url !== '/user/login' && url !== '/user/register') {
      reject(new Error('No token available'));
      return;
    }
    // Prepare headers
    const headers = {
      'Authorization': token ? `${token}` : '',
      'content-type': isFormData ? 'multipart/form-data' : 'application/json',
      ...header
    };

    // Handle GET request query parameters
    let requestUrl = BASE_URL + url;
    if (method === 'GET' && Object.keys(data).length > 0) {
      const queryString = Object.keys(data)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');
      requestUrl += `?${queryString}`;
    }

    wx.request({
      url: requestUrl,
      method,
      data: method !== 'GET' ? data : {},
      header: headers,
      success: (res) => {
        if(res.statusCode === 401){
          wx.redirectTo({ url: '/pages/logs/logs' });
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject({
            message: `Request failed with status ${res.statusCode}`,
            ...res
          });
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// HTTP method wrappers
const api = {
  get: (url, data = {}, header = {}) => request(url, 'GET', data, header),
  post: (url, data = {}, header = {}, isFormData = false) => 
    request(url, 'POST', data, header, isFormData),
  put: (url, data = {}, header = {}, isFormData = false) => 
    request(url, 'PUT', data, header, isFormData),
  patch: (url, data = {}, header = {}, isFormData = false) => 
    request(url, 'PATCH', data, header, isFormData),
  delete: (url, data = {}, header = {}) => 
    request(url, 'DELETE', data, header)
};

export default api; 