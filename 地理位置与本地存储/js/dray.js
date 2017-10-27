var l = 0,t=0,x=0,y=0;
	var isOver = false;
	var zindex = 3;
	function init(titleDom){
		//tm_center(divObj);//居中事件
		/*第一种*/
		var thisDom = titleDom;//获取当前title对象
		var parentDom = thisDom.parentNode;//获取当前title对应的div
		titleDom.onmousedown = function(event){//1111开始
			var e = event || window.event;//为了兼容ie和火狐
			x = e.clientX;//鼠标所在的x坐标
			y = e.clientY;//鼠标所在的y坐标
			
			l = parseInt(parentDom.offsetLeft);//距离浏览器左边的位置left
			t = parseInt(parentDom.offsetTop);//距离浏览器顶部的位置top
			isOver = true;//定义拖动标识,防止卡顿
			zindex++;
			parentDom.style.zIndex = zindex;
			document.onmousemove = function(event){
				if(isOver){
					var e = event || window.event;//为了兼容ie和火狐
					var newLeft = l + e.clientX - x;//新的左边距
					var newTop = t + e.clientY - y;//新的顶部边距
					parentDom.style.left = newLeft+"px";
					parentDom.style.top = newTop+"px";
				}
			
			}; //鼠标移动的事件
			document.onmouseup = function(event){
				if(isOver){
					isOver = false;//还原标识
				}
			};//鼠标松开的事件

		};///111结束
	};
