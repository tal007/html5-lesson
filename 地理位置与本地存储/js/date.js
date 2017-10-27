		setInterval(timePlay,1000);
		timePlay();
		
		function timePlay(){
			var date = new Date;
			var arr = ['天','一','二','三','四','五','六','七','八','九','十','十一','十二'];
			time.innerHTML = zero(date.getHours())+' : '+zero(date.getMinutes())+' : '+zero(date.getSeconds());
			year.innerHTML = date.getFullYear() + '年' + zero((date.getMonth()+1)) + '月' + zero(date.getDate()) + '日';
			week.innerHTML = '星期' + arr[date.getDay()];				
			month.innerHTML = arr[(date.getMonth()+1)] + '月';
			day.innerHTML = date.getDate();
		};
		
		date.onmouseover = function(){
			this.className = 'on';
			move( date_close , {opacity:100} );
		};
		date.onmouseout = function(){
			this.className = '';
			move( date_close , {opacity:0} );
		};
		var onOff=true;
		date_close.onclick = function(){
			if (onOff)
			{
				move( date , {right:100} , 1000 , 'bounceOut' );
			}else{
				move( date , {right:50} , 1000 , 'bounceOut' );
			}
			onOff = !onOff;
		};

		function zero( num ){
			if ( num < 10 ){
				return '0'+num;
			}else{
				return num;
			}
		};