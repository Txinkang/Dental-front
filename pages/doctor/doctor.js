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
      doctorSchedule: '',
      displaySchedule: '',
      introduction: '',
      workingYears: '',
      doctorAvatar: ''
    },
    tempFilePath: '', // 临时文件路径
    weekdays: [
      { label: '周一', value: '1', checked: false },
      { label: '周二', value: '2', checked: false },
      { label: '周三', value: '3', checked: false },
      { label: '周四', value: '4', checked: false },
      { label: '周五', value: '5', checked: false },
      { label: '周六', value: '6', checked: false },
      { label: '周日', value: '7', checked: false }
    ],
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
        
        // 处理数据，确保排班字段存在并格式正确
        const doctors = res.data.data.map(item => {
          // 检查后端返回的排班字段名可能是 doctor_schedule 而不是 doctorSchedule
          let doctorSchedule = item.doctorSchedule || item.doctor_schedule || '';
          
          // 确保doctorSchedule是字符串类型
          if (typeof doctorSchedule !== 'string') {
            doctorSchedule = doctorSchedule ? String(doctorSchedule) : '';
          }
          
          return {
            ...item,
            doctorSchedule: doctorSchedule,
            displaySchedule: this.formatSchedule(doctorSchedule)
          };
        });
        
        this.setData({
          doctors: doctors,
          total: res.data.total_item || 0
        });
      } else {
        errorHandler.errorHandler(res, '获取医生列表失败');
      }
    } catch (error) {
      errorHandler.errorHandler(error, '获取医生列表失败');
    }
  },

  formatSchedule(schedule) {
    if (!schedule) return '暂无排班';
    return '周' + schedule.toString().split('').join('、周');
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
    // 重置复选框状态
    const weekdays = this.data.weekdays.map(day => {
      return {
        ...day,
        checked: false
      };
    });
    
    this.setData({
      showModal: true,
      isEdit: false,
      modalData: {
        doctorId: '',
        doctorName: '',
        doctorSchedule: '',
        introduction: '',
        workingYears: '',
        doctorAvatar: ''
      },
      weekdays: weekdays,
      tempFilePath: ''
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const currentDoctor = e.currentTarget.dataset.doctor;
    
    // 确保排班字段存在并格式正确
    let doctorSchedule = currentDoctor.doctorSchedule || currentDoctor.doctor_schedule || '';
    
    // 确保doctorSchedule是字符串类型
    if (typeof doctorSchedule !== 'string') {
      doctorSchedule = doctorSchedule ? String(doctorSchedule) : '';
    }
    
    // 解析排班字符串，设置复选框状态
    const scheduleArray = doctorSchedule.split('');
    const weekdays = this.data.weekdays.map(day => {
      return {
        ...day,
        checked: scheduleArray.includes(day.value)
      };
    });
    
    this.setData({
      showModal: true,
      isEdit: true,
      modalData: {
        doctorId: currentDoctor.doctorId,
        doctorName: currentDoctor.doctorName,
        doctorSchedule: doctorSchedule,
        introduction: currentDoctor.introduction,
        workingYears: currentDoctor.workingYears,
        doctorAvatar: currentDoctor.doctorAvatar
      },
      weekdays: weekdays,
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

  // 切换排班选择
  toggleSchedule(e) {
    const value = e.currentTarget.dataset.value;
    const weekdays = this.data.weekdays.map(day => {
      if (day.value === value) {
        return {
          ...day,
          checked: !day.checked
        };
      }
      return day;
    });
    
    // 构建排班字符串
    const doctorSchedule = weekdays
      .filter(day => day.checked)
      .map(day => day.value)
      .join('');
    
    this.setData({
      weekdays: weekdays,
      'modalData.doctorSchedule': doctorSchedule
    });
  },

  // 确认添加/修改
  async handleConfirm() {
    const { doctorId, doctorName, introduction, workingYears, doctorSchedule } = this.data.modalData;
    
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

    if (!doctorSchedule) {
      wx.showToast({
        title: '请选择医生排班',
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
        working_years: workingYears,
        doctor_schedule: doctorSchedule
      };
      
      console.log("准备提交的排班数据:", doctorSchedule);
      
      // 如果是编辑模式，添加doctor_id
      if (this.data.isEdit) {
        requestData.doctor_id = doctorId;
      }
      
      // 如果有选择图片，添加文件相关信息
      if (this.data.tempFilePath) {
        requestData.tempFilePath = this.data.tempFilePath;
        requestData.fileFieldName = 'doctor_avatar';
      }
      
      // 使用统一的API方法
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