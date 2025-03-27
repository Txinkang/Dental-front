// pages/logs/logs.js
import login from '../../api/login'
import userAPI from '../../api/user'
import errorHandler from '../../utils/errorHandler'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userAccount: '',
    userPassword: '',
    userName: '',
    userEmail: '',
    isRegister: false // 控制显示登录还是注册表单
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

  // 切换登录/注册表单
  switchForm() {
    this.setData({
      isRegister: !this.data.isRegister,
      userAccount: '',
      userPassword: '',
      userName: '',
      userEmail: ''
    });
  },

  // 输入账号
  inputAccount(e) {
    this.setData({
      userAccount: e.detail.value
    })
  },

  // 输入密码
  inputPassword(e) {
    this.setData({
      userPassword: e.detail.value
    })
  },

  // 输入用户名
  inputUserName(e) {
    this.setData({
      userName: e.detail.value
    })
  },

  // 输入邮箱
  inputEmail(e) {
    this.setData({
      userEmail: e.detail.value
    })
  },

  // 处理注册
  async handleRegister() {
    const { userAccount, userPassword, userName, userEmail } = this.data;
    if (!userAccount || !userPassword || !userName || !userEmail) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    try {
      const registerData = {
        userAccount,
        userPassword,
        userName,
        userEmail
      };
      console.log("用户注册请求数据",registerData);
      const res = await userAPI.register(registerData);
      if (res.code === 200) {
        console.log("用户注册响应数据",res);
        wx.showToast({
          title: '注册成功',
          icon: 'success'
        });
        // 注册成功后切换到登录表单
        this.setData({ isRegister: false });
      }
      else{
        errorHandler.errorHandler(res,'用户注册失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error,'用户注册失败');
    }
  },

  // 登录
  async handleLogin() {
    const { userAccount, userPassword } = this.data
    if (!userAccount || !userPassword) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      })
      return
    }

    try {
      const requestData = {
        userAccount,
        userPassword
      }
      console.log("用户登录请求数据：",requestData)
      const res = await login.login(requestData)
      console.log("用户登录响应数据：",res)
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
          url: '/pages/home/home'
        })
      } else {
        errorHandler.errorHandler(res,'用户登录失败');
      }
    } catch (error) {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  }
})