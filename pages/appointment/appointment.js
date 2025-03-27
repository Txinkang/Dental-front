// pages/appointment/appointment.js
import appointmentAPI from '../../api/appointment.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemList: [],
    timeList: [],
    selectedTime: {},
    selectedDoctors: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.generateTimeList();
    this.fetchItems();
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

  // 生成时间列表
  generateTimeList() {
    const timeList = [];
    const startHour = 8;
    const endHour = 17;
    const now = new Date();
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeDate = new Date();
        timeDate.setHours(hour, minute, 0, 0);
        
        // 只添加未来的时间点
        if (timeDate > now) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          timeList.push({
            label: timeString,
            value: Math.floor(timeDate.getTime() / 1000)
          });
        }
      }
    }

    this.setData({ timeList });
  },

  // 获取项目列表
  fetchItems() {
    wx.showLoading({ title: '加载中...' });
    appointmentAPI.getItems()
      .then(res => {
        if (res.code === 200) {
          this.setData({ 
            itemList: res.data,
            selectedTime: {},
            selectedDoctors: {}
          });
        }
      })
      .catch(err => {
        wx.showToast({
          title: '获取项目失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 刷新项目列表
  onRefresh() {
    this.fetchItems();
  },

  // 选择时间
  onTimeChange(e) {
    const { itemid } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    // 检查选择的时间是否有效
    const selectedTime = this.data.timeList[value];
    const now = new Date();
    const selectedDate = new Date(selectedTime.value * 1000);
    
    if (selectedDate <= now) {
      wx.showToast({
        title: '请选择未来的时间',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      ['selectedTime.' + itemid]: selectedTime
    });
  },

  // 选择医生
  onDoctorChange(e) {
    const { itemid } = e.currentTarget.dataset;
    const { value } = e.detail;
    const item = this.data.itemList.find(item => item.itemId === itemid);
    
    this.setData({
      ['selectedDoctors.' + itemid]: item.doctor[value]
    });
  },

  // 确认预约
  onAppointment(e) {
    const { itemid } = e.currentTarget.dataset;
    const selectedTime = this.data.selectedTime[itemid];
    const selectedDoctor = this.data.selectedDoctors[itemid];

    if (!selectedTime || !selectedDoctor) {
      wx.showToast({
        title: '请选择时间和医生',
        icon: 'none'
      });
      return;
    }

    const appointmentData = {
      doctorId: selectedDoctor.doctorId,
      itemId: itemid,
      appointmentTime: selectedTime.value.toString()
    };

    wx.showLoading({ title: '预约中...' });
    appointmentAPI.appointItem(appointmentData)
      .then(res => {
        if (res.code === 200) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          // 重新获取项目列表
          this.fetchItems();
        }
      })
      .catch(err => {
        wx.showToast({
          title: '预约失败',
          icon: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  }
})