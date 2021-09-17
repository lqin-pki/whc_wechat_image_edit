/*
 * @Author: whc
 * @Date: 2019-12-13 17:46:59
 * @LastEditTime : 2020-01-05 15:14:33
 */
//index.js
//获取应用实例
const app = getApp()
import ImageSynthesis from '../../utils/image-synthesis.js';
import Notification from '../../utils/react-whc-notification.js';

const resourceBaseUrl = 'https://7765-wechatapp-static-res-3bx7168bd89-1307460930.tcb.qcloud.la/';

function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: () => {
        resolve();
      },
      fail: err => {
        reject(err);
      }
    });
  })
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    wx.getUserProfile({
      desc: '需要获得您的头像以对其修饰。',
      success: profileRes => {
        resolve(profileRes.userInfo)
      },
      fail: err => {
        reject(err);
      }
    });
  })
}

function authorize() {
  const loginPromise = login();
  const getUserInfoPromise = getUserInfo();
  return Promise.all([loginPromise, getUserInfoPromise]);
}

function retrieveImages() {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: resourceBaseUrl + "images.json",
      data: {
        noncestr: Date.now()
      },
      success: function (result) {
        resolve(result.data);
      },
      fail: function (err) {
        console.error(err)
      }
    })
  });
}

function downloadAsTempFile(url) {
  return new Promise(function (resolve, reject) {
    wx.downloadFile({
      url,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (res) => {
        reject(res);
      },
    });
  });
}

Page({
  data: {
    didShow: false,
    isTouchScale: false,
    makePosterImage: false,
    festivalSrc: '',
    oldx: 0,
    oldy: 0,
    startx: 0,
    starty: 0,
    initRotate: 0,
    rotate: 0,
    loading: false,
    callback: null,
    baseImagePath: null,
    overlayImagePath: null,
    currentFestival: null,
    userInfo: {},
    olduserInfo: {},
    hasScale: false,
    hasRotate: false,
    hasUserInfo: false,
    isOpenSetting: false,
    festivalCenterX: 0,
    festivalCenterY: 0,
    festivalLeft: 0,
    festivalTop: 0,
    offsetx: 0,
    offsety: 0,
    festivalSize: 80,
    festivalIndex: 0,
    festivalImageIndex: 0,
    festivalNames: [],
    icons: {},
  },
  getUserProfile: function () {
    const self = this;
    authorize().then(function (res) {
      const userInfo = res[1];
      console.info(JSON.stringify(userInfo));
      app.globalData.userInfo = userInfo;
      self._saveUserInfo(userInfo);
    }).catch((err) => {
      console.error(err);
    });
  },
  _reset: function (e) {
    const {
      olduserInfo
    } = this.data;
    this.setData({
      isTouchScale: false,
      hasScale: false,
      hasRotate: false,
      festivalCenterX: 0,
      festivalCenterY: 0,
      festivalLeft: 0,
      festivalTop: 0,
      offsetx: 0,
      offsety: 0,
      festivalSize: 80,
      oldx: 0,
      oldy: 0,
      startx: 0,
      starty: 0,
      initRotate: 0,
      rotate: 0,
      baseImagePath: null,
      overlayImagePath: null,
      userInfo: {
        ...olduserInfo
      },
    });
  },

  _saveUserInfo: function (userInfo = null) {
    if (userInfo == void 0) {
      wx.showToast({
        title: '获取微信账号信息失败，请重新授权！',
        icon: 'none',
      });
      return;
    }
    if (userInfo.avatarUrl != void 0) {
      const index = userInfo.avatarUrl.lastIndexOf('/132');
      if (index != -1) {
        userInfo.highAvatarUrl = userInfo.avatarUrl.substring(0, index) + '/0';
      } else {
        userInfo.highAvatarUrl = userInfo.avatarUrl;
      }
    }
    app.globalData.userInfo = userInfo;
    console.log(userInfo);
    const {
      icons,
      currentFestival,
      festivalIndex,
    } = this.data;
    console.info(`currentFestival: ${currentFestival}`)
    this.setData({
      olduserInfo: {
        ...userInfo
      },
      userInfo: userInfo,
      hasUserInfo: userInfo != null,
      festivalSrc: icons[currentFestival][festivalIndex].fullImageUrl,
    });
    this._showFestivalSwitchPrompt();
  },

  onShareAppMessage: function (e) {
    return {
      title: '生成你的影响力头像',
      desc: '快速生成你的影响力头像，传递自己的健康影响力，For a healthier world!',
      path: '/pages/index/index',
    };
  },

  _showFestivalSwitchPrompt: function () {
    const {
      userInfo = {},
        didShow,
    } = this.data;
    if (!didShow && userInfo.highAvatarUrl != void 0) {
      setTimeout(() => {
        this.data.didShow = true;
        /*
        wx.showToast({
          title: '可以切换不同主题',
          icon: 'none',
        });
        */
      }, 1000);
    }
  },

  onShow: function (e) {
    this._showFestivalSwitchPrompt();
  },

  onLoad: function () {
    const {
      festivalNames,
      icons,
    } = this.data;
    const self = this;
    retrieveImages().then(allImagesData => {
      allImagesData.forEach(catagorizedImages => {
        festivalNames.push(catagorizedImages.catagory)
        icons[catagorizedImages.catagory] = [];
        catagorizedImages.images.forEach((image, index) => {
          const thumbnailImageUrl = resourceBaseUrl + image.name + '_t.png';
          const fullImageUrl = resourceBaseUrl + image.name + '_f.png';
          icons[catagorizedImages.catagory].push({
            thumbnailImageUrl,
            fullImageUrl,
            isselected: index == 0,
          });
        })
      });
      console.info(JSON.stringify(icons))
      self.setData({
        icons,
        festivalNames,
        currentFestival: allImagesData[0].catagory
      });
      if (app.globalData.userInfo) {
        console.info('User Info available')
        self._saveUserInfo(app.globalData.userInfo);
      } else {
        console.info('Get user profile on load')
      }
    });
  },

  /*
  getUserInfo: function(e) {
    const {
      userInfo = null
    } = e.detail;
    if (userInfo != null) {
      app.globalData.userInfo = userInfo;
      this._saveUserInfo(userInfo);
    } else {
      wx.showToast({
        title: e.detail.errMsg,
        icon: 'none'
      });
    }
  },
  */

  onChangePickerFestival: function (e) {
    const {
      icons,
      festivalNames,
      currentFestival,
    } = this.data;
    const index = e.detail.value;
    const name = festivalNames[index];
    icons[currentFestival] = icons[currentFestival].map((v, i) => {
      v.isselected = i == 0;
      return v;
    });
    this.setData({
      festivalIndex: index,
      festivalImageIndex: 0,
      currentFestival: name,
      festivalSrc: icons[name][0].fullImageUrl,
      icons,
    });
  },

  clickCancelOpenSetting: function (e) {
    this.setData({
      isOpenSetting: false,
      callback: null,
    });
  },

  handlerOpenSetting: function (e) {
    if (e.detail.authSetting['scope.writePhotosAlbum'] == true) {
      const {
        callback = null,
      } = this.data;
      callback && callback(true);
      this.setData({
        isOpenSetting: false,
        callback: null,
      });
    }
  },

  clickChangeAvatarImage: function (e) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const {
          userInfo
        } = this.data;
        if (res.tempFilePaths.length > 0) {
          Notification.addObserver(this, 'cutimagenotify', (img) => {
            if (img != void 0) {
              userInfo.highAvatarUrl = img;
              userInfo.avatarUrl = img;
              this.setData({
                baseImagePath: img,
                userInfo,
              });
            } else {
              wx.showToast({
                title: '请选择高清图像尺寸至少200x200以上！',
                icon: 'none',
              });
            }
          });
          wx.navigateTo({
            url: `../edit/edit?imageurl=${res.tempFilePaths[0]}`,
          });
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          });
        }
      }
    });
  },

  _checkPhotosAlbum: function (callback = null) {
    const self = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              callback && callback(true);
            },
            fail() {
              console.log("2-授权《保存图片》权限失败");
              self.setData({
                callback,
                isOpenSetting: true,
              });
            }
          })
        } else {
          console.log("1-已经授权《保存图片》权限");
          callback && callback(true);
        }
      },
      fail(res) {
        console.log("getSetting: success");
        console.log(res);
      }
    });
  },

  clickMakeResetImage: function (e) {
    this._reset();
  },

  clickMakePoster: function (e) {
    this.data.makePosterImage = true;
    this.clickMakeNewImage(e);
  },

  clickFestivalImage: function (e) {
    if (this.data.loading) {
      return;
    }
    const index = e.currentTarget.dataset.index;
    const {
      icons,
      currentFestival
    } = this.data;
    icons[currentFestival] = icons[currentFestival].map((v, i) => {
      v.isselected = i == index;
      return v;
    });
    this.setData({
      icons,
      festivalImageIndex: index,
      festivalSrc: icons[currentFestival][index].fullImageUrl,
    });
  },

  clickMakeNewImage: function (e) {
    if (this.data.loading) {
      return;
    }
    const self = this;
    this._checkPhotosAlbum((isok) => {
      if (isok == false) {
        self.data.makePosterImage = false;
        return;
      }
      self.setData({
        loading: true,
      });
      wx.showLoading({
        title: '生成中...',
      });

      if (self.data.baseImagePath == null || self.data.overlayImagePath == null) {
        const getBaseImagePromise = self.data.baseImagePath == null ?
          downloadAsTempFile(self.data.userInfo.highAvatarUrl) : Promise.resolve(self.data.baseImagePath);
        const getOverlayPromise = self.data.overlayImagePath == null ?
          downloadAsTempFile(self.data.festivalSrc) : Promise.resolve(self.data.overlayImagePath);
        Promise.all([getBaseImagePromise, getOverlayPromise]).then(res => {
          self.data.baseImagePath = res[0];
          self.data.overlayImagePath = res[1];
          self._saveImage();
        }).catch((err) => {
          console.error(err);
          self.data.loading = false;
          wx.showToast({
            title: '获取图像失败.',
            icon: 'none'
          });
        })
      } else {
        self._saveImage();
      }
    });
  },

  _saveImage: function () {
    const {
      makePosterImage,
      festivalLeft,
      festivalTop,
      festivalSize,
      festivalSrc = '',
      rotate,
      baseImagePath = '',
      overlayImagePath = '',
      festivalIndex,
    } = this.data;
    if (baseImagePath == '' || overlayImagePath == '') {
      wx.showToast({
        title: '程序异常，请联系作者',
        icon: 'none',
      });
      return;
    }
    const imageSynthesis = new ImageSynthesis(this, 'festivalCanvas', 700, 700);
    imageSynthesis.addImage({
      path: baseImagePath,
      x: 0,
      y: 0,
      w: 700,
      h: 700
    });

    imageSynthesis.addImage({
      path: overlayImagePath,
      x: 0,
      y: 0,
      w: 700,
      h: 700,
      deg: rotate
    });
    imageSynthesis.startCompound((img) => {
      if (img != void 0) {
        wx.hideLoading();
        if (makePosterImage) {
          this.data.makePosterImage = false;
          this.data.loading = false;
          wx.setStorageSync('imageurl', img);
          wx.navigateTo({
            url: `../poster/poster?type=${festivalIndex}`
          });
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: img,
            success: (res) => {
              this.data.loading = false;
              wx.showToast({
                title: '已保存至系统相册:)',
              });
            },
            fail: (res) => {
              this.data.loading = false;
              wx.showToast({
                title: '保存失败',
                icon: 'none',
              });
            }
          });
        }
      }
    });
  },

  _getCurrentPointXiangxian: function (x = 0, y = 0) {
    const {
      festivalCenterX = 0,
        festivalCenterY = 0,
    } = this.data;
    if (x >= festivalCenterX && y <= festivalCenterY) {
      return 1;
    }
    if (x <= festivalCenterX && y <= festivalCenterY) {
      return 2;
    }
    if (x <= festivalCenterX && y >= festivalCenterY) {
      return 3;
    }
    if (x >= festivalCenterX && y >= festivalCenterY) {
      return 4;
    }
  },

  _switchPoint: function (x = 0, y = 0) {
    const xx = this._getCurrentPointXiangxian(x, y);
    const {
      festivalCenterX,
      festivalCenterY,
    } = this.data;
    switch (xx) {
      case 1:
        return {
          x: x - festivalCenterX,
            y: festivalCenterY - y,
        };
      case 2:
        return {
          x: x - festivalCenterX,
            y: festivalCenterY - y,
        };
      case 3:
        return {
          x: x - festivalCenterX,
            y: festivalCenterY - y,
        };
      case 4:
        return {
          x: x - festivalCenterX,
            y: festivalCenterY - y,
        };
      default:
        return null;
    }
  },

  _handlefestivalImageMoveScale: function (e) {
    if (e.touches.length > 0) {
      const {
        oldx = 0,
          oldy = 0,
          festivalCenterX = 0,
          festivalCenterY = 0,
          startx = 0,
          starty = 0,
          initRotate = 0,
          hasRotate,
          hasScale,
          offsety,
          offsetx,
          rotate,
      } = this.data;
      const x = e.touches[0].pageX;
      const y = e.touches[0].pageY;
      if (hasRotate || hasScale) {
        const a = Math.sqrt(Math.pow(Math.abs(x - festivalCenterX), 2) + Math.pow(Math.abs(y - festivalCenterY), 2));
        const b = Math.sqrt(Math.pow(Math.abs(oldx - festivalCenterX), 2) + Math.pow(Math.abs(oldy - festivalCenterY), 2));
        const c = Math.sqrt(Math.pow(Math.abs(oldx - x), 2) + Math.pow(Math.abs(oldy - y), 2));
        const cosa = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);
        const ra = Math.abs(Math.acos(cosa) / (Math.PI / 180));
        const a1 = this._switchPoint(oldx, oldy);
        const b1 = this._switchPoint(x, y);
        const sunshi = a1.x * b1.y - a1.y * b1.x;
        const newsize = Math.sqrt(Math.pow(a * 2, 2) / 2);
        if (sunshi != 0) {
          const rotateSshi = sunshi < 0;
          this.setData({
            festivalTop: festivalCenterY - newsize / 2.0,
            festivalLeft: festivalCenterX - newsize / 2.0,
            festivalSize: newsize,
            rotate: rotate + (rotateSshi ? ra : -ra),
            oldx: x,
            oldy: y,
          });
        } else {
          this.setData({
            festivalTop: festivalCenterY - newsize / 2.0,
            festivalLeft: festivalCenterX - newsize / 2.0,
            festivalSize: newsize,
            oldx: x,
            oldy: y,
          });
        }
      } else {
        this.setData({
          festivalTop: y - offsety,
          festivalLeft: x - offsetx,
          oldx: x,
          oldy: y,
        });
      }
    }
  },

  festivalImageTouchStart: function (e) {
    if (this.data.isTouchScale) {
      return;
    }
    const {
      festivalLeft,
      festivalTop,
      festivalSize,
    } = this.data;
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    this.data.startx = x;
    this.data.starty = y;
    this.data.oldx = x;
    this.data.oldy = y;
    this.data.festivalCenterX = this.data.festivalLeft + this.data.festivalSize / 2.0;
    this.data.festivalCenterY = this.data.festivalTop + this.data.festivalSize / 2.0;
    this.data.hasRotate = false;
    this.data.hasScale = false;
    this.data.offsetx = x - this.data.festivalLeft;
    this.data.offsety = y - this.data.festivalTop;
  },

  festivalImageTouchMove: function (e) {
    if (this.data.isTouchScale) {
      return;
    }
    this._handlefestivalImageMoveScale(e);
  },

  festivalImageTouchEnd: function (e) {
    if (this.data.isTouchScale) {
      return;
    }
    this._handlefestivalImageMoveScale(e);
  },

  festivalImageRaoteTouchStart: function (e) {
    this.data.isTouchScale = true;
    this.data.initRotate = this.data.rotate;
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    this.data.startx = x;
    this.data.starty = y;
    this.data.oldx = x;
    this.data.oldy = y;
    this.data.festivalCenterX = this.data.festivalLeft + this.data.festivalSize / 2.0;
    this.data.festivalCenterY = this.data.festivalTop + this.data.festivalSize / 2.0;
    this.data.hasRotate = true;
    this.data.hasScale = true;
    this.data.offsetx = x - this.data.festivalLeft;
    this.data.offsety = y - this.data.festivalTop;
  },

  festivalImageRaoteTouchMove: function (e) {
    this._handlefestivalImageMoveScale(e);
  },

  festivalImageRaoteTouchEnd: function (e) {
    this._handlefestivalImageMoveScale(e);
    this.data.isTouchScale = false;
  },
})