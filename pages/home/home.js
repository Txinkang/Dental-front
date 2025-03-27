// index.js
import api from '../../api/request.js';

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    
    // New data properties
    educationList: [],
    doctorList: [],
    selectedDoctor: null,
    showDoctorDetail: false
  },
  
  onLoad() {
    this.fetchEducationData();
    this.fetchDoctorData();
  },
  
  // Fetch education data from API
  fetchEducationData() {
    api.get('/user/getEducation')
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            educationList: res.data
          });
        }
      })
      .catch(err => {
        console.error('Failed to fetch education data:', err);
      });
  },
  
  // Fetch doctor data from API
  fetchDoctorData() {
    api.get('/user/getDoctorInfo')
      .then(res => {
        if (res.code === 200 && res.data) {
          // Process doctor data to add full avatar URL
          const doctors = res.data.map(doctor => ({
            ...doctor,
            fullAvatarUrl: `http://localhost:8080/images/doctorPictures/${doctor.doctorAvatar}`
          }));
          
          this.setData({
            doctorList: doctors
          });
        }
      })
      .catch(err => {
        console.error('Failed to fetch doctor data:', err);
      });
  },
  
  // Show doctor details when clicked
  showDoctorDetails(e) {
    const { doctorid } = e.currentTarget.dataset;
    const doctor = this.data.doctorList.find(doc => doc.doctorId === doctorid);
    
    if (doctor) {
      this.setData({
        selectedDoctor: doctor,
        showDoctorDetail: true
      });
    }
  },
  
  // Close doctor details modal
  closeDoctorDetails() {
    this.setData({
      showDoctorDetail: false
    });
  },

})
