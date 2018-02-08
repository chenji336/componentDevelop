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
			text4ConfirmBtn:'确定',
			text4CancelBtn:'取消',
			text4Prompt:'确定',
			isPasswordStyle:false,
			defaultInputValue:'陈骥',
			maxLength:10,
			hasMask:true,
			isDraggable:false,
			draggablePosition:null,
			handler4alert:null,
			handler4close:null,
			handler4confirm:null,
			handler4cancel:null,
			handler4prompt:null
		};
	}

	Window.prototype=$.extend({},new widget.Widget(),{//这个用了jquery的继承，js的话可以用Object.create,，其实就是把后面的值赋值给前面的
		//调整接口形式
		//好处就是在调用的时候如果我不想传入值还需要一个空字符串占着
		//而且用这种字典模式感觉更清爽
		// alert:function(content,handler,cfg){
		renderUI:function(){//渲染的UI
			var footHtml='';
			var prompHtml='';
			switch(this.cfg.winType){
				case 'alert':
					footHtml='<input type="button" class="window_alertBtn" value="'+this.cfg.text4AlertBtn+'"">';
					break;
				case 'confirm':
					footHtml='<input type="button" class="window_confirmBtn" value="'+this.cfg.text4ConfirmBtn+'">'+
							 '<input type="button" class="window_cancelBtn" value="'+this.cfg.text4CancelBtn+'">';
					 break;
				case 'prompt':
					prompHtml='<div class="window_promptBody"><input class="window_promptInput" type="'+(this.cfg.isPasswordStyle?'password':'text')+
							  '" value="'+this.cfg.defaultInputValue+'" maxLength='+this.cfg.maxLength+'><div>';
					footHtml='<input type="button" class="window_promptBtn" value="'+this.cfg.text4PromptBtn+'">'+
							 '<input type="button" class="window_cancelBtn" value="'+this.cfg.text4CancelBtn+'">';
					 break;
				default:
			}
			/*this.boundingBox=$('<div class="window_boundingBox">'+
							  '<div class="window_header">'+this.cfg.title+'</div>'+
							  '<div class="window_body">'+this.cfg.content+prompHtml+'</div>'+
							  '<div class="window_footer">'+footHtml+'</div>'+
				 			  '</div>');*/
			this.boundingBox=$('<div class="window_boundingBox">'+
							  '<div class="window_body">'+this.cfg.content+prompHtml+'</div>'+
				 			  '</div>');
			if(this.cfg.winType!='common'){
				this.boundingBox.prepend('<div class="window_header">'+this.cfg.title+'</div>');
				this.boundingBox.append('<div class="window_footer">'+footHtml+'</div>');
			}
			this.boundingBox.appendTo('body');
			this.prompt=this.boundingBox.find('.window_promptInput');
			if(this.cfg.hasMask){
				this.mask=$('<div class="window_mask"></div>');
				this.mask.appendTo('body');
			}
			if(this.cfg.hasCloseBtn){
				var closeBtn=$('<span class="window_closeBtn">X</span>');
				closeBtn.appendTo(this.boundingBox);
			}
		},
		bindUI:function(){
			var that=this;
			this.boundingBox.delegate('.window_alertBtn','click',function(){
				that.fire('alert');
				that.destory();
			}).delegate('.window_closeBtn','click',function(){
				that.fire('close');
				that.destory();
			}).delegate('.window_confirmBtn','click',function(){
				that.fire('confirm');
				that.destory();
			}).delegate('.window_cancelBtn','click',function(){
				that.fire('cancel');
				that.destory();
			}).delegate('.window_promptBtn','click',function(){
				that.fire('prompt',that.prompt.val());
				that.destory();
			})
			if(this.cfg.handler4alert){
				this.on('alert',this.cfg.handler4alert);
			}

			if(this.cfg.handler4close){
				this.on('close',this.cfg.handler4close);
			}

			if(this.cfg.handler4confirm){
				this.on('confirm',this.cfg.handler4confirm);
			}

			if(this.cfg.handler4cancel){
				this.on('cancel',this.cfg.handler4cancel);
			}

			if(this.cfg.handler4prompt){
				this.on('prompt',this.cfg.handler4prompt);
			}

		},
		syncUI:function(){
			this.boundingBox.css({
				width:this.cfg.width+'px',
				height:this.cfg.height+'px',
				left:(this.cfg.x||(window.innerWidth-this.cfg.width)/2)+'px',
				top:(this.cfg.y||(window.innerHeight-this.cfg.height)/2)+'px'
			});	
			if(this.cfg.skinClassName){
				$('body').addClass(this.cfg.skinClassName);
			}
			if(this.cfg.isDraggable){
				if(this.cfg.draggablePosition){
					this.boundingBox.draggable({handle:this.cfg.draggablePosition});
				}else{
					this.boundingBox.draggable();
				}
			}
		},
		destruct:function(){
			this.mask&&this.mask.remove();
		},
		alert:function(cfg){
			$.extend(this.cfg,cfg,{winType:'alert'});
			this.render();
			return this;
		},
		confirm:function(cfg){
			$.extend(this.cfg,cfg,{winType:'confirm'});
			this.render();
			return this;
		},
		prompt:function(cfg){
			$.extend(this.cfg,cfg,{winType:'prompt'});
			this.render();
			this.prompt.focus();
			return this;
		},
		common:function(cfg){
			var that = this;
			$.extend(this.cfg,cfg,{winType:'common'});
			this.render();
			// return this;
			setTimeout(function(){
				that.destory();//这里也是一个闭包，如果用this就是全局变量了
			},1000);
		}
	});

	return {Window:Window};

});