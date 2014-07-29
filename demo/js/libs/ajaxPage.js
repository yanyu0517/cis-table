/**
 * 翻页控件
 * @author yanyu
 * @param Mustache
 * @param undefined
 * @returns {Function}
 */
function definedAjaxPage(Mustache, undefined){
	var Mustache = Mustache || window.Mustache,
		DEFAULT_SIZE = new Array(10,20,50,100,200),
		DEFAULT_PAGE_SIZE = 20,
		DEFAULT_PAGE_NO = 1,
		DEFAULT_METHOD = 'POST',
		DEFAULT_PARAM = [],
		DEFAULT_RECORDCOUNT = 0,
		DEFAULT_URL = '',
		DEFAULT_OPTIONS = {
			containers: [], //数据类型，选择器表达式或jquery元素或dom元素
			onCallback: null, //翻页回调函数 
			onFail: null, //翻页失败后的回调函数
			onSuccess: null, //在默认的CallBack中，成功后的回调函数
			onError: null, //在默认的CallBack中，失败后的回调函数
			onBegin: null, //发送翻页请求之前的回调函数 
			pageData: {//翻页数据
				method: DEFAULT_METHOD,
				size: DEFAULT_SIZE,
				pageNo: DEFAULT_PAGE_NO,
				pageSize: DEFAULT_PAGE_SIZE,
				param: DEFAULT_PARAM,
				recordCount: DEFAULT_RECORDCOUNT,
				url: DEFAULT_URL
			} 
		},
		PAGE_TEMPLATE = '<span>每页显示<select name="pageSelect">{{#size}}<option value="{{.}}">{{.}}</option>{{/size}}</select>条记录</span>' +
						'<span style="margin: 0px 10px;">共<strong>{{recordCount}}</strong>个&nbsp;</span>' +
						'<span style="margin: 0px 10px;"><a {{^isFirstPage}}href="javascript:void(0);"{{/isFirstPage}} {{#isFirstPage}}style="color:#333333;cursor:text;text-decoration:none" disabled="true"{{/isFirstPage}} name="firstPage">首页</a>&nbsp;<a {{^isFirstPage}}href="javascript:void(0);"{{/isFirstPage}} {{#isFirstPage}}style="color:#333333;cursor:text;text-decoration:none" disabled="true"{{/isFirstPage}} name="previousPage">上一页</a>&nbsp;<a {{^isLastPage}}href="javascript:void(0);"{{/isLastPage}} {{#isLastPage}}style="color:#333333;cursor:text;text-decoration:none" disabled="true"{{/isLastPage}} name="nextPage">下一页</a>&nbsp;<a {{^isLastPage}}href="javascript:void(0);"{{/isLastPage}} {{#isLastPage}}style="color:#333333;cursor:text;text-decoration:none" disabled="true"{{/isLastPage}} name="lastPage">末页</a>&nbsp;</span>' +
						'<span style="margin: 0px 10px;"><strong><span>{{pageNo}}</span></strong>/<strong>{{pageCount}}</strong>页&nbsp;&nbsp;</span>' +
						'<span style="margin: 0px 10px;">跳到第<input size="3" value="1" name="gotoPageNo">页<img name="gotoPage" alt="GO" src="' + SOGOU_BASE_URL + '/res/images/go.gif" style="cursor: pointer; position: relative; top: 5px; left: 5px;"></span>';
	
	var AjaxPage = function(options){
		this.selfOptions = DEFAULT_OPTIONS;
		if(options){
			this.render(options);
		}
	}
	
	/**
	 * 绘制翻页控件
	 */
	AjaxPage.prototype.render = function(options){
		this.selfOptions = $.extend(true, {}, DEFAULT_OPTIONS, options);
		var recordCount = this.selfOptions.pageData.recordCount,
			pageSize = this.selfOptions.pageData.pageSize,
			pageNo = this.selfOptions.pageData.pageNo,
			pageCount= recordCount%pageSize == 0 ? Math.floor(recordCount/pageSize) : Math.floor(recordCount/pageSize) + 1,
			_this = this;
		$.extend(true, this.selfOptions.pageData, {
			pageCount: pageCount,
			isFirstPage: pageNo == 1,
			isLastPage: pageNo == pageCount
		}),
		$.each(this.selfOptions.containers, function(index, value){
			var container = $(value);
			container.empty();
			container.html(Mustache.render(PAGE_TEMPLATE, _this.selfOptions.pageData));
			container.find('select[name=pageSelect]').find('option[value='+_this.selfOptions.pageData.pageSize+']').prop('selected', true);
			//绑定事件
			container.find('select[name=pageSelect]').change(jQuery.proxy(_this.changPageSize, _this));
			if(!_this.selfOptions.pageData.isFirstPage){
				container.find('a[name=firstPage]').click(jQuery.proxy(_this.firstPage, _this));
				container.find('a[name=previousPage]').click(jQuery.proxy(_this.previousPage, _this));
			}
			if(!_this.selfOptions.pageData.isLastPage){
				container.find('a[name=nextPage]').click(jQuery.proxy(_this.nextPage, _this));
				container.find('a[name=lastPage]').click(jQuery.proxy(_this.lastPage, _this));
			}
			container.find('img[name=gotoPage]').click(jQuery.proxy(_this.gotoPage, _this));
			container.find('input[name=gotoPageNo]').bind('keypress', jQuery.proxy(function(event){
				if(AjaxPage._getEvent().keyCode == 13) {
					this.gotoPage(event);
				};
			}, _this)).bind('keyup', jQuery.proxy(function(event){
				var sEvent = AjaxPage._getEvent();
				if ( !((sEvent.keyCode >= 48) && (sEvent.keyCode <= 57)) && !((sEvent.keyCode >= 96) && (sEvent.keyCode <= 105))  && sEvent.keyCode!=8 && sEvent.keyCode!=13){
					if(event && event.currentTarget){
						$(event.currentTarget).val(1);
					}
				}
			
			}, _this));
		});
	}
	
	/**
	 * 请求翻页数据
	 */
	
	AjaxPage.prototype.loadPageData = function(){
		if(this.selfOptions.onBegin && typeof this.selfOptions.onBegin == 'function'){
			this.selfOptions.onBegin(this.selfOptions);
		}
		var method = this.selfOptions.pageData.method,
			url = this.selfOptions.pageData.url,
			param = this.selfOptions.pageData.param,
			pageNo = this.selfOptions.pageData.pageNo,
			pageSize = this.selfOptions.pageData.pageSize;
		if( method == 'GET' ){
			url += "?pageNo=" + pageNo  + "&pageSize=" + pageSize + "&t=" + Math.random();
			if(param && param.length > 0){
				url += param.join("&") == '' ? '':'&'+ param.join("&");
			}
			BzAjax.get(url, jQuery.proxy(this.loadPageDataCallback, this), true, null, this.selfOptions.onFail);
		}else{
			var p = ["pageNo=" + pageNo, "pageSize=" + pageSize, "t=" + Math.random()];
			BzAjax.post(
					url, 
					param.concat(p).join('&'), 
					(this.selfOptions.onCallback && typeof this.selfOptions.onCallback == 'function') ? this.selfOptions.onCallback : jQuery.proxy(this.loadPageDataCallback, this), 
					true, 
					this.selfOptions.onFail);
		}	
	}
	
	/**
	 * 默认读取数据的回调函数
	 */
	AjaxPage.prototype.loadPageDataCallback = function(rs){
		if (rs.responseText) {
			var jsonObj = sogou.json.parse(rs.responseText), data, flag, msg;
			if (jsonObj) {
				flag = jsonObj.flag;
				msg = jsonObj.msg;
				data = jsonObj.data;
				if (flag == "1") {
					alert(msg.length !== 0 ? msg[0] : "系统繁忙，请稍后重试！");
					if(this.selfOptions.onError && typeof this.selfOptions.onError == 'function'){
						this.selfOptions.onError(msg);
					}
				} else {
					if(this.selfOptions.onSuccess && typeof this.selfOptions.onSuccess == 'function'){
						this.selfOptions.onSuccess(jsonObj);
					}
				}
			}
		}
	}
	
	/**
	 * 上翻一页
	 */
	AjaxPage.prototype.previousPage = function(){
		$.extend(true, this.selfOptions.pageData, {
			pageNo: this.selfOptions.pageData.pageNo - 1
		});
		this.loadPageData();
	}
	
	/**
	 * 下翻一页
	 */
	AjaxPage.prototype.nextPage = function(){
		$.extend(true, this.selfOptions.pageData, {
			pageNo: this.selfOptions.pageData.pageNo + 1
		});
		this.loadPageData();
	}
	
	/**
	 * 跳转到第一页
	*/
	AjaxPage.prototype.firstPage = function(){
		$.extend(true, this.selfOptions.pageData, {
			pageNo: 1
		});
		this.loadPageData();
	}
	
	/**
	 * 跳转到最后一页
	*/
	AjaxPage.prototype.lastPage = function(){
		$.extend(true, this.selfOptions.pageData, {
			pageNo: this.selfOptions.pageData.pageCount
		});
		this.loadPageData();
	}
	
	/**
	 * 跳转到某一页
	*/
	AjaxPage.prototype.gotoPage = function(event){
		if(event && event.currentTarget){
			var pageNo = 0;
			if(event.currentTarget.tagName == 'IMG' && event.type == 'click'){//点击go图标，跳转到指定页面
				pageNo = $(event.currentTarget).siblings().filter('input[name=gotoPageNo]').val() - 0;
			} else if(event.currentTarget.tagName == 'INPUT' && event.type == 'keypress'){
				pageNo = $(event.currentTarget).val() - 0;
			}
			if( pageNo <= 0 || pageNo > this.selfOptions.pageData.pageCount){
				alert("输入的页码应该大于0，小于等于最大页数！");
				return;
			}
			$.extend(true, this.selfOptions.pageData, {
				pageNo: pageNo
			});
			this.loadPageData();
		}
	}
	
	/**
	 * 修改每页显示的数量
	 */
	AjaxPage.prototype.changPageSize = function(event){
		if(event && event.currentTarget){
			var pageSize = $(event.currentTarget).val(),
				recordCount = this.selfOptions.pageData.recordCount,
				pageCount= recordCount%pageSize == 0 ? Math.floor(recordCount/pageSize) : Math.floor(recordCount/pageSize) + 1,
				pageNo =  this.selfOptions.pageData.pageNo;
			$.extend(true, this.selfOptions.pageData, {
				pageSize: pageSize,
				pageNo : (pageNo > pageCount) ? 1 : pageNo 
			});
			this.loadPageData();
		}
	}
	
	/**
	 * 得到当前pageSize
	 */
	AjaxPage.prototype.getCurrentPageSize = function(){
		return this.selfOptions.pageData.pageSize;
	}
	
	/**
	 * 得到当前pageNo
	 */
	AjaxPage.prototype.getCurrentPageNo = function(){
		return this.selfOptions.pageData.pageNo;
	}
	
	/**
	 * 得到recordCount
	 */
	AjaxPage.prototype.getRecordCount = function(){
		return this.selfOptions.pageData.recordCount;
	}
	
	/**
	 * 得到size
	 */
	AjaxPage.prototype.getSize = function(){
		return this.selfOptions.pageData.size;
	}
	
	/**
	 * 得到当前pageCount
	 */
	AjaxPage.prototype.getCurrentPageCount = function(){
		return this.selfOptions.pageData.pageCount;
	}
	
	/**
	 * destroy方法
	 */
	AjaxPage.prototype.destroy = function(){
		$.each(this.selfOptions.containers, function(index, value){
			$(value).empty();
		});
		this.selfOptions = DEFAULT_OPTIONS;
	}
	
	/**
	 * 获取事件
	 */
	AjaxPage._getEvent = function(){
		if(document.all)
			return window.event;  
	    func = AjaxPage._getEvent.caller;         
	    while(func!=null){   
	        var arg0=func.arguments[0];
	        if(arg0)
	        {
	          if((arg0.constructor==Event || arg0.constructor ==MouseEvent) || (typeof(arg0)=="object" && arg0.preventDefault && arg0.stopPropagation))
	          {   
	          return arg0;
	          }
	        }
	        func=func.caller;
	    }
	    return null;
	}
	return AjaxPage;
}

if ( typeof define === "function") {
	define("ajaxPage", function(require, exports, module) {
		require('bizc');
        module.exports = definedAjaxPage(require('mustache'));
    });
} else {
	window.AjaxPage = definedAjaxPage(window.Mustache);
}

