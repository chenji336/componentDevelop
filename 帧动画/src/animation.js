'use strict';

// 加载图片
// *不需要.js，调用js的名称就行了
var imgLoad=require('./imgLoad');
// 异步加载
var Timeline=require('./timeline');

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
			// 下面的这一段还是不能放在外面，因为当两次调用changePositon的时候放在外面背景图片是上次出现的
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

			// 不能再下面添加if(times),会无限循环
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

// ********************下面的五个不需要._add**********************************************

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
	},taskFn.wait):this._runTask();
}

var createAnimation=function(){
	return new Animation();
};

module.exports=createAnimation;
