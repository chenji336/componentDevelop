require.config({
	paths:{jquery:'jquery-1.7.1.min',
		   jqueryUi:'jquery-ui.min'	
		  }
});

require(['jquery','window'],function($,w){
	$("#a").click(function(){
		var win=new w.Window();
		win.alert({
			title:'提示',
			content:'welcome!',
			width:300,
			height:150,
			y:30,
			hasCloseBtn:true,
			skinClassName:'window_skin_a1',
			text4AlertBtn:'ok',
			isDraggable:true,
			draggablePosition:'.window_header',
			handler4alert:function(){
				alert('you click alert button');
			},
			handler4close:function(){
				alert('you click close button');
			}
		}).on('close',function(){
			alert('you click second close button');
		});
		win.on('alert',function(){
			alert('you click second alert button');
		});
	});


	$("#b").click(function(){
		new w.Window().confirm({
				title:'confirm提示',
				content:'请选择!',
				width:300,
				height:150,
				y:30,
				hasCloseBtn:true,
				skinClassName:'window_skin_a1',
				text4ConfirmBtn:'是',
				text4CancelBtn:'否',
				isDraggable:true,
				draggablePosition:'.window_header',
				handler4close:function(){
					alert('you click close button');
				},
				handler4confirm:function(){
					alert('you click confirm button');
				},
				handler4cancel:function(){
					alert('you click cancel button');
				}
			}).on('cancel',function(){
				alert('you click second cancel button');
			});
		});

	$("#c").click(function(){
		new w.Window().prompt({
				title:'请输入你要输入的内容',
				content:'我们会为你保密的!',
				width:300,
				height:150,
				y:30,
				hasCloseBtn:true,
				skinClassName:'window_skin_a1',
				text4CancelBtn:'取消',
				text4PromptBtn:'输入',
				isDraggable:true,
				draggablePosition:'.window_header',
				handler4close:function(){
					alert('you click close button');
				},
				handler4cancel:function(){
					alert('you click cancel button');
				},
				handler4prompt:function(data){
					alert('你输入的内容是'+data);
				}
			}).on('cancel',function(){
				alert('you click second cancel button');
			});
		});

	$("#d").click(function(){
		new w.Window().common({
				content:'我只是一个简单的common!',
				width:300,
				height:150,
				y:30,
				hasCloseBtn:true
			});
		});


});
