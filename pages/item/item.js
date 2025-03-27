// pages/item/item.js
import item from '../../api/item';
import doctor from '../../api/doctor';
import errorHandler from '../../utils/errorHandler';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [],
    doctors: [],
    selectedDoctorIds: [],
    itemName: '',
    isEdit: false,
    currentItemId: null,
    showModal: false,
    searchValue: '',
    // 分页相关数据
    currentPage: 1,
    pageSize: 5,
    total: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getItems();
  },

  // 获取项目列表
  async getItems() {
    try {
      const params = {
        page_num: this.data.currentPage,
        page_size: this.data.pageSize,
        itemName: this.data.searchValue
      };
      console.log("获取项目列表请求数据：",params)
      const res = await item.getItem(params);
      if (res.code === 200) {
        console.log("获取项目列表响应数据：",res)
        this.setData({
          items: res.data.data || [],
          total: res.data.total_item || 0
        });
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取项目列表失败');
    }
  },

  // 搜索项目
  handleSearch(e) {
    console.log("搜索处理：",e)
    this.setData({
      searchValue: e.detail.value,
      currentPage: 1 // 重置到第一页
    });
    this.getItems();
  },

  // 刷新
  handleRefresh() {
    this.setData({
      searchValue: '',
      currentPage: 1
    }, () => {
      this.getItems();
    });
  },

  // 上一页
  handlePrevPage() {
    if (this.data.currentPage > 1) {
      this.setData({
        currentPage: this.data.currentPage - 1
      }, () => {
        this.getItems();
      });
    }
  },

  // 下一页
  handleNextPage() {
    const totalPages = Math.ceil(this.data.total / this.data.pageSize);
    if (this.data.currentPage < totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.getItems();
      });
    }
  },

  // 获取医生列表
  async loadDoctors() {
    try {
      const res = await doctor.getAllDoctor();
      if (res.code === 200) {
        console.log("获取医生列表响应数据：",res)
        const doctors = res.data.map(doc => ({
          ...doc,
          checked: false
        }));
        this.setData({ doctors });
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取医生列表失败');
    }
  },

  // 显示添加弹窗
  async showAddModal() {
    await this.loadDoctors();
    this.setData({
      showModal: true,
      isEdit: false,
      modalData: {
        itemName: '',
        selectedDoctorIds: []
      }
    });
  },

  // 显示编辑弹窗
  async showEditModal(e) {
    const currentItem = e.currentTarget.dataset.item;
    await this.loadDoctors();
    
    // 设置已选中的医生
    const doctors = this.data.doctors.map(doc => ({
      ...doc,
      checked: currentItem.doctor.some(d => d.doctorId === doc.doctorId)
    }));

    this.setData({
      showModal: true,
      isEdit: true,
      doctors,
      modalData: {
        itemId: currentItem.itemId,
        itemName: currentItem.itemName,
        selectedDoctorIds: currentItem.doctor.map(d => d.doctorId)
      }
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  // 处理项目名称输入
  handleItemNameInput(e) {
    this.setData({
      'modalData.itemName': e.detail.value
    });
  },

  // 处理医生选择
  handleDoctorSelect(e) {
    const selectedDoctorIds = e.detail.value;
    this.setData({
      'modalData.selectedDoctorIds': selectedDoctorIds
    });
  },

  // 确认添加/修改
  async handleConfirm() {
    const { itemId, itemName, selectedDoctorIds } = this.data.modalData;
    if (!itemName) {
      wx.showToast({
        title: '请输入项目名称',
        icon: 'none'
      });
      return;
    }
    if (!selectedDoctorIds.length) {
      wx.showToast({
        title: '请选择医生',
        icon: 'none'
      });
      return;
    }

    const doctorIds = selectedDoctorIds.join('|');
    try {
      let res;
      // URL参数
      const params = {
        item_id: itemId,
        item_name: itemName,
        doctor_id: doctorIds
      };
      
      // 请求体参数
      const data = {
      };
      
      if (this.data.isEdit) {
        params.item_id = itemId;
        console.log("修改项目请求数据：", params);
        res = await item.updateItem(params, data);
      } else {
        console.log("添加项目请求数据：", params);
        res = await item.addItem(params, data);
      }

      if (res.code === 200) {
        console.log("添加/修改项目响应数据：",res)
        wx.showToast({
          title: this.data.isEdit ? '修改成功' : '添加成功',
          icon: 'success'
        });
        this.hideModal();
        this.getItems();
      } else {
        errorHandler.errorHandler(res, this.data.isEdit ? '修改失败' : '添加失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, this.data.isEdit ? '修改失败' : '添加失败');
    }
  },

  // 删除项目
  async handleDelete(e) {
    const itemId = e.currentTarget.dataset.itemId;
    wx.showModal({
      title: '提示',
      content: '确定要删除该项目吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            console.log("删除项目请求数据：",itemId)
            const res = await item.deleteItem(itemId);
            if (res.code === 200) {
              console.log("删除项目响应数据：",res)
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.getItems();
            } else {
              errorHandler.errorHandler(res, '删除失败');
            }
          } catch (error) {
            errorHandler.errorHandler(error, '删除失败');
          }
        }
      }
    });
  },

  // 删除项目医生
  async handleDeleteDoctor(e) {
    const { itemId, doctorId } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定要删除该医生吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            console.log("删除项目医生请求数据：",itemId, doctorId)
            const res = await item.deleteItemDoctor(itemId, doctorId);
            if (res.code === 200) {
              console.log("删除项目医生响应数据：",res)
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.getItems();
            } else {
              errorHandler.errorHandler(res, '删除失败');
            }
          } catch (error) {
            errorHandler.errorHandler(error, '删除失败');
          }
        }
      }
    });
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

  }
})