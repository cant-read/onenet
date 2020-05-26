// pages/index/index.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    temperature:null,
    humidity:null,
    flag:null,
    popupFlag:null,
  },
  GetOnenetData:function(){
    var that = this;
    var state = null;//传递设备状态
    var showflag=null;//传递是否弹出警告的变量
      wx.request({
        url: "http://api.heclouds.com/devices/597304303/datastreams",
        data: {
          x: '',
          y: ''
        },
        header: {
          'api-key':'7se96rf5tKSx1FT9rNYXt6a5gus='
        },
        method: 'get',
        dataType: 'json',
        success(res) {
          switch (Number(res.data.data[0].current_value).toFixed(0)) {
            case '11':
              state = "正常";
              showflag = 4;
              break;
            case '12':
              state="湿度较低请注意";
              showflag = 3;
              break;
            case '21':
              state="温度较高请注意";
              showflag = 2;
              break;
            case '22' :
              state="火警！！!";
              showflag = 1;
              break;
            default:
              break;
          }
          that.setData({
            popupFlag: showflag,
            flag : state,
            temperature: res.data.data[1].current_value,
            humidity :Number(res.data.data[2].current_value).toFixed(0)
          })
        }
      });
  },
  navigate: function() {
    wx.navigateTo({
        url: '../chart/chart',
    })
},
showPopup(){
  var that = this;
  if(that.data.popupFlag==1)
 { 
   that.popup.showPopup();
   console.log('jinbao');
   setTimeout(function(){
    that.closePopup();
  },5999)
}
  if(that.data.popupFlag==2)
  {
  that.popup1.showPopup();
  console.log('wendu')
  setTimeout(function(){
    that.closePopup1();
  },1500)
}
  if(that.data.popupFlag==3)
  {
  that.popup2.showPopup();
  console.log('shidu')
  setTimeout(function(){
    that.closePopup2();
  },1500)
}
},
closePopup(){
  var that = this
  that.popup.hidePopup();
},
closePopup1(){
  var that = this
  that.popup1.hidePopup();
},
closePopup2(){
  var that = this
  that.popup2.hidePopup();
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      setInterval(() => {
          this.GetOnenetData();
      }, 1000);
      setInterval(() => {
        this.showPopup();
      }, 6000);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.GetOnenetData();
    this.popup = this.selectComponent("#popup");
    this.popup1=this.selectComponent("#popup1");
    this.popup2=this.selectComponent("#popup2");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
