## 依赖 ##
jQuery Backbone
## 目录结构 ##
    |--js
    
    	|--cis-table.js
    
    |--css
    
    	|--cis-table.css
    
    |--images
    
    	|--loading.gif
## 模块化 ##
cis-table符合cmd标准，seajs加载。也兼容script标签加载
## css ##
cis-table.css
## 配置 ##
    options = {
    	host: //the context
    	url: //query table url
    table: {
    	container: //jQuery objcet, like $('cis-table'),
    	width://Table attr width, like '500' or '100%', default '100%'
    	attrs://Table attrs, like 'height="100" cellpadding="0"'
    	style://Table style, like ' padding: 1px; border: 1px', default 'background:#DADADA;table-layout:fixed'
    },
    thead: {
    	columns: [
    		{
    			key: //th key, cell refer to data[key], like 'planId' or 'planName'. 
    			value: //th value, if key = 'input', the cell will be a input dom which type is value.
    			label: //th display, if no label col display key, like 'name', 'id'
    			width: //th attr width, like '500' or '100%'
    			headerTemplate: //header teplate, default '<th {width} colspan="{_colspan}" rowspan="{_rowspan}" class="{className}" scope="col" {attrs}{title}>{content}</th>'
    			attrs: // th attr
    			style: // th style
    			_colspan: attr colspan, default 1
    			_rowspan: attr rowspan, default 1
    			title: th title, default label or key
    		}，
    		....
    	],
    	plugins: [ // will be triggered after head appendTo table
    		{
    			cols: [] //include col key，the plugin will be added to these, like ['planId', 'planName', 'grpName'], 
			    position: //the positon, 'left' or 'right' or 'top' or 'bottom'' or 'replace'
			    content: // the html of plugin
			    init: function(){} // will init plugin before plugin is added
			    setup: function(){} // setup will be call as soon as plugin is added
    		}
    	]
    },
    	body: {
    		cells: {
	    		'key':{ //key refer to columns key
		    		attrs: //td attr, like 'width="500" valign="top"'
		    		style: //td style, like 'height:500px'
		    		cellTemplate: // td template, default '<td {width} {attrs} {title} class="{className}" style="{style}">{content}</td>',
		    		emptyTitle: //hide title,
		    		unEscape: //unEscape data
    			}，
    		....
    		}
	    	tr: {
			    attrs: //tr attr, like 'width="500" valign="top"'
			    style: //tr style, like 'height:500px'
	    	}
    	
    }

## demo ##
## 自定义class name ##
TableView new的时候，会同时把 TableHeaderView、TableBodyModel和TableBodyView都new出来，并且调用render方法
Table的默认class name为cis-table，可以通过host的getClassName来改变class name

TableHeaderView thead的默认class name为cis-columns，可以通过实现TableView的Table的getClassName来改变class name
每个th的默认class name为cis-header，可以通过host的getClassName来改变class name

TableBodeView new的时候，会初始化翻页控件，并且得到奇数行和偶数行的class name cis-odd cis-even，可以通过host的getClassName来改变class name
tboady的classname为cis-data
tr偶数行默认class name为cis-even，奇数行默认class name为cis-odd
td默认class name为cis-{key}