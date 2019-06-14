//index.js
//获取应用实例
let wxCharts = require("../charts/wxcharts.js");
const app = getApp()
const ERROR = 'Fetch data error, please refresh and try again';

Page({
  data: {
    initRmb: 100,
    rmb:'',
    initDkk: 100,
    dkk:'',
    exchange:0,
    chart: {},
    error:''
  },
  onLoad: function () {
    this.getExchange();
    this.getChartData();
  },

  watchRmbInput: function (e) {
    let val = e.detail.value;
    if(val) {
      this.setData({ dkk: (val * this.data.exchange).toFixed(3) });
    }else {
      this.setData({ dkk: '' });
    }
  },

  watchDkkInput: function (e) {
    let val = e.detail.value;
    if (val) {
      this.setData({ rmb: (val / this.data.exchange).toFixed(3) });
    } else {
      this.setData({ rmb: '' });
    }
  },

  getExchange: function() {
    let self = this;
    wx.request({
      url: 'https://free.currconv.com/api/v7/convert',
      data:{
        q:'CNY_DKK',
        compact: 'ultra',
        apiKey: 'bb92156e50bcc159bf9f'
      },
      success: function(res) {
        self.setData({exchange:res.data.CNY_DKK});
        let rate = self.data.exchange;
        let rmb = self.data.initRmb;
        if (rate) {
          self.setData({initDkk:(rmb*rate).toFixed(3)});
        }
      },
      fail: function(e) {
        console.log(e);
        self.setData({ error: ERROR });
        }
    });
  },
  getChartData: function() {
    let self = this;
    let d = new Date();
    let sevenDaysAgo = d - 1000 * 60 * 60 * 24 * 7;
    wx.request({
      url: 'https://free.currconv.com/api/v7/convert',
      data: {
        q: 'CNY_DKK',
        compact: 'ultra',
        apiKey: 'bb92156e50bcc159bf9f',
        date: new Date(sevenDaysAgo).toISOString().slice(0, 10),
        endDate: d.toISOString().slice(0, 10)
      },
      success: function (res) {
        self.setData({ chart: self.convert(res.data.CNY_DKK) });
        self.baseline();
      },
      fail: function (e) {
        console.log(e);
        self.setData({ error: ERROR });
      }
    });
  },

  convert: function(data) {
    let res = {
      categories: [],
      data: []
    };
    for(let key in data) {
      res.categories.push(key.slice(5, 10));
      res.data.push((100 * data[key]).toFixed(3));
    }
    return res;
  },

  baseline: function() {
    let windowWidth = 320;
    try {
      let res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    let wxLiner = new wxCharts({
      canvasId: 'baseline',
      type: 'line',
      animation: true,
      // background: '#f5f5f5',
      categories: this.data.chart.categories,
      series: [{
        name: '100 CNY to DKK',
        data: this.data.chart.data
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        min: 95
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  }
})
