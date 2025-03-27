// pages/consultation/consultation.js
import consultationAPI from '../../api/consultation.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    consultationList: [],
    showQuestionModal: false,
    questionContent: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchConsultations();
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

  // 获取咨询列表
  fetchConsultations() {
    wx.showLoading({ title: '加载中...' });
    consultationAPI.getConsultations()
      .then(res => {
        if (res.code === 200) {
          this.setData({ 
            consultationList: res.data,
            questionContent: ''
          });
        }
      })
      .catch(err => {
        wx.showToast({
          title: '获取咨询失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 刷新列表
  onRefresh() {
    this.fetchConsultations();
  },

  // 显示提问弹窗
  showQuestionDialog() {
    this.setData({ 
      showQuestionModal: true,
      questionContent: ''
    });
  },

  // 关闭提问弹窗
  closeQuestionDialog() {
    this.setData({ 
      showQuestionModal: false,
      questionContent: ''
    });
  },

  // 输入问题内容
  onQuestionInput(e) {
    this.setData({
      questionContent: e.detail.value
    });
  },

  // 提交问题
  submitQuestion() {
    const { questionContent } = this.data;
    
    if (!questionContent.trim()) {
      wx.showToast({
        title: '请输入问题内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    consultationAPI.submitQuestion({ question: questionContent })
      .then(res => {
        if (res.code === 200) {
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });
          this.closeQuestionDialog();
          this.fetchConsultations();
        }
      })
      .catch(err => {
        wx.showToast({
          title: '提交失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  }
})