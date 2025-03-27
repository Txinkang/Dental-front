// pages/logs/logs.js
import login from '../../api/login'
import errorHandler from '../../utils/errorHandler'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adminAccount: '',
    adminPassword: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 输入账号
  inputAccount(e) {
    this.setData({
      adminAccount: e.detail.value
    })
  },

  // 输入密码
  inputPassword(e) {
    this.setData({
      adminPassword: e.detail.value
    })
  },

  // 登录
  async handleLogin() {
    const { adminAccount, adminPassword } = this.data
    if (!adminAccount || !adminPassword) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      })
      return
    }

    try {
      const requestData = {
        adminAccount,
        adminPassword
      }
      console.log("管理员登录请求数据：",requestData)
      const res = await login.login(requestData)
      console.log("管理员登录响应数据：",res)
      if (res.code === 200) {
        const token = res.data
        // 设置token到缓存
        wx.setStorageSync('token', token)
        // 设置token过期时间（3天）
        const expireTime = new Date().getTime() + 3 * 24 * 60 * 60 * 1000
        wx.setStorageSync('tokenExpireTime', expireTime)

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 登录成功后跳转到首页
        wx.switchTab({
          url: '/pages/item/item'
        })
      } else {
        errorHandler.errorHandler(res,'管理员登录失败');
      }
    } catch (error) {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  }
})