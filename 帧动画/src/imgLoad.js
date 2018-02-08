'use strict';

// 私有变量使用下划线
var __id=0;

// 唯一的id
function getId(){
	return ++__id;
}

/**
 * 加载图片的方法
 * imgList  图片列表--array or object
 * callback  全部图片加载完毕之后的回调函数
 * timeout  超时的时长
 */
function imgLoad(imgList,callback,timeout){
	// 图片加载成功的数量
	var count=0;
	// 成功的标志
	var success=true;
	// 超时id
	var timeoutId=0;
	// 是否超时
	var isTimeout=false;

	for(var key in imgList){
		// 如果不是原生的属性的话则直接跳过
		if(!imgList.hasOwnProperty(key)){
			continue;
		}

		var item=imgList[key];

		// 想要的格式 {src:xxx}
		if(typeof item==='string'){
			item=imgList[key]={src:item};
		}

		// 如果格式不满足，则丢弃(就是说上面的item==='string'没有满足就丢弃了)
		if(!item||!item.src){
			continue;
		}

		// 如果到了这里通过的话，说明是个正确的img
		count++;
		item.id='__img__'+key+getId();
		// ??这里我是不太清楚为什么需要使用window[item.id]来保存这个变量的，后续之后的话会在这后面解答下
		item.img=window[item.id]=new Image();
		// 正式开始加载img
		doLoad(item);
	}

	// 遍历完成之后计数是0，那么直接返回成功标识
	if(!count){
		callback(true);
	}
	// 如果设置了超时时长，则添加超时函数计时器
	else if(timeout){
		timeoutId=setTimeout(onTimeout,timeout);
	}

	// 正式开始加载
	function doLoad(item){
		// 有空可以看下aop，切面（横向的）
		item.status='onloading';

		var img=item.img;
		img.onload=function(){
			item.status='onloaded';
			success=success&true;
			done();
		};

		img.onerror=function(){
			item.status='error';
			success=false;
			done();
		};

		img.src=item.src;

		/**
		 * 图片加载完成之后的回调函数（无论成功失败）
		 */
		function done(){
			// 清空事件
			img.onload=img.onerror=null;

			// 删除window上的自定义属性
			// 使用try catch是因为有些ie浏览器兼容性问题,可能会报错
			try{
				delete window[item.id];
			}catch(e){

			}
			
			if(!--count&&!isTimeout){
				clearTimeout(timeoutId);
				callback(success);
			}
		}
	}

	function onTimeout(){
		isTimeout=true;
		callback(false);
	}
}


module.exports=imgLoad;