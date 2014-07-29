/**
 * cis table
 * @author yanyu
 * 
 */
 function defineTable(Backbone, AjaxPage, undefined){

 	var SUBREGEX = /\{\s*([^|}]+?)\s*(?:\|([^}]*))?\s*\}/g,

 		INPUT_TYPE = 'input',

 		DEFAULT_TD_ATTRS = 'bgcolor="#FFFFFF" align="center" word-wrap="break-word"',
 		DEFAULT_TD_STYLE = 'overflow: hidden; padding-left: 5px; white-space: nowrap;',

 		DEFAULT_TR_ATTRS = '',
 		DEFAULT_TR_STYLE = '',

 		DEFAULT_TABLE_ATTRS = '',
 		DEFAULT_TABLE_STYLE = '',

 		DEFAULT_HEADER_TH_ATTRS = 'bgcolor="#EEEEEE" align="center"',
 		DEFAULT_HEADER_TH_STYLE = '',

		Lang = Lang || {}

	Lang.isUndefined = function(o) {
		return typeof o === 'undefined';
	};

	Lang.sub = function(s, o) {
		return s.replace ? s.replace(SUBREGEX, function (match, key) {
		return Lang.isUndefined(o[key]) ? match : o[key];
		}) : s;
	};

	Lang.escapeHTML = function(a){
		a = "" + a;
		return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
				.replace(/>/g, "&gt;");
	};

	Lang.extend = function(r, s){
		if (!s || !r) {
			return;
		}

		function F(){}
		F.prototype = s.prototype;

		r.prototype = new F();
		r.prototype.constructor = r;
		r.superclass = s.prototype
	}

 	var TableView = Backbone.View.extend({
 		TABLE_TEMPLATE  : '<table width="{width}" cellspacing="1" {attrs} class="{className}" style="{style}"></table>',
 		/*
 		表格列头初始化
 		*/
 		initialize: function(){
 			this.configs = this.options.table || {};
 			var options = this.options;

 			this.headerView = new TableHeaderView(options);

 			this.$el = this.configs.container;

 			this.bodyModel = new TableBodyModel({url: options.url}, options);
 			
 			this.bodyView = new TableBodyView($.extend(true, {model: this.bodyModel}, options));

 			this.render();
 		},
 		render: function () {
 			var config;

	        if (!this.tableNode) {
	            this.tableNode = this._createTable();
	        }

	        config = {table: this.tableNode};
	        this.renderHeader(config);
	        this.renderBody($.extend(true, {}, config, {columns: this.options.thead.columns}));

	        this.$el.empty().append(this.tableNode);
    	},
    	_createTable: function () {
    		return $(Lang.sub(this.TABLE_TEMPLATE, {
    			width: this.configs.width || '100%',
    			attrs: this.configs.attrs || '',
    			style: this.configs.style || DEFAULT_TABLE_STYLE,
	            className: this.getClassName('cis-table')
	        })).empty();
    	},
    	getClassName: function(){
			var host = this.options.host;

	        if (host && host.getClassName) {
	            return host.getClassName.apply(host, arguments);
	        } else {
	            return arguments[0];
	        }
    	},
    	renderHeader: function(config){
    		this.headerView.render(config); 
    	},
    	renderBody: function(config){
    		this.bodyView.render(config);
    	},
    	queryTable: function(params, keepParams){
    		var prevP = this.bodyModel.get('params'),
    			p = {};
    		if(keepParams){
    			if(keepParams.length){
    				for(o in prevP){
    					($.inArray(o, keepParams) > -1) && (p[o] = prevP[o]); 
    				}
    				$.extend(true, p, params);
    			} else {
    				$.extend(true, p, prevP, params);
    			}
    		} else {
    			p = params;
    		}
    		this.bodyModel.set('params', p);
    		this.bodyModel.fetch();
    	},
    	destroy: function(){
    		this.undelegateEvents();
 			this.$el.empty();
 			this.bodyView.destroy();
 			this.headerView.destroy();
    	}
 	});

	var TableHeaderView = Backbone.View.extend({
		CELL_TEMPLATE: '<th thId="{key}" {width} colspan="{_colspan}" rowspan="{_rowspan}" class="{className}" scope="col" style="{style}" {attrs}{title}>{content}</th>',
		ROW_TEMPLATE: '<tr>{content}</tr>',
		THEAD_TEMPLATE: '<thead class="{className}"></thead>',
		initialize: function(){
			this.configs = this.options.thead || {};

			this.$el = this.options.table.container;

			this.plugins = this.configs.plugins || [];
		},
		render: function (config) {
			$.extend(true, this.configs, config);
	        var table = this.configs.table,
	        	host = this.options.host || this,
	            thead = this._createTHeadNode(),
	            columns = this.configs.columns,
	            defaults = {
	                _colspan: 1,
	                _rowspan: 1
	            },
	            i, len, col, label, key, html, content, colContent, values;

	        if (thead && columns) {
	            html = '';
	            content = '';

	            if (columns.length) {
	                for (i = 0, len = columns.length; i < len; ++i) {
	                    
						col = columns[i];
						label = col.label;
						colContent = (col.key == INPUT_TYPE) ? '<input type="' + col.type + '">' : (col.label || col.key);
						values = {
							key: col.key,
							className: this.getClassName('cis-header') + ' ' + (col.className || ''),
	                        content: colContent,
	                        width: col.width ? 'width="' + col.width + '"' : '',
	                        _rowspan: col._rowspan || 1,
	                        _colspan: col._colspan || 1,
	                        attrs: col.attrs || DEFAULT_HEADER_TH_ATTRS,
	                        title: ' title="' + (col.title || col.label || '') + '"',
	                        style: col.style || ''
						}

	                    content += Lang.sub(
	                            col.headerTemplate || this.CELL_TEMPLATE, values);
	                }

	                html += Lang.sub(this.ROW_TEMPLATE, {
	                    content: content
	                });
	            }

	            thead.html(html);
	            if(thead.parent() != table){
	            	 table.append(thead);
	            	 this.pluginsSetup(this.plugins);
	            }
	        }

	        return this;
    	},
    	_createTHeadNode: function () {
    		return $(Lang.sub(this.THEAD_TEMPLATE, {
	            className: this.getClassName('cis-columns')
	        }));
    	},
    	getClassName: function(){
			var host = this.options.host;

	        if (host && host.getClassName) {
	            return host.getClassName.apply(host, arguments);
	        } else {
	            return arguments[0];
	        }
    	},
		pluginsSetup: function(plugins){
			$.each(plugins, $.proxy(function(index, plugin){
				var i = 0,
					cols = plugin.cols,
					position = plugin.position;
				for(; i<cols.length; i++){
					var th = this.configs.table.find('th[thId="' + cols[i] + '"]');
					if(th.length){
						if(plugin.init)
							plugin.init.call(plugin, th, cols[i]);
						var content = $(plugin.content);
						if(position == 'left'){
							th.prepend(content);
						} else if(position == 'right'){
							th.append(content);
						} else if(position == 'top'){
							th.prepend($('<br>')).prepend(content);
						} else if(position == 'bottom'){
							th.append($('<br>')).append(content);
						} else if(position == 'replace'){
							//清空整个th，之后加入plugin
							th.empty().append(content);
						}
						if(plugin.setup)
							plugin.setup.call(plugin, th, cols[i], content);
					}
					
				}

			}, this));
		},
    	destroy: function(){
    		this.undelegateEvents();
 			this.$el.empty();
    	}
	})

 	var TableBodyView = Backbone.View.extend({
		CELL_TEMPLATE: '<td {attrs} {title} class="{className}" style="{style}">{content}</td>',
		LOADING_TEMPLATE: '<tr><td class="{className}" colspan={colspan} bgcolor="#FFFFFF"><div class="cis-table-loading">数据读取中，请稍候…</div></td></tr>',
 		NO_DATA_TEMPLATE: '<tr><td class="{className}" colspan={colspan} bgcolor="#FFFFFF"><div>{nodataContent}</div></td></tr>',
 		ROW_TEMPLATE : '<tr {attrs} class="{rowClass}" style="{style}">{content}</tr>',
 		TBODY_TEMPLATE: '<tbody class="{className}"></tbody>',
 		/**
 		表格 Body View 初始化
 		*/
 		initialize: function () {
			this.configs = this.options.body || {};

			//翻页控件
			this.ajaxPage = new AjaxPage();

			this.$el = this.options.table.container;

			//绑定result，绘制app表格
			this.model.bind('change:result', this._refreshTable, this);

			this.CLASS_ODD = this.getClassName('cis-odd');
			this.CLASS_EVEN = this.getClassName('cis-even');
		},
		getClassName: function () {
			var host = this.options.host;
			 
			if (host && host.getClassName) {
				return host.getClassName.apply(host, arguments);
			} else {
				return arguments[0];
			}
		},
		render: function(config){
			$.extend(true, this.configs, config);
			var	host = this.options.host || this,
				tbody = (this.tbodyNode && this.tbodyNode.empty()) || (this.tbodyNode = this._createBody());
			 
			if (tbody.parent() !== this.configs.table) {
				this.configs.table.append(tbody);
			}
			
			this.delegateEvents(this.options.events)
		},
		_createBody: function () {
			return $(Lang.sub(this.TBODY_TEMPLATE, {
				className: this.getClassName('cis-data')
			}));
		},
		_createLoadHTML: function(displayCols){
			return Lang.sub(this.LOADING_TEMPLATE, {
				colspan: displayCols.length
			})
		},
		_createDataHTML: function (fdata, displayCols) {
			var data = fdata,
				html = '';
			 
			if (data && data.length) {
				$.each(data, $.proxy(function(index, value){
					html += this._createRowHTML(value, index, displayCols);
				}, this));
			} else {//没有数据的情况
				html = Lang.sub(this.NO_DATA_TEMPLATE, {
					colspan: displayCols.length,
					className: this.getClassName('cis-table-nodata'),
					nodataContent: this.configs.noDataContent || '本次查询没有数据'
				});
			}
			return html;
		},
		_createRowTemplate: function(displayCols){
			var html = '',
				cellTemplate = this.CELL_TEMPLATE,
				cell, i, len, col, attrs, width, style, emptyTitle, key, values;
			 
			for (i = 0, len = displayCols.length; i < len; ++i) {
				col = displayCols[i];
				key = col.key;
				cell = (this.configs.cells && this.configs.cells[key]) ? this.configs.cells[key] : {};
				// width = col.width ? 'width="' + col.width + '"' : '';
				//如果在单元格中是input，那么不显示title
				emptyTitle = (key == INPUT_TYPE) ? true : cell.emptyTitle;
				style = cell.style || DEFAULT_TD_STYLE;
				attrs = cell.attrs || DEFAULT_TD_ATTRS;
				cellTemplate = cell.cellTemplate || this.CELL_TEMPLATE;
				
				values = {
					// width: width,
					style: style,
					attrs: attrs,
					title: emptyTitle ? '' : (' title="{' + key + '}"'),
					content : '{' + key + '}',
					className: 'cis-' + key + ''
				};
			 
			 	html += Lang.sub(cellTemplate, values);
			}
			 
			this._rowTemplate = Lang.sub(this.ROW_TEMPLATE, {
				attrs: (this.configs.tr && this.configs.tr.attrs) ? this.configs.tr.attrs : DEFAULT_TR_ATTRS,
				style: (this.configs.tr && this.configs.tr.style) ? this.configs.tr.style : DEFAULT_TR_STYLE,
				content: html
			});	
		},
		_createRowHTML: function (rowData, index, displayCols) {
			var data = $.extend(true, {}, rowData),
				cells = this.configs.cells,
				values = {
					rowClass: (index % 2) ? this.CLASS_ODD : this.CLASS_EVEN
				},
				i, len, col, value;
			 
			for (i = 0, len = displayCols.length; i < len; ++i) {
				col = displayCols[i].key;
				value = data[col];
				if(col == INPUT_TYPE){//处理checkbox的情况
					values[col] = '<input type="' + value + '">'
				} else {
					values[col] = (cells && cells[col] && cells[col].unEscape) ? value : Lang.escapeHTML(value);	
				}
				
			}
			 
			values.rowClass = values.rowClass.replace(/\s+/g, ' ');

			return Lang.sub(this._rowTemplate, values);
		},
		_createPage: function(pageData){
			if(!this.options.pageContainers || !this.options.pageContainers.length){
				this.options.pageContainers = [$('<div>').appendTo(this.$el)];
			}
			if(!pageData){
				$.each(this.options.pageContainers, function(index, value){
					value.empty();
				})
			} else {
				this.ajaxPage.render({
					containers: this.options.pageContainers,
					pageData: pageData,
					onSuccess: jQuery.proxy(function(jsonObj){
						this.model.set({
							result: {
								data: jsonObj.data,
								ajaxpc: jsonObj.ajaxpc,
								showLoadingFlag: false
							}
						});
					}, this),
					onError: jQuery.proxy(function(msg){
						this.model.set('result',{
							showLoadingFlag: false,
							data: [],
							ajaxpc: null
						});
					}, this),
					onBegin: jQuery.proxy(function(){
						this.model.set({
							'result': {
								showLoadingFlag: true
							}
						});
					}, this)
				});
			}
		},
		_refreshTable: function(){
			var showLoadingFlag = this.model.get('result').showLoadingFlag,
				host = this.options.host || this,
				data = this.model.get('result').data,
				displayCols = this.configs.columns,
				tbody = this.tbodyNode,
				fdata, pageData;

			if(showLoadingFlag) {//show loading
				tbody.html(this._createLoadHTML(displayCols));
			} else {
				this._createRowTemplate(displayCols);
				if (data) {
					if(host.formatterFn){
						fdata = host.formatterFn.call(host, data);
					}
					tbody.html(this._createDataHTML(fdata || data, displayCols));
					pageData = this.model.get('result')['ajaxpc'] && this.model.get('result')['ajaxpc'][0];
				}
				if(host.afterRefreshTable){
					host.afterRefreshTable.call(host, this.configs, data);
				}
			}
			this._createPage(pageData);

		},
    	destroy: function(){
    		this.undelegateEvents();
 			this.$el.empty();
    	}
 	});

	var TableBodyModel = Backbone.Model.extend({
		defaults: {
			url: '',
			params: {},
		    result: {
		    	data: [],
		      	ajaxpc: null,
		      	showLoadingFlag: false
		    }
		},
		sync: function(){
				this.set({
					'result': {
						showLoadingFlag: true
					}
				});
				// if(this.get('refOptions')){
				// 	this.set('params', $.extend(true, {}, this.get('params'), this.get('refOptions')));
				// }
		  //   	BzAjax.post(this.get('url'), this.get('params'), $.proxy(this,'dataCallback'), true, $.proxy(this,'fnE'));
				setTimeout($.proxy(function(){
					var data = [
		    		{
		    			"planId":986523,
		    			"groupId":234235,
		    			"cpcGrpName":"sdfassssssssssssssssasdfasdfsdfasdfas)</script>dfasdfasdfaswewrefsdfa",
		    			"cpcPlanName":"推广计划1231WWWWWWWWWWW<script>alert(333)<\/script>WWW"
		    		},
		    		{
		    			"planId":123123,
		    			"groupId":512341,
		    			"cpcGrpName":"推广组11<script>alert(1)<\/script>111111111111111111111111111",
		    			"cpcPlanName":"推广计划1231WWWWWWWWWWW<script>alert(333)<\/script>WWW"
		    		}],
		    		ajaxpc = [{"method":"POST","pageNo":1,"pageSize":20,"param":[],"recordCount":4,"url":"http://10.129.148.186:8090/analysis/getGroupsOfAddExtraIdea.action"}];
		      	
				
		    		this.set({
						result: {
							data: data,
							ajaxpc: ajaxpc,
							showLoadingFlag: false
						}
					});
				}, this), 2000)
			},
		dataCallback: function(response){
				var jsonObj = sogou.json.parse(response.responseText), 
					flag = jsonObj.flag,
					msg = jsonObj.msg,
					data = [
		    		{
		    			"planId":986523,
		    			"groupId":234235,
		    			"cpcGrpName":"sdfassssssssssssssssasdfasdfsdfasdfas)</script>dfasdfasdfaswewrefsdfa",
		    			"cpcPlanName":"推广计划1231WWWWWWWWWWW<script>alert(333)<\/script>WWW"
		    		},
		    		{
		    			"planId":123123,
		    			"groupId":512341,
		    			"cpcGrpName":"推广组11<script>alert(1)<\/script>111111111111111111111111111",
		    			"cpcPlanName":"推广计划1231WWWWWWWWWWW<script>alert(333)<\/script>WWW"
		    		}
		    	],
		      	ajaxpc = [{"method":"POST","pageNo":1,"pageSize":20,"param":[],"recordCount":4,"url":"http://10.129.148.186:8090/analysis/getGroupsOfAddExtraIdea.action"}];
				if(flag != '1'){
					this.set({
						result: {
							data: data,
							ajaxpc: ajaxpc,
							showLoadingFlag: false
						}
					});
				} else {
					this.set('result',{
						showLoadingFlag: false,
						data: [],
						ajaxpc: null
					});
					alert(msg.length !== 0 ? msg[0] : "系统繁忙，请稍后重试！");
				}
			},
			fnE: function(){
				alert('请求数据失败');
			}
	});

 	function CIS_Table(){
 		var i = 0,
            cTable = this,
            args = arguments,
            l = args.length,
            instanceOf = function(o, type) {
                return (o && o.hasOwnProperty && (o instanceof type));
            };
        this.config = {
        	thead: {
        		plugins: []
        	}
        }
       	for (; i < l; i++) {
            this.applyConfig(args[i]);
        }
        this._init();
   //      if (!(instanceOf(cTable, CIS_Table))) {
   //          cTable = new CIS_Table();
   //          for (; i < l; i++) {
   //              cTable.applyConfig(args[i]);
   //          }
   //          cTable._init();
   //      }
 		// return cTable;
 	}

 	CIS_Table.prototype.applyConfig = function(configs){
 		this.config = this.config || {} ;
 		for (name in configs) {
            if (configs.hasOwnProperty(name)) {
                var attr = configs[name];
                this.config[name] = attr;
            }
        }
        this.config.host = this;
 	}

 	CIS_Table.prototype._init = function(){
 		var config = this.config || {} ;
 		this.tableView = new TableView(config)
 	}

 	CIS_Table.prototype.query = function(params, keepParams){
 		this.tableView.queryTable(params, keepParams);	
 	}

 	CIS_Table.prototype.afterRefreshTable = function(configs, data){

 	}

 	CIS_Table.prototype.getTableData = function(){
 		return this.tableView.bodyModel.toJSON()
 	}

 	CIS_Table.prototype.formatterFn = function(data){
 		return data;
 	}

 	CIS_Table.prototype.destroy = function(){
 		this.tableView.destroy();
 	}

 	CIS_Table.extend = function(r){
 		Lang.extend(r, CIS_Table);
 	}

 	return CIS_Table;
}
if ( typeof define === "function") {
	define('cis-table', function(require, exports, module){
	 	var Backbone = require('backbone'),
	 		AjaxPage = require('ajaxPage');
	 	module.exports = defineTable(Backbone, AjaxPage); 
 	})
} else {
	window.CIS_Table = defineTable(window.Backbone, window.AjaxPage);
}
