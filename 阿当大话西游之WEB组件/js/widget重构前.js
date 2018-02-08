//抽象出widget类（原型），这样如果还有别的function也可以继承这些自定义事件
define(function(){
	function Widget(){
		this.handlers={};
	}

	Widget.prototype={
		on:function(type,handler){
			if(typeof this.handlers[type] =='undefined'){//如果不要typeof===这些的话就需要把括号里面的内容呼唤一下位置
				this.handlers[type]=[];
				this.handlers[type].push(handler);
			}else{
				this.handlers[type].push(handler);
			}
			return this;//用来形成连缀语法
		},
		fire:function(type,data){
			if(this.handlers[type] instanceof Array){//我觉得加上这句是为了防止什么都没有on的时候就直接调用了fire
				for(var i=0;i<this.handlers[type].length;i++){
					this.handlers[type][i](data);
				}
			}
		}
	};
	return {Widget:Widget};
});