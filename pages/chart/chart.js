var myCharts = require("../../utils/wxcharts.js")//引入一个绘图的插件
const devicesId = "597304303" 
const api_key = "7se96rf5tKSx1FT9rNYXt6a5gus=" 
Page({
  data: {},

  /**
   * @description 页面下拉刷新事件
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: "正在获取"
    })
    this.getDatapoints().then(datapoints => {
      this.update(datapoints)
      wx.hideLoading()
    }).catch((error) => {
      wx.hideLoading()
      console.error(error)
    })
  },

  /**
   * @description 页面加载生命周期
   */
  onLoad: function () {
    //每隔6s自动获取一次数据进行更新
    const timer = setInterval(() => {
      this.getDatapoints().then(datapoints => {
        this.update(datapoints)
        //console.log(datapoints)
      })
    }, 6000)

    wx.showLoading({
      title: '加载中'
    })

    this.getDatapoints().then((datapoints) => {
      wx.hideLoading()
      this.firstDraw(datapoints)
    }).catch((err) => {
      wx.hideLoading()
      console.error(err)
      clearInterval(timer) //首次渲染发生错误时禁止自动刷新
    })
  },

  /**
   * 向OneNet请求当前设备的数据点
   * @returns Promise
   */
  getDatapoints: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.heclouds.com/devices/${devicesId}/datapoints?datastream_id=flag,temperature,humidity&limit=20`,
        /**
         * 添加HTTP报文的请求头, 
         * 其中api-key为OneNet的api文档要求我们添加的鉴权秘钥
         * Content-Type的作用是标识请求体的格式, 从api文档中我们读到请求体是json格式的
         * 故content-type属性应设置为application/json
         */
        header: {
          'content-type': 'application/json',
          'api-key': api_key
        },
        success: (res) => {
          //console.log(res)
          const status = res.statusCode
          const response = res.data
          if (status !== 200) { // 返回状态码不为200时将Promise置为reject状态
            reject(res.data)
            return ;
          }
          if (response.errno !== 0) { //errno不为零说明可能参数有误, 将Promise置为reject
            reject(response.error)
            return ;
          }

          if (response.data.datastreams.length === 0) {
            reject("当前设备无数据, 请先运行硬件实验")
          }

          //程序可以运行到这里说明请求成功, 将Promise置为resolve状态
          resolve({
            temperature: response.data.datastreams[1].datapoints.reverse(),
            flag: response.data.datastreams[0].datapoints.reverse(),
            humidity: response.data.datastreams[2].datapoints.reverse()
          })
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入获取到的数据点, 函数自动更新图标
   */
  update: function (datapoints) {
    const deviceData = this.convert(datapoints);

    this.lineChart_hum.updateData({
      categories: deviceData.categories,
      series: [{
        name: 'humidity',
        data: deviceData.humidity,
        format: (val, name) => val.toFixed(2)
      }],
    })

    this.lineChart_flag.updateData({
      categories: deviceData.categories,
      series: [{
        name: 'flag',
        data: deviceData.flag,
        format: (val, name) => val.toFixed(0)
      }],
    })

    this.lineChart_tempe.updateData({
      categories: deviceData.categories,
      series: [{
        name: 'tempe',
        data: deviceData.tempe,
        format: (val, name) => val.toFixed(2)
      }],
    })

  },

  /**
   * 
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入数据点, 返回使用于图表的数据格式
   */
  convert: function (datapoints) {
    var categories = [];
    var humidity = [];
    var flag = [];
    var tempe = [];

    var length = datapoints.humidity.length
    for (var i = 0; i < length; i++) {
      categories.push(datapoints.humidity[i].at.slice(5, 19));
      humidity.push(datapoints.humidity[i].value);
      flag.push(datapoints.flag[i].value);
      tempe.push(datapoints.temperature[i].value);
    }
    return {
      categories: categories,
      humidity: humidity,
      flag: flag,
      tempe: tempe
    }
  },

  /**
   * 
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入数据点, 函数将进行图表的初始化渲染
   */
  firstDraw: function (datapoints) {

    //得到屏幕宽度
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var deviceData = this.convert(datapoints);

    //新建湿度图表
    this.lineChart_hum = new myCharts({
      canvasId: 'humidity',
      type: 'line',
      categories: deviceData.categories,
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: 'humidity',
        data: deviceData.humidity,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'humidity (%)',
        format: function (val) {
          return val.toFixed(2);
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
    // 新建光照强度图表
    this.lineChart_flag = new myCharts({
      canvasId: 'flag',
      type: 'line',
      categories: deviceData.categories,
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: 'flag',
        data: deviceData.flag,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'flag (lux)',
        format: function (val) {
          return val.toFixed(2);
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });

    //新建温度图表
    this.lineChart_tempe = new myCharts({
      canvasId: 'tempe',
      type: 'line',
      categories: deviceData.categories,
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: 'temperature',
        data: deviceData.tempe,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'temperature (摄氏度)',
        format: function (val) {
          return val.toFixed(2);
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
})

