// pages/consultation/consultation.js
import consultation from '../../api/consultation';
import errorHandler from '../../utils/errorHandler';
import { formatDate } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 咨询列表数据
    consultations: [],
    
    // 回复输入框内容
    answerInputs: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getConsultations();
  },

  /**
   * 获取咨询列表
   */
  async getConsultations() {
    try {
      wx.showLoading({
        title: '加载中...',
      });
      
      console.log("获取咨询列表");
      const res = await consultation.getConsultation();
      
      if (res.code === 200) {
        console.log("获取咨询列表响应数据:", res);
        
        // 处理日期显示格式
        const consultations = res.data.map(item => {
          return {
            ...item,
            createTime: formatDate(new Date(item.createTime)),
            updateTime: formatDate(new Date(item.updateTime))
          };
        });
        
        this.setData({
          consultations
        });
      } else {
        errorHandler.errorHandler(res, '获取咨询列表失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取咨询列表失败');
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 处理回复输入
   */
  handleAnswerInput(e) {
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`answerInputs.${id}`]: value
    });
  },

  /**
   * 处理刷新
   */
  handleRefresh() {
    this.getConsultations();
  },

  /**
   * 处理回复提交
   */
  async handleReply(e) {
    const { id } = e.currentTarget.dataset;
    const answer = this.data.answerInputs[id];
    
    if (!answer) {
      wx.showToast({
        title: '请输入回复内容',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: '提交中...'
      });
      
      const data = {
        consultationId: id,
        answer: answer
      };
      
      console.log("回复咨询请求参数:", data);
      const res = await consultation.reply(data);
      
      if (res.code === 200) {
        console.log("回复咨询响应数据:", res);
        wx.showToast({
          title: '回复成功',
          icon: 'success'
        });
        
        // 清空输入框并刷新列表
        this.setData({
          [`answerInputs.${id}`]: ''
        });
        this.getConsultations();
      } else {
        errorHandler.errorHandler(res, '回复咨询失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '回复咨询失败');
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时刷新数据
    this.getConsultations();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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

  }
})