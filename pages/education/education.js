// pages/education/education.js
import education from '../../api/education';
import errorHandler from '../../utils/errorHandler';
import { formatDate } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 查询参数
    educationTitle: '',
    currentPage: 1,
    pageSize: 5,
    
    // 数据
    educations: [],
    total: 0,
    
    // 弹窗相关
    showModal: false,
    isEdit: false,
    modalData: {
      educationId: '',
      educationTitle: '',
      educationContent: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getEducations();
  },

  /**
   * 获取科普信息列表
   */
  async getEducations() {
    try {
      wx.showLoading({
        title: '加载中...',
      });
      
      const params = {
        education_title: this.data.educationTitle || '',
        page_num: this.data.currentPage,
        page_size: this.data.pageSize
      };
      
      console.log("获取科普信息列表请求参数:", params);
      const res = await education.getEducation(params);
      
      if (res.code === 200) {
        console.log("获取科普信息列表响应数据:", res);
        
        // 处理日期显示格式
        const educations = res.data.data.map(item => {
          return {
            ...item,
            createTime: formatDate(new Date(item.createTime)),
            updateTime: formatDate(new Date(item.updateTime))
          };
        });
        
        this.setData({
          educations,
          total: res.data.total_item || 0
        });
      } else {
        errorHandler.errorHandler(res, '获取科普信息列表失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取科普信息列表失败');
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 处理搜索框输入
   */
  handleInputChange(e) {
    this.setData({
      educationTitle: e.detail.value
    });
  },

  /**
   * 处理刷新
   */
  handleSearch() {
    this.setData({
      currentPage: 1
    }, () => {
      this.getEducations();
    });
  },

  /**
   * 显示添加弹窗
   */
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      modalData: {
        educationId: '',
        educationTitle: '',
        educationContent: ''
      }
    });
  },

  /**
   * 显示修改弹窗
   */
  showEditModal(e) {
    const item = e.currentTarget.dataset.education;
    this.setData({
      showModal: true,
      isEdit: true,
      modalData: {
        educationId: item.educationId,
        educationTitle: item.educationTitle,
        educationContent: item.educationContent
      }
    });
  },

  /**
   * 隐藏弹窗
   */
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  /**
   * 处理弹窗表单输入
   */
  handleModalInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`modalData.${field}`]: value
    });
  },

  /**
   * 确认添加/修改
   */
  async handleConfirm() {
    const { educationId, educationTitle, educationContent } = this.data.modalData;
    
    if (!educationTitle) {
      wx.showToast({
        title: '请输入科普标题',
        icon: 'none'
      });
      return;
    }
    
    if (!educationContent) {
      wx.showToast({
        title: '请输入科普内容',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: this.data.isEdit ? '正在修改...' : '正在添加...'
      });
      
      const data = {
        educationTitle,
        educationContent
      };
      
      if (this.data.isEdit) {
        data.educationId = educationId;
      }
      
      let res;
      if (this.data.isEdit) {
        console.log("修改科普信息请求参数:", data);
        res = await education.updateEducation(data);
      } else {
        console.log("添加科普信息请求参数:", data);
        res = await education.addEducation(data);
      }
      
      if (res.code === 200) {
        console.log("添加/修改科普信息响应数据:", res);
        wx.showToast({
          title: this.data.isEdit ? '修改成功' : '添加成功',
          icon: 'success'
        });
        this.hideModal();
        this.getEducations();
      } else {
        errorHandler.errorHandler(res, this.data.isEdit ? '修改失败' : '添加失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, this.data.isEdit ? '修改失败' : '添加失败');
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 删除科普信息
   */
  handleDelete(e) {
    const educationId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该科普信息吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '删除中...'
            });
            
            console.log("删除科普信息请求参数:", educationId);
            const res = await education.deleteEducation(educationId);
            
            if (res.code === 200) {
              console.log("删除科普信息响应数据:", res);
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.getEducations();
            } else {
              errorHandler.errorHandler(res, '删除失败');
            }
          } catch (error) {
            errorHandler.errorHandler(error, '删除失败');
          } finally {
            wx.hideLoading();
          }
        }
      }
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
        this.getEducations();
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
        this.getEducations();
      });
    }
  },

  /**
   * 导航到个人信息页面
   */
  navigateToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时刷新数据
    this.getEducations();
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