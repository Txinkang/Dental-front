import admin from '../../api/admin';
import errorHandler from '../../utils/errorHandler';
import { formatDate } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    adminInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getAdminInfo();
  },

  /**
   * 获取管理员信息
   */
  async getAdminInfo() {
    try {
      wx.showLoading({
        title: '加载中...',
      });
      
      const res = await admin.getAdminInfo();
      
      if (res.code === 200) {
        console.log("获取管理员信息响应数据:", res);
        
        // 处理日期显示格式
        const adminInfo = {
          ...res.data,
          createdAt: formatDate(new Date(res.data.createdAt)),
          updatedAt: formatDate(new Date(res.data.updatedAt))
        };
        
        this.setData({
          adminInfo
        });
      } else {
        errorHandler.errorHandler(res, '获取管理员信息失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取管理员信息失败');
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 处理退出登录
   */
  async handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '退出中...'
            });
            
            const res = await admin.logout();
            
            // 无论接口是否成功，都清除本地存储并退出
            wx.removeStorageSync('token');
            wx.removeStorageSync('tokenExpireTime');
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500,
              success: () => {
                // 跳转到登录页
                setTimeout(() => {
                  wx.redirectTo({
                    url: '/pages/logs/logs'
                  });
                }, 1500);
              }
            });
          } catch (error) {
            console.error('退出登录失败', error);
            
            // 即使失败也清除本地存储并退出
            wx.removeStorageSync('token');
            wx.removeStorageSync('tokenExpireTime');
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  wx.redirectTo({
                    url: '/pages/logs/logs'
                  });
                }, 1500);
              }
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时刷新数据
    this.getAdminInfo();
  }
}) 