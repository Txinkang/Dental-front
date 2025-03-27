// pages/appointment/appointment.js
import appointment from '../../api/appointment';
import errorHandler from '../../utils/errorHandler';
import { formatDate } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 查询参数
    itemName: '',
    doctorName: '',
    userName: '',
    currentPage: 1,
    pageSize: 5,
    
    // 数据
    appointments: [],
    total: 0,
    
    // 临时存储的就诊结果
    resultInputs: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getAppointments();
  },

  /**
   * 获取预约列表
   */
  async getAppointments() {
    try {
      wx.showLoading({
        title: '加载中...',
      });
      
      const params = {
        item_name: this.data.itemName || '',
        doctor_name: this.data.doctorName || '',
        user_name: this.data.userName || '',
        page_num: this.data.currentPage,
        page_size: this.data.pageSize
      };
      
      console.log("获取预约列表请求参数:", params);
      const res = await appointment.getAppointment(params);
      
      if (res.code === 200) {
        console.log("获取预约列表响应数据:", res);
        
        // 处理日期显示格式
        const appointments = res.data.data.map(item => {
          return {
            ...item,
            appointmentTime: formatDate(new Date(item.appointmentTime)),
            createTime: formatDate(new Date(item.createTime)),
            updateTime: formatDate(new Date(item.updateTime)),
            tempResult: this.data.resultInputs[item.appointmentId] || item.result || ''
          };
        });
        
        this.setData({
          appointments,
          total: res.data.total_item || 0
        });
      } else {
        errorHandler.errorHandler(res, '获取预约列表失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取预约列表失败');
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 处理输入框变化
   */
  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [field]: value
    });
  },

  /**
   * 处理就诊结果输入
   */
  handleResultInput(e) {
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`resultInputs.${id}`]: value
    });
  },

  /**
   * 处理搜索
   */
  handleSearch() {
    this.setData({
      currentPage: 1
    }, () => {
      this.getAppointments();
    });
  },

  /**
   * 处理刷新
   */
  handleRefresh() {
    this.setData({
      itemName: '',
      doctorName: '',
      userName: '',
      currentPage: 1
    }, () => {
      this.getAppointments();
    });
  },

  /**
   * 上一页
   */
  handlePrevPage() {
    if (this.data.currentPage > 1) {
      this.setData({
        currentPage: this.data.currentPage - 1
      }, () => {
        this.getAppointments();
      });
    }
  },

  /**
   * 下一页
   */
  handleNextPage() {
    const totalPages = Math.ceil(this.data.total / this.data.pageSize);
    if (this.data.currentPage < totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.getAppointments();
      });
    }
  },

  /**
   * 上传就诊结果
   */
  async handleUploadResult(e) {
    const { id } = e.currentTarget.dataset;
    const result = this.data.resultInputs[id];
    
    if (!result) {
      wx.showToast({
        title: '请输入就诊结果',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: '上传中...'
      });
      
      const data = {
        appointmentId: id,
        result: result
      };
      
      console.log("上传就诊结果请求参数:", data);
      const res = await appointment.uploadResult(data);
      
      if (res.code === 200) {
        console.log("上传就诊结果响应数据:", res);
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
        // 刷新列表
        this.getAppointments();
      } else {
        errorHandler.errorHandler(res, '上传就诊结果失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '上传就诊结果失败');
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时刷新数据
    this.getAppointments();
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