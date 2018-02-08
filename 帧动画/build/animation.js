var animation =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// 加载图片
// *不需要.js，调用js的名称就行了
var imgLoad=__webpack_require__(1);
// 异步加载
var Timeline=__webpack_require__(2);

// 因为没有常量，所以大写可以理解为常量
// 分别为初始化    开始  暂停状态
var STATE_INITIAL=0,
	STATE_START=1,
	STATE_STOP=2;

// 分别为同步  异步状态
var TASK_SYNC=0,
	TASK_ASYNC=1;

function next(callback){
	callback&&callback();
}


/**
 * 帧动画的类
 */
function Animation(){
	this.taskQueue=[];
	this.index=0;
	this.timeline=new Timeline();
	this.state=STATE_INITIAL;
}

/**
 * 同步预加载动画
 * @param  {[图像列表]}
 * @return {[type]}
 */
Animation.prototype.loadImage=function(imgList){
	// 老师考虑说因为图片加载是一个常用的功能，而不只是这个项目中才用到的，所以使用imgLoad.js

	// 所有任务都应该在taskQueue中
	// 为什么要添加taskFn?因为这个可以把imgList放在闭包里面
	var taskFn=function(next){
		// slice因为imgList传递回去可能会被改变，使用一个深拷贝的值
		imgLoad(imgList.slice(),next);
	};

	var type=TASK_SYNC;

	return this._add(taskFn,type);
};

/**
 * 异步方法，通过改变背景图片的位置来改变图片
 * @param  {dom元素}
 * @param  {背景图片的位置}
 * @param  {[图片url]}
 * @return {[type]}
 */
Animation.prototype.changePosition=function(element,positions,imgUrl){
	var len=positions.length;
	var taskFn;
	var type;

	if(!len){
		taskFn=next;
		type=TASK_SYNC;
	}else{
		var me=this;
		var index=0;
		var position;
		
		taskFn=function(next,time){
			if(imgUrl){
				element.style.backgroundImage='url('+imgUrl+')';
			}
			// 获取是运行的第几次
			// x|0（左右两边二进制加起来） 本质就是Math.floor(x),但是|0会更优化一点。 
			index=Math.min(time/me.interval|0,len);
			position=positions[index-1].split(' ');
			element.style.backgroundPosition=position[0]+'px '+position[1]+'px';
			if(index===len){
				next();
			}
		};
		type=TASK_ASYNC;
	}
	return this._add(taskFn,type);	
};

// 异步方法，改变背景图片的src来改变背景图片（dom元素，图片列表）
Animation.prototype.changeSrc=function(element,imgList){
	var len=imgList.length;
	var taskFn;
	var type;

	if(len){
		taskFn=next;
		type=TASK_SYNC
	}else{
		var index=0;
		var me=this;
		taskFn=function(next,time){
			index=Math.min(time/me.interval|0,len);
			element.src=imgList[index-1];
			if(index===len){
				next();
			}
		};
	}
	return this._add(taskFn,type);
};

// 同步执行次数(time=null 无限次)
Animation.prototype.repeat=function(times){
	var taskFn;
	var type=TASK_SYNC;
	var me=this;
	taskFn=function(){
		if(typeof times ==='undefined'){
			me.index--;
			me._runTask();
			return;
		}

		if(!times){
			me._next(me.taskQueue[me.index]);
		}else{
			times--;
			me.index--;
			me._runTask();

			// 不能再下面添加if(times),就算下面寫了，那么还是会无限循环的
			// 因为还是运行这个任务，times<0，之后会继续循环
			// if(times){
			// 		me._next(me.taskQueue[me.index]);
			// }
		}
	};
	
	return this._add(taskFn,type);
};

// 同步无限次执行
Animation.prototype.repeatForever=function(){
	return this.repeat();
};

// 同步执行完成后的回调函数
// 更好的就是接着上个任务继续执行
Animation.prototype.then=function(callback){
	var type=TASK_SYNC;
	var taskFn=function(next){
		callback(this);
		next();
	};
	
	return this._add(taskFn,type);
};

/**
 * 高级用法，添加一个异步定时执行的任务，
 * 该任务自定义动画每帧执行的任务函数
 * @param taskFn 每帧执行的任务函数
 */
Animation.prototype.enterFrame=function(taskFn){
	return this._add(taskFn,TASK_ASYNC);
};

// ********************下面的四个不需要._add**********************************************

// 上一个任务到下一个任务需要等待的时间
Animation.prototype.wait=function(time){
	if(this.taskQueue&&this.taskQueue.length>0){
		this.taskQueue[this.taskQueue.length-1].wait=time;
	}
	return this;
};

/**
 * 开始执行（执行间隔）
 * @param  时间间隔
 * @return {[type]}
 */
Animation.prototype.start=function(interval){
	// 当已经处在开始状态，则直接返回this
	if(this.state===STATE_START){
		return this;
	}

	// 任务链长度为0，则直接返回
	if(!this.taskQueue.length){
		return this;
	}

	this.state=STATE_START;
	// 设置间隔时间
	this.interval=interval;
	// 开始执行任务
	this._runTask();

	return this;
};

// 停止异步执行
Animation.prototype.pause=function(){
	if(this.state===STATE_START){
		this.state=STATE_STOP;
		this.timeline.stop();
	}
	return this;
};

// 开始异步的执行
Animation.prototype.restart=function(){
	if(this.state===STATE_STOP){
		this.state=STATE_START;
		this.timeline.restart();
	}
	return this;
};

// 释放资源（定时器）
Animation.prototype.dispose=function(){
	if(this.state!==STATE_INITIAL){
		this.state=STATE_INITIAL;
		this.taskQueue=null;
		this.timeline.stop();
		this.timeline=null;
	}
	return this;
};


// *****************************************私有方法********************************************

/**
 * 添加方法
 * @param {[taskFn]}  任务方法
 * @param {[type]}	任务类型
 */
Animation.prototype._add=function(taskFn,type){
	this.taskQueue.push({
		taskFn:taskFn,
		type:type
	});
	return this;
}

/**
 * 开始执行任务
 * @return {[type]}
 */
Animation.prototype._runTask=function(){
	if(!this.taskQueue||this.state!==STATE_START){
		return;
	}

	// 任务已经全部完成，则需要释放资源了
	if(this.index===this.taskQueue.length){
		this.dispose();
		return;
	}

	var task=this.taskQueue[this.index];
	if(task.type===TASK_SYNC){
		this._sync(task);
	}else{
		this._async(task);
	}
}

/**
 * 执行同步任务
 * task 需要执行的任务
 * @return {[type]}
 */
Animation.prototype._sync=function(task){
	var me=this;
	// 需要回调的函数
	var next=function(){
		me._next(task);
	};
	var taskFn=task.taskFn;
	// next是回调函数，当taskFn执行完成之后就执行next
	taskFn(next);
}

/**
 * 异步执行任务
 *  task 需要执行的任务
 * @return {[type]}
 */
Animation.prototype._async=function(task){
	// 可以用setTimeout，但是由于setTimeout在不同浏览器可能延迟不一样，导致动画不平稳
	// 所以自己建立时间轴类来进行,timeLine.js
	var me=this;
	var taskFn=task.taskFn;
	var next=function(){
		me.timeline.stop();
		me._next(task);
	};
	
	// time是从开始到当前执行的时间
	var enterframe=function(time){
		taskFn(next,time);
	};
	
	this.timeline.onenterframe=enterframe;
	this.timeline.start(this.interval);
}

/**
 * 执行下一个任务
 * @return {[type]}
 */
Animation.prototype._next=function(task){
	this.index++;
	var me=this;
	task.wait?setTimeout(function(){
		me._runTask()
	},task.wait):this._runTask();
}

var createAnimation=function(){
	return new Animation();
};

module.exports=createAnimation;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
 

var DEFAULT_INTERVAL=1000/60;

// 初始化状态
 var STATE_INITIAL=0;
 // 启动状态
 var STATE_START=1;
 // 停止状态
 var STATE_STOP=2;

/**
 * raf 这个根据cpu处理的时间进行每帧的跳转 大概在1000/60
 * 通过闭包立即执行，这样只要执行一次，后续都可以不用执行了，减少后续浏览器判断（也算一种优化）
 * @return {[type]}
 */
 var requestAnimationFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
			//所有都不支持，用setTimeout兼容
		function (callback) {
			return window.setTimeout(callback, (callback.interval || DEFAULT_INTERVAL)); // make interval as precise as possible.
		};
})();

/**
* cancel raf
 * @return {[type]}
 */
 var cancelRequestAnimationFrame=(function(){
 	return window.cancelAnimationFrame||
 			window.webkitCancelAnimationFrame||
 			window.MozCancelAnimationFrame||
 			window.OCancelAnimationFrame||
 			// 通过id来进行取消
 			function (id){
 				window.clearTimeout(id);
 			};
 })();

/**
 * 时间轴类
 */
 function Timeline(){
 	// 作为启动的requestAnimationFrame的返回值
 	this.animationHandler=0;
 	this.state=STATE_INITIAL;
 }

/**
 * 执行每一帧的回调函数
 * 不实现，作为接口使用
 * time 从动画开始到当前执行的时间  ??做什么用了？？？
 *  解答：这个时间总时间用来求出是执行的第几次index
 * @return {[type]}
 */
 Timeline.prototype.onenterframe=function(time){

 };

/**
 * 开始执行
 * interval 间隔时间
 * @return {[type]}
 */
 Timeline.prototype.start=function(interval){
 	if(this.state===STATE_START){
 		return;
 	}

 	this.state=STATE_START;
 	this.interval=interval||DEFAULT_INTERVAL;

 	// 开始执行时间轴
 	// +new Date()获取当前时间，性能比（new Date()）.now要好
 	startTimeline(this,+new Date());
 };

/**
 * 停止执行
 * @return {[type]}
 */
 Timeline.prototype.stop=function(){
 	if(this.state!==STATE_START){
 		return;
 	}

 	this.state=STATE_STOP;
 	// 如果动画开始过，记录动画开始到停止所经历的时间
 	if(this.startTime){
 		this.dur=+new Date() - this.startTime;
 	}
 	cancelRequestAnimationFrame(this.animationHandler);
 };

 /**
  * 重新执行
  * @return {[type]}
  */
 Timeline.prototype.restart=function(){
 	if(this.state===STATE_START){
 		return;
 	}

 	//  如果没有停止过的话也直接返回，不需要开始
 	if(!this.dur){
 		return;
 	}

 	this.state=STATE_START;
 	// 为什么要 - this.dur ？ 为了跟上次停止的位置无缝链接
 	// ??关于上面无缝链接的，后面还是要在看一下
 	startTimeline(this,+new Date()-this.dur);
 };

/**
 * 开始执行时间轴
 * @param  {[timeline]} 时间轴实例
 * @param  {[startTime]} 开始时间
 * @return {[type]}
 */
 function startTimeline(timeline,startTime){
 	// 记录上一次时间戳
 	var lastTick=+new Date();
 	timeline.startTime=startTime;

 	nextTick();

 	function nextTick(){
 		var now=+new Date();

 		// 通过回调自己循环执行
 		timeline.animationHandler=requestAnimationFrame(nextTick);

 		if(now-lastTick>=timeline.interval){
 			// ？？我不知道这个onenterframe参数的用途
 			// 解答：这个时间总时间用来求出是执行的第几次index
 			timeline.onenterframe(now-startTime);
 			lastTick=now;
 		}
 	}
 }

 module.exports=Timeline;

/***/ })
/******/ ]);