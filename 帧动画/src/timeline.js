 'use strict';

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