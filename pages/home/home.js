// pages/home/home.js
let app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picker_arr:['overall(desc)','difficulty(asc)','enjoyment(desc)','workload(asc)', 'enrichment(desc)','alphanumeric'],
    picker_index: 0,
    course_cards_info:[],
    prof_cards_info:[],
    activeTab: 0,
    searchCourseCode: "",
    searchProfessorName: "",
    hasPersonalInfo: false,
    forProf: true,
    normalTextForIcon: ['If you haven’t typed anything into the search bar, only the classes that currently have reviews will show up.'],
    boldTextForIcon: "Can’t find a class?",
    italicTextForIcon: "So try typing the name of your course and be the first one to give a review!",
    wrapperStyleForIcon: "width: 22rpx; height: 22rpx;",
    isChinese: true,
  },
  changeLang: function(event){
    console.log(event.detail);
    if(event.detail){
      this.setData({isChinese:true});
    }else{
      this.setData({isChinese:false});
    }
  },
  queryParamsCourses: { 
    currentPage: 1,
    target: "recommended_courses",
    courseCode: "",
    sort: 0
    // corresponding to picker_index
  },
  queryParamsProfessors: { 
    currentPage: 1,
    target: "default_professors",
    professorName: "",
    forProf: 1,
  },
  totalPageCourses: 99,
  totalPageProfessors: 99,
  maxAllowPage: 10,
  tapSwitch(){
    const forProf = !this.data.forProf
    this.queryParamsProfessors.forProf = forProf
    this.setData({
      forProf,
      prof_cards_info: []
    })
    this.searchProfessorCloud()
  },
  onPickerChange(e){
    console.log(e);
    const {value} = e.detail
    this.setData({
      picker_index: value
    })
    this.queryParamsCourses.sort = parseInt(value)
    console.log(this.queryParamsCourses);
    this.reloadCourses()
  },
  onTabTapped(e){
    console.log(e);
    const {index} = e.currentTarget.dataset
    console.log(index);
    this.setData({activeTab: index})
  },
  
  performQuery(type){
    if(type === 0) console.log(this.queryParamsCourses)
    if(type === 1) console.log(this.queryParamsProfessors)
    return wx.cloud.callFunction({
      name: "searchWithName",
      data: type===0?this.queryParamsCourses:this.queryParamsProfessors
    })
  },
  searchCourseCloud(){
    wx.showLoading({
      title: 'loading',
    })
    this.performQuery(0).then((res)=>{
        console.log(res);
        const { data, totalPage }= res.result
        if(!data){
          this.setData({course_cards_info: []})
        }else{
          this.totalPageCourses = totalPage
          console.log(this.totalPageCourses);
          const course_cards_info = data.map(v=>{return {_id: v._id, courseCode: v.courseCode, courseName: v.courseName}})
          this.setData({course_cards_info: [...this.data.course_cards_info, ...course_cards_info]})
        }
        wx.hideLoading()
      })
      .catch((err)=>{
        console.log(err);
        wx.hideLoading()
        wx.showToast({
          title: 'Error, try again later',
          icon: 'none',
          duration: 1500,
          mask: true
        });
          
      })
  },
  searchProfessorCloud(){
    //only set the prof_cards_info
    wx.showLoading({
      title: 'loading',
    })
    this.performQuery(1).then((res)=>{
      console.log(res);
      const { data, totalPage }= res.result
      if(!data){
        this.setData({course_cards_info: []})
      }else{
        this.totalPageProfessors = totalPage
        const prof_cards_info = data.map(v=>{return {_id: v._id, professorName: v.professorName}})
        this.setData({prof_cards_info: [...this.data.prof_cards_info, ...prof_cards_info]})
        wx.hideLoading()
      }
    })
    .catch((err)=>{
      console.log(err);
      wx.hideLoading()
      wx.showToast({
        title: 'Error, try again later',
        icon: 'none',
        duration: 1500,
        mask: true
      });
    })

  },
  SearchCourseTimerID: -1,
  SearchProfessorTimerID: -1,
  onSearchProfessorInput(e){
    clearTimeout(this.SearchProfessorTimerID)
    const searchProfessorName = e.detail.value
    this.setData({searchProfessorName: searchProfessorName})
    this.queryParamsProfessors.professorName = searchProfessorName
    if(searchProfessorName != "") 
      this.queryParamsProfessors.target="search_professors"
    else 
      this.queryParamsProfessors.target="all_professors"
    this.SearchProfessorTimerID = setTimeout(this.reloadProfessors,1000)
  },
  onSearchCourseInput(e){
    clearTimeout(this.SearchCourseTimerID)
    const searchCourseCode = e.detail.value
    this.setData({searchCourseCode: searchCourseCode})
    this.queryParamsCourses.courseCode = searchCourseCode
    if(searchCourseCode != "") 
      this.queryParamsCourses.target="search_courses"
    else 
      this.queryParamsCourses.target="recommended_courses"
    this.SearchCourseTimerID = setTimeout(this.reloadCourses,1000)
  },
  reloadCourses(){
    this.setData({course_cards_info: []})
    this.queryParamsCourses.currentPage = 1
    this.searchCourseCloud()
  },
  reloadProfessors(){
    this.setData({prof_cards_info: []})
    this.queryParamsProfessors.currentPage = 1
    this.searchProfessorCloud()
  },

  onTapSearchCourse(){
    this.reloadCourses()
  },
  onTapSearchProfessor(){
    this.reloadProfessors()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("reach bottom");
    
    if(this.data.activeTab === 0){
      if(this.totalPageCourses > this.queryParamsCourses.currentPage && this.queryParamsCourses.currentPage < this.maxAllowPage){
        this.queryParamsCourses.currentPage++
        console.log(this.queryParamsCourses);
        this.searchCourseCloud()
      }else{
        wx.showToast({
          title: 'No more items',
          icon: 'none',
        });
      }
    }else{
      if(this.totalPageProfessors > this.queryParamsProfessors.currentPage && this.queryParamsProfessors.currentPage < this.maxAllowPage){
        this.queryParamsProfessors.currentPage++
        console.log(this.queryParamsProfessors);
        this.searchProfessorCloud()
      }else{
        wx.showToast({
          title: 'No more items',
          icon: 'none',
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    }); 
    this.setData({
      isChinese: app.globalData.isChinese
    })
    if(!app.globalData.hasPersonalInfo){
      wx.redirectTo({
        url: '/pages/login/login',
      });
    }else{
      this.loadInitialInfo();
    }
  },

  
  loadInitialInfo() { 
    this.setData({
      course_cards_info: [],
      prof_cards_info: [],
      searchCourseCode: [],
      searchProfessorName: [],
      picker_index: 0
    })
    this.queryParamsCourses = { 
      currentPage: 1,
      target: "recommended_courses",
      courseCode: "",
      sort: 0
    }
    this.queryParamsProfessors = { 
      currentPage: 1,
      target: "default_professors",
      professorName: "",
      forProf: true
    }
    this.searchProfessorCloud()
    this.searchCourseCloud()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadInitialInfo()
  }
})