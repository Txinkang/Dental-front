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
  
  // 生成时间列表（前端生成）
  generateTimeList() {
    const timeList = [];
    const now = new Date();
    
    // 确定要显示哪一天的时间
    let targetDate = new Date(now);
    const currentHour = now.getHours();
    
    // 如果当前时间已经超过18:00，则显示明天的时间
    if (currentHour >= 18) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // 设置目标日期为当天的0点0分0秒
    targetDate.setHours(0, 0, 0, 0);
    
    // 诊所营业时间：早上8点到下午18点
    const startHour = 8;
    const endHour = 18;
    
    // 每小时生成4个时间点（每15分钟一个时间点）
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeDate = new Date(targetDate);
        timeDate.setHours(hour, minute, 0, 0);
        
        // 只添加未来的时间点
        if (timeDate > now) {
          const year = timeDate.getFullYear();
          const month = (timeDate.getMonth() + 1).toString().padStart(2, '0');
          const day = timeDate.getDate().toString().padStart(2, '0');
          const hours = timeDate.getHours().toString().padStart(2, '0');
          const minutes = timeDate.getMinutes().toString().padStart(2, '0');
          
          timeList.push({
            label: `${year}-${month}-${day} ${hours}:${minutes}`,
            value: Math.floor(timeDate.getTime() / 1000)
          });
        }
      }
    }
    
    // 如果没有可用时间点（例如已经接近或过了18:00），则显示明天的时间
    if (timeList.length === 0) {
      targetDate.setDate(targetDate.getDate() + 1);
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeDate = new Date(targetDate);
          timeDate.setHours(hour, minute, 0, 0);
          
          const year = timeDate.getFullYear();
          const month = (timeDate.getMonth() + 1).toString().padStart(2, '0');
          const day = timeDate.getDate().toString().padStart(2, '0');
          const hours = timeDate.getHours().toString().padStart(2, '0');
          const minutes = timeDate.getMinutes().toString().padStart(2, '0');
          
          timeList.push({
            label: `${year}-${month}-${day} ${hours}:${minutes}`,
            value: Math.floor(timeDate.getTime() / 1000)
          });
        }
      }
    }
    
    this.setData({ timeList });
    console.log("前端生成的时间列表", this.data.timeList);
  },

  // 获取项目列表
  fetchItems() {
    wx.showLoading({ title: '加载中...' });
    appointmentAPI.getItems()
      .then(res => {
        if (res.code === 200) {
          console.log("请求项目成功返回数据：", res.data);
          
          this.setData({ 
            itemList: res.data,
            selectedTime: {},
            selectedDoctors: {}
          });
          console.log("项目列表", this.data.itemList);
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
    
    // 从全局时间列表中获取选中的时间
    const selectedTime = this.data.timeList[value];
    if (!selectedTime) {
      console.error("找不到选中的时间:", value);
      return;
    }
    
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
    console.log("选择的时间", this.data.selectedTime);
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

    // 将时间戳转换为本地格式化的日期时间字符串
    const timestamp = selectedTime.value;
    const date = new Date(timestamp * 1000);
    
    // 使用本地时间格式化，而不是UTC
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const appointmentData = {
      doctorId: selectedDoctor.doctorId,
      itemId: itemid,
      appointmentTime: formattedDate
    };

    wx.showLoading({ title: '预约中...' });
    appointmentAPI.appointItem(appointmentData)
      .then(res => {
        if (res.code === 200) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          console.log("预约成功", res);
          // 重新获取项目列表
          this.fetchItems();
        }else{
          wx.showToast({
            title: res.data,
            icon: 'none'
          });
          console.log("预约失败", res);
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