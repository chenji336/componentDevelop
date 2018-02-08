define(['widget','jquery','jqueryUi'],function(widget,$,$Ui){
	function Window(){
		this.cfg={
			title:"系统消息",
			content:"",
			width:500,
			height:300,
			hasCloseBtn:false,
			skinClassName:null,
			text4AlertBtn:"确定",
			hasMask:true,
			isDraggable:false,
			draggablePosition:null,
			handler4alert:null,
			handler4close:null
		};

		this.handlers={};
	}

	Window.prototype=$.extend({},new widget.Widget(),{//这个用了jquery的继承，js的话可以用Object.create,，其实就是把后面的值赋值给前面的
		//调整接口形式
		//好处就是在调用的时候如果我不想传入值还需要一个空字符串占着
		//而且用这种字典模式感觉更清爽
		// alert:function(content,handler,cfg){
		alert:function(cfg){
			var CFG=$.extend(this.cfg,cfg);
			var boundingBox=$('<div class="window_boundingBox">'+
							  '<div class="window_header">'+CFG.title+'</div>'+
							  '<div class="window_body">'+CFG.content+'</div>'+
							  '<div class="window_footer"><input type="button" class="window_alertBtn" value="'+CFG.text4AlertBtn+'""></div>'+
				 			  '</div>');
			var mask=null;
			var that=this;
			if(CFG.hasMask){
				mask=$('<div class="window_mask"></div>');
				mask.appendTo('body');
			}
			 boundingBox.appendTo('body');
			 var btn=boundingBox.find('.window_alertBtn');
			 
			 
			// boundingBox.html(CFG.content);
			// var btn=$('<input type="button" value="确认">');
			// btn.appendTo(boundingBox);
			btn.click(function(){
				boundingBox.remove();
				mask&&mask.remove();
				// 如果使用this的话就回去找btn中的fire，所以使用that，也可以使用绑定bind
				that.fire('alert');
			});	

			// $.extend(this.cfg,cfg);
			boundingBox.css({
				width:CFG.width+'px',
				height:CFG.height+'px',
				left:(CFG.x||(window.innerWidth-CFG.width)/2)+'px',
				top:(CFG.y||(window.innerHeight-CFG.height)/2)+'px'
			});	

			if(CFG.hasCloseBtn){
				var closeBtn=$('<span class="window_closeBtn">X</span>');
				closeBtn.appendTo(boundingBox);
				closeBtn.click(function(){
					boundingBox.remove();
					mask&&mask.remove();
					that.fire('close');
				});
			}

			if(CFG.skinClassName){
				$('body').addClass(CFG.skinClassName);
			}

			if(CFG.isDraggable){
				if(CFG.draggablePosition){
					boundingBox.draggable({handle:CFG.draggablePosition});
				}else{
					boundingBox.draggable();
				}
			}

			if(CFG.handler4alert){
				this.on('alert',CFG.handler4alert);
			}

			if(CFG.handler4close){
				this.on('close',CFG.handler4close);
			}

			return this;
		},
		confirm:function(){

		},
		pro:function(){

		}
	});

	return {Window:Window};

});