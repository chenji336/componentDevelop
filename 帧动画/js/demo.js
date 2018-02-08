var element=document.getElementById('rabbit'),
	imageUrl='../image/rabbit-big.png',
	positions=["0 -854", "-174 -852", "-349 -852", "-524 -852", "-698 -851", "-873 -848"];
// 	var rightRunningMap = ["0 -854", "-174 -852", "-349 -852", "-524 -852", "-698 -851", "-873 -848"];
// var leftRunningMap = ["0 -373", "-175 -376", "-350 -377", "-524 -377", "-699 -377", "-873 -379"];


animation(element,imageUrl,positions);

function animation(ele,imgUrl,positions){
	var index=0;
	var position=[];
	//  js样式记忆点 都是background 只是后续在起上面添加不同的属性
	ele.style.backgroundImage='url('+ imgUrl +')';
	ele.style.backgroundRepeat='no-repeat';

	function run(){
		position=positions[index].split(' ');
		ele.style.backgroundPosition=position[0]+'px '+position[1]+'px';
		index++;
		if(index>=positions.length){
			index=0;
		}
		setTimeout(run,80);
	}

	run();

}
