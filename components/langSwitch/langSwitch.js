// components/langSwitch/langSwitch.js
let app = getApp()
Component({
  /**
   * Component properties
   */
  properties: {
 
  },

  /**
   * Component initial data
   */
  data: {
    isChinese: true
  },

  /**
   * Component methods
   */
  methods: {
    switchChinese: function(){
        app.globalData.isChinese = true
        // console.log("current lang is Chinese", app.globalData.isChinese)
        this.setData({
          isChinese: true
        })
        this.triggerEvent('isChinese',true);
    },
    switchEnglish: function(){
        app.globalData.isChinese = false
        // console.log("current lang is Chinese", app.globalData.isChinese)
        this.setData({
          isChinese: false
        })
        this.triggerEvent('isChinese',false);
    }
  },
  ready:function(){
    this.setData({
      isChinese: app.globalData.isChinese
    })
  }
})
