'use strict';

var rabbitRepeat=$('rabbitRepeat');
var rabbitRun=$('rabbitRun');
var rabbitLose=$('rabbitLose');
var rabbitWin=$('rabbitWin');

var imgs=['../image/rabbit-big.png','../image/rabbit-lose.png','../image/rabbit-win.png'];

var rightRunningMap = ["0 -854", "-174 -852", "-349 -852", "-524 -852", "-698 -851", "-873 -848"];
var leftRunningMap = ["0 -373", "-175 -376", "-350 -377", "-524 -377", "-699 -377", "-873 -379"];
var rabbitWinMap = ["0 0", "-198 0", "-401 0", "-609 0", "-816 0", "0 -96", "-208 -97", "-415 -97", "-623 -97", "-831 -97", "0 -203", "-207 -203", "-415 -203", "-623 -203", "-831 -203", "0 -307", "-206 -307", "-414 -307", "-623 -307"];
var rabbitLoseMap = ["0 0", "-163 0", "-327 0", "-491 0", "-655 0", "-819 0", "0 -135", "-166 -135", "-333 -135", "-500 -135", "-668 -135", "-835 -135", "0 -262"];

var animation=window.animation;

// repeat();
run();
// lose();
// win();

function repeat(){

	var repeatAnimation=animation().loadImage(imgs).changePosition(rabbitRepeat,rightRunningMap,imgs[0]).repeatForever();
	repeatAnimation.start(80);

	var isRunning=true;
	rabbitRepeat.addEventListener('click',function(){
		console.log('repeat click');
		if(isRunning){
			repeatAnimation.pause();
			isRunning=false;
		}else{
			repeatAnimation.restart();
			isRunning=true;
		}
		
	});
}

function run(){
	var interval=50;
	var speed=6;
	var initLeft=100;
	var finalLeft=400;
	var right=true;
	// 从第四帧开始走
	var frame=4;
	var frameLength=6;

	var runAnimation=animation().loadImage(imgs).enterFrame(function(success,time){
		// animation.timeline中执行的index
		var ratio=time/interval;
		var position;
		var left;

		if(right){
			position=rightRunningMap[frame].split(' ');
			left=Math.min(initLeft+ratio*speed,finalLeft);
			if(left===finalLeft){
				right=false;
				frame=4;
				success();
				return;
			}
		}else{
			position=leftRunningMap[frame].split(' ');
			left=Math.max(finalLeft-ratio*speed,initLeft);
			if(left===initLeft){
				right=true;
				frame=4;
				success();
				return;
			}
		}

		rabbitRun.style.backgroundImage='url(' + imgs[0] + ')';
		rabbitRun.style.backgroundPosition=position[0]+'px '+position[1]+'px';
		rabbitRun.style.left=left+'px';
		if(++frame===frameLength){
			frame=0;
		}
	}).repeat(1).wait(500).changePosition(rabbitRun,rabbitWinMap,imgs[2]).repeat(1).then(function(){
		console.log('run finished');
	});

	runAnimation.start(interval);
}



function lose(){
	var loseAnimation=animation().loadImage(imgs).changePosition(rabbitLose,rabbitLoseMap,imgs[1]).then(function(){
		console.log('lose animation finished');
		// 释放资源
		loseAnimation.dispose();
	});
	loseAnimation.start(80);
}

function win(){
	// repeat有问题，再看看
	var winAnimation=animation().loadImage(imgs).changePosition(rabbitWin,rabbitWinMap,imgs[2]).repeat(3).then(function(){
		console.log('win animation repeat 3 times and finished');

		// 释放资源的话也报错
		winAnimation.dispose();
	});
	winAnimation.start(80);
}









function $(id){
	return document.getElementById(id);
}
