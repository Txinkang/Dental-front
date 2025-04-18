// pages/my/my.js
import userAPI from '../../api/user.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    appointmentList: [],
    showEditModal: false,
    editForm: {
      userAccount: '',
      userPassword: '',
      userName: '',
      userEmail: ''
    },
    currentPage: 1,
    pageSize: 5,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchUserInfo();
    this.fetchAppointments();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 获取个人信息
  fetchUserInfo() {
    wx.showLoading({ title: '加载中...' });
    userAPI.getUserInfo()
      .then(res => {
        if (res.code === 200) {
          this.setData({ 
            userInfo: res.data,
            editForm: {
              userAccount: res.data.userAccount,
              userPassword: res.data.userPassword,
              userName: res.data.userName,
              userEmail: res.data.userEmail
            }
          });
        }
      })
      .catch(err => {
        wx.showToast({
          title: '获取信息失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 获取预约记录
  fetchAppointments(loadMore = false) {
    const { appointmentList } = this.data;
    
    wx.showLoading({ title: '加载中...' });
    userAPI.getAppointments()
      .then(res => {
        if (res.code === 200) {
          console.log(res.data);
          
          // 为每个预约项添加canCancel属性
          const processedData = res.data.map(item => {
            // 计算是否可以取消预约
            let canCancel = false;
            
            if (item.appointmentTime) {
              const now = new Date();
              
              try {
                // 尝试解析日期字符串 (格式: YYYY-MM-DD HH:MM:SS)
                const parts = item.appointmentTime.split(/[- :]/);
                // 注意: 月份是从0开始的, 所以要减1
                const appointmentDate = new Date(
                  parts[0], parts[1] - 1, parts[2], 
                  parts[3], parts[4], parts[5]
                );
                
                const timeDiff = appointmentDate - now;
                canCancel = timeDiff > 15 * 60 * 1000; // 15分钟转换为毫秒
              } catch (error) {
                console.error("Error parsing appointment time:", error);
              }
            }
            
            return { ...item, canCancel };
          });
          
          const newList = loadMore ? [...appointmentList, ...processedData] : processedData;
          this.setData({ 
            appointmentList: newList,
          });
        }
      })
      .catch(err => {
        wx.showToast({
          title: '获取预约失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 显示编辑弹窗
  showEditDialog() {
    this.setData({ showEditModal: true });
  },

  // 关闭编辑弹窗
  closeEditDialog() {
    this.setData({ showEditModal: false });
  },

  // 表单输入
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`editForm.${field}`]: e.detail.value
    });
  },

  // 提交编辑
  submitEdit() {
    const { editForm } = this.data;
    
    wx.showLoading({ title: '提交中...' });
    console.log("修改用户信息请求数据",editForm);  
    userAPI.updateUserInfo(editForm)
      .then(res => {
        if (res.code === 200) {
          console.log("修改用户信息响应数据",res);  
          wx.showToast({
            title: '更新成功',
            icon: 'success'
          });
          this.closeEditDialog();
          this.fetchUserInfo();
        }
      })
      .catch(err => {
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 取消预约
  cancelAppointment(e) {
    const { appointmentid } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '提示',
      content: '确定要取消预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });
          console.log("取消预约请求数据",appointmentid);  
          userAPI.cancelAppointment(appointmentid)
            .then(res => {
              if (res.code === 200) {
                console.log("取消预约请求数据",res);  
                wx.showToast({
                  title: '取消成功',
                  icon: 'success'
                });
                this.setData({ currentPage: 1 });
                this.fetchAppointments();
              }
            })
            .catch(err => {
              wx.showToast({
                title: '取消失败',
                icon: 'error'
              });
            })
            .finally(() => {
              wx.hideLoading();
            });
        }
      }
    });
  },

  // 检查是否可以取消预约
  canCancelAppointment(appointmentTime) {
    console.log("appointmentTime", appointmentTime);
    if (!appointmentTime) return false;
    
    const now = new Date();
    
    // 判断appointmentTime是否为时间戳
    if (!isNaN(Number(appointmentTime)) && Number(appointmentTime) > 946684800000) { // 2000年以后的时间戳
      const appointmentDate = new Date(Number(appointmentTime));
      const timeDiff = appointmentDate - now;
      console.log("timeDiff (from timestamp)", timeDiff);
      return timeDiff > 15 * 60 * 1000; // 15分钟转换为毫秒
    }
    
    // 尝试解析日期字符串 (格式: YYYY-MM-DD HH:MM:SS)
    try {
      // 将字符串格式的时间转换为Date对象
      const parts = appointmentTime.split(/[- :]/);
      // 注意: 月份是从0开始的, 所以要减1
      const appointmentDate = new Date(
        parts[0], parts[1] - 1, parts[2], 
        parts[3], parts[4], parts[5]
      );
      
      const timeDiff = appointmentDate - now;
      console.log("appointmentDate", appointmentDate);
      console.log("timeDiff (from string)", timeDiff);
      return timeDiff > 15 * 60 * 1000; // 15分钟转换为毫秒
    } catch (error) {
      console.error("Error parsing appointment time:", error);
      return false;
    }
  },

  // 刷新预约记录
  onRefresh() {
    this.setData({ currentPage: 1 });
    this.fetchAppointments();
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          userAPI.logout();
          // 跳转到登录页面
          wx.redirectTo({
            url: '/pages/logs/logs'
          });
        }
      }
    });
  }
})