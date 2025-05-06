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

  // 获取项目列表
  fetchItems() {
    wx.showLoading({ title: '加载中...' });
    appointmentAPI.getItems()
      .then(res => {
        if (res.code === 200) {
          console.log("请求项目成功返回数据：", res.data);
          
          // 处理每个项目的时间列表
          const processedItems = res.data.map(item => {
            // 处理每个项目的预约时间
            const timeList = this.processAppointmentTimes(item.appointmentTime);
            return {
              ...item,
              timeList: timeList // 为每个项目添加处理后的时间列表
            };
          });
          
          this.setData({ 
            itemList: processedItems,
            selectedTime: {},
            selectedDoctors: {}
          });
          console.log("处理后的项目列表", this.data.itemList);
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

  // 处理服务器返回的时间戳数组
  processAppointmentTimes(timestampArray) {
    if (!timestampArray || !Array.isArray(timestampArray)) {
      return [];
    }
    
    const now = new Date(); // 获取当前时间
    
    // 过滤掉当前时间之前的时间选项，并对剩余时间进行格式化
    return timestampArray
      .filter(timestamp => {
        const appointmentDate = new Date(timestamp * 1000);
        return appointmentDate > now; // 只保留未来的时间
      })
      .map(timestamp => {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return {
          label: `${year}-${month}-${day} ${hours}:${minutes}`,
          value: timestamp
        };
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
    
    // 找到当前项目
    const currentItem = this.data.itemList.find(item => item.itemId === itemid);
    if (!currentItem || !currentItem.timeList || !currentItem.timeList[value]) {
      console.error("找不到项目或时间列表:", itemid, value);
      return;
    }
    
    // 从当前项目的时间列表中获取选中的时间
    const selectedTime = currentItem.timeList[value];
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