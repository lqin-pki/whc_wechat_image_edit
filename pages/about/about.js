/*
 * @Author: whc
 * @Date: 2019-12-13 17:46:59
 * @LastEditTime : 2020-01-05 15:14:33
 */
// pages/about/about.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titles: [
      '为 #ImpactDayPKI 特制',
      '24小时快速制作，经不起测试 :(',
      '基于开源项目(whc_wechat_image_edit)',
      '源代码开源协议: Apache-2.0 License',
      '原作者：吴海超',
      '原作者微信：whc66888',
      '原作者个人网站：http://www.wuhaichao.com',
      '原小程序版本：v1.0.3',
      '修订版本: v0.1.3',
      '修改人: Leon Qin, PerkinElmer Informatics',
      'Innovating for a healthier world!'
    ],
  },

  clickItem: function(e) {
    const index = e.currentTarget.dataset.index;
    switch (index) {
      default:
        // Do nothing for now.
      break;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '关于',
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
    return {
      title: '生成你的影响力头像',
      desc: '快速生成你的影响力头像，传递自己的健康影响力，For a healthier world!',
      path: '/pages/index/index',
      imageUrl: app.globalData.userInfo.highAvatarUrl,
    };
  }
})