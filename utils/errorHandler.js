export default {
  errorHandler(error,title) {
    console.error(error);
    wx.showToast({
      title: title || '请求失败',
      icon: 'none'
    });
  },
  errorHandlerWithUrl(error,url,title) {
    console.log("请求失败：",url,error);
    wx.showToast({
      title: title || '请求失败',
      icon: 'none'
    });
  }
}


