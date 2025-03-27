// pages/doctor/doctor.js
import doctor from '../../api/doctor';
import errorHandler from '../../utils/errorHandler';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    doctors: [],
    searchValue: '',
    currentPage: 1,
    pageSize: 5,
    total: 0,
    showModal: false,
    isEdit: false,
    modalData: {
      doctorId: '',
      doctorName: '',
      introduction: '',
      workingYears: '',
      doctorAvatar: ''
    },
    tempFilePath: '' // 临时文件路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getDoctors();
  },

  // 获取医生列表
  async getDoctors() {
    try {
      const params = {
        doctor_name: this.data.searchValue || '',
        page_num: this.data.currentPage,
        page_size: this.data.pageSize
      };
      console.log("获取医生列表请求数据：", params);
      const res = await doctor.getDoctor(params);
      if (res.code === 200) {
        console.log("获取医生列表响应数据：", res);
        this.setData({
          doctors: res.data.data || [],
          total: res.data.total_item || 0
        });
      } else {
        errorHandler.errorHandler(res, '获取医生列表失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取医生列表失败');
    }
  },

  // 搜索医生
  handleSearch(e) {
    console.log("搜索处理：", e);
    this.setData({
      searchValue: e.detail.value,
      currentPage: 1 // 重置到第一页
    });
    this.getDoctors();
  },

  // 刷新
  handleRefresh() {
    this.setData({
      searchValue: '',
      currentPage: 1
    }, () => {
      this.getDoctors();
    });
  },

  // 上一页
  handlePrevPage() {
    if (this.data.currentPage > 1) {
      this.setData({
        currentPage: this.data.currentPage - 1
      }, () => {
        this.getDoctors();
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
        this.getDoctors();
      });
    }
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      modalData: {
        doctorId: '',
        doctorName: '',
        introduction: '',
        workingYears: '',
        doctorAvatar: ''
      },
      tempFilePath: ''
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const currentDoctor = e.currentTarget.dataset.doctor;
    this.setData({
      showModal: true,
      isEdit: true,
      modalData: {
        doctorId: currentDoctor.doctorId,
        doctorName: currentDoctor.doctorName,
        introduction: currentDoctor.introduction,
        workingYears: currentDoctor.workingYears,
        doctorAvatar: currentDoctor.doctorAvatar
      },
      tempFilePath: ''
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  // 处理表单输入
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`modalData.${field}`]: value
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          tempFilePath: res.tempFilePaths[0]
        });
      }
    });
  },

  // 确认添加/修改
  async handleConfirm() {
    const { doctorId, doctorName, introduction, workingYears } = this.data.modalData;
    
    if (!doctorName) {
      wx.showToast({
        title: '请输入医生姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!introduction) {
      wx.showToast({
        title: '请输入医生简介',
        icon: 'none'
      });
      return;
    }
    
    if (!workingYears && workingYears !== 0) {
      wx.showToast({
        title: '请输入工作年限',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.isEdit && !this.data.tempFilePath) {
      wx.showToast({
        title: '请选择医生头像',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: this.data.isEdit ? '正在修改...' : '正在添加...'
    });

    try {
      // 准备请求数据
      const requestData = {
        doctor_name: doctorName,
        introduction: introduction,
        working_years: workingYears
      };
      
      // 如果是编辑模式，添加doctor_id
      if (this.data.isEdit) {
        requestData.doctor_id = doctorId;
      }
      
      // 如果有选择图片，添加文件相关信息
      if (this.data.tempFilePath) {
        requestData.tempFilePath = this.data.tempFilePath;
        requestData.fileFieldName = 'doctor_avatar';
      }
      
      // 使用统一的API方法，始终使用FormData格式
      const res = await (this.data.isEdit ? 
        doctor.updateDoctor(requestData, { useFormData: true }) : 
        doctor.addDoctor(requestData, { useFormData: true }));
      
      console.log("添加/修改医生请求数据：", requestData);
      
      // 处理响应
      if (res && res.code === 200) {
        console.log("添加/修改医生响应数据：", res);
        wx.showToast({
          title: this.data.isEdit ? '修改成功' : '添加成功',
          icon: 'success'
        });
        this.hideModal();
        this.getDoctors();
      } else if (res) {
        errorHandler.errorHandler(res, this.data.isEdit ? '修改失败' : '添加失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, this.data.isEdit ? '修改失败' : '添加失败');
    } finally {
      wx.hideLoading();
    }
  },

  // 删除医生
  handleDelete(e) {
    const doctorId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该医生吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            console.log("删除医生请求数据：", { doctor_id: doctorId });
            const res = await doctor.deleteDoctor(doctorId);
            if (res.code === 200) {
              console.log("删除医生响应数据：", res);
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.getDoctors();
            } else {
              errorHandler.errorHandler(res, '删除失败');
            }
          } catch (error) {
            errorHandler.errorHandler(error, '删除失败');
          }
        }
      }
    });
  }
})