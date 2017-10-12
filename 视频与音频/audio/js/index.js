// 获取html中的DOM节点
/*
	$userinput：用户输入框
	$serachBtn：用户搜索按钮
	$showImg：显示的图片
	$songname：歌曲名字
	$singer：singer
	$musicList：歌曲列表
	$lyric：歌词
	$mainTitle：title 名字
	$musicScrollBar：歌曲滚动条
	$lyricScrollBar：歌词滚动条
	$audio：音频标签
	$startTime：开始时间
	$endTime：总时间/结束时间
	$prev：上一曲
	$play/播放
	$next：下一曲
	$durationBar：播放进度条
	$volumeBar：音量条
	$volume：音量图标
	$search：搜索按钮
	$userinput：输入框
 */
var $userinput = $('input.userinput'),
	$serachBtn = $('i.button'),
	$showImg = $('#showImg'),
	$songname = $('#songname'),
	$singer = $('#singer'),
	$musicList = $('.musicList'),
	$lyric = $('#lyric'),
	$mainTitle = $('#main .title').eq(0),
	$musicScrollBar = $('.music .scrollBar .dot').eq(0),
	$lyricScrollBar = $('.lyric .scrollBar .dot').eq(0),
	$audio = $('#audio'),
	$startTime = $('#startTime'),
	$endTime = $('#endTime'),
	$prev = $('#prev'),
	$play = $('#play'),
	$next = $('#next'),
	$durationBar = $('#footer .progressBar .barBg').eq(0),
	$volumeBar = $('#footer .volume .barBg').eq(0),
	$volume = $('#volume'),
	$search = $('#search'),
	$userinput = $('#userinput')

// 定义常量
/*
	musicNum：歌曲列表鼠标滚轮
	lyricNum：歌词鼠标滚轮
	timer1：定时器1   进度
	timer2：定时器2   图片旋转
	timer3：定时器3   歌词滚动
	nowNolume：点击时记录的当前的   nolume
	nowWidth：点击时记录当前的音量bar 的宽度
	totleTime：当前歌曲的总时间    注意用到totleTime的地方必须在 ajax 里面使用
	length：当前歌曲列表的总歌曲数量
	firstGet：第一次请求数据
	songlist: 当前的歌曲列表
 */
var musicNum = 0,
	lyricNum = 0,
	timer1,
	timer2,
	timer3,
	nowNolume,
	nowWidth,
	totleTime,
	length,
	firstGet = true,
	songlist;

// 排行榜
var topId = {
	'3': '欧美',
	'4': '流行榜',
	'5': '内地',
	'6': '港台',
	'16': '韩国',
	'17': '日本',
	'26': '热歌',
	'27': '新歌',
	'28': '网络新歌',
	'32': '音乐人',
	'36': 'K歌金曲'
}

// 搜索框的移入移出事件
$('#header .container .search').hover(()=>{
	$('#header .container .userinput').css({
		width: '500px',
		opacity: 1
	})
	$('#header .container .icon-sousuo').css({
		color: 'black'
	})	
},()=>{
	$('#header .container .userinput').css({
		width: '10px',
		opacity: 0
	})
	$('#header .container .icon-sousuo').css({
		color: 'white'
	})	
})

// 左侧导航的生产
for (i in topId) {
	var li = document.createElement('li');
	li.innerHTML = topId[i];
	li.setAttribute('data-key', i);
	if ( i == 5 ) {
		$(li).addClass('on')
	}

	li.i = topId[i];
	li.onclick = function(){
		// 判读点击的是不是当前的这个 li
		if (!$(this).hasClass('on')) {
			$(this).addClass('on').siblings().removeClass('on');
			$mainTitle.html(this.i + '排行榜')
			$musicList.find('ul').html('');
			getData(this.getAttribute('data-key'));

			num=0;
			$musicList.find('ul').css({
				marginTop: 0
			})
			$musicScrollBar.css({
				height: 0
			})			
		}
	}
	$('#main .navList').append(li);
}

// ajax 歌曲列表数据请求
function getData(key){
	$.ajax({
		url: 'https://route.showapi.com/213-4?showapi_appid=41250&showapi_sign=c63b5d4717664eb9bf8bac2ddabe704d&topid=' + key,
		type: 'GET',
	})
	.done(function(data) {
		/*
			data.showapi_res_body.ret_code
			0：成功   -1：失败
		 */
		if (!data.showapi_res_body.ret_code) {
			// 数据请求成功的执行函数
			data = data.showapi_res_body.pagebean;
			// console.log(data);
			songlist = data.songlist;
				
			// 更新当前歌曲的总数
			length = songlist.length;
			// console.log(length);

			// songlist的遍历
			songlist.forEach((value,index) => {
				var li = document.createElement('li');
				li.innerHTML = value.songname;
				li.onclick = function(){
					$(this).addClass('on').siblings().removeClass('on');
					changeMusic(value,index);
				}
				$musicList.find('ul').append(li);
			});

			$musicScrollBar.css({
				height: $musicList.height() / $musicList.find('ul').height() * $musicScrollBar.parent().height() + 'px'
			})

			// 初始渲染的歌曲
			// 写在这里确保有这个 li
			if (key == 5) {
				if (firstGet) {
					getLyric(songlist[0].songid)
					$songname.html(songlist[0].songname)
					$singer.html(songlist[0].singername)
					$audio.attr({
						src: songlist[0].url,
						alt: songlist[0].songname,
						index: 0
					})
					$showImg.attr({
						src: songlist[0].albumpic_big
					})
					// 总时间
					totleTime = songlist[0].seconds;
					console.log(totleTime)
					endTime(totleTime)
					firstGet = false
					$lyric.find('ul').css({
						marginTop: $lyric.height()/2 + 'px'
					})
				}
				if (!$audio[0].currentTime) {
					$musicList.find('li').eq(0).addClass('on');
				}
			}
			// 可以拖动时间条，但是音乐播放了才可以拖动
			if (!$audio[0].paused) {dragDuration(totleTime)}
			

			// 点击上一曲下一曲
			$prev.click(function(){
				var index = $audio[0].getAttribute('index');
				index--;
				index = index < 0? length-1 : index
				changeMusic(songlist[index],index)
				$musicList.find('li').eq(index).addClass('on').siblings().removeClass('on');
			})
			// 点击下一曲
			$next.click(function(){
				var index = $audio[0].getAttribute('index');
				index++;
				index = index > length-1? 0 : index
				changeMusic(songlist[index],index)
				$musicList.find('li').eq(index).addClass('on').siblings().removeClass('on');
			})
		} else {
			var li = document.createElement('li');
			li.innerHTML = '数据请求失败，请稍后再试！！！';
			$musicList.find('ul').append(li);
		}
	})
	.fail(function(err) {
		// 数据请求失败的执行函数
		console.log(err);
		var li = document.createElement('li');
		li.innerHTML = '数据请求失败，请稍后再试！！！'
		$musicList.find('ul').append(li);
	})
	.always(function() {
		// 请求数据就会执行的函数
		console.log("complete");
	});
}
// 默认渲染内地
getData(5);
// ajax 歌词请求
function getLyric(id){
	$.ajax({
		url: 'https://route.showapi.com/213-2?musicid='+id+'&showapi_appid=41250&showapi_sign=c63b5d4717664eb9bf8bac2ddabe704d',
		type: 'GET'
	})
	.done(function(data) {
		if (!data.showapi_res_body.ret_code) {
			// 数据请求成功的执行函数
			data = data.showapi_res_body.lyric;
			// 将这个看不懂的东西转换一下
			var  t = document.createElement("div");
			t.innerHTML = data;
			data = t.innerHTML
			data = data.split('[');
			// console.log(data);
			$lyric.find('ul').html('');
			data.forEach((value,index)=>{
				/*
					value.split(']')[0]：时间
					value.split(']')[1]：歌词
				 */
				// value.split(']')[1].length != 1  保证不是一个包含空格的数组
				if (value.split(']')[1] && value.split(']')[1].length != 1) {
					var li = document.createElement('li');
					li.innerHTML = value.split(']')[1];
					$(li).attr({
						time: value.split(']')[0],
						index: index
					})
					$lyric.find('ul').append(li);

				}
			})
			// 歌词滚动条的高度
			$lyricScrollBar.css({
				height: $lyric.height() / $lyric.find('ul').height() * $lyricScrollBar.parent().height() + 'px'
			})

			// 歌词的自动滚动
			if (!$audio[0].paused) {
				// timer3 = setInterval(lyricScrollAuto,500)
				lyricScrollAuto()
			}
			

		} else {
			var li = document.createElement('li');
			li.innerHTML = '数据请求失败，请稍后再试！！！';
			$lyric.find('ul').append(li);
		}		
	})
	.fail(function() {
		console.log("error");
		var li = document.createElement('li');
		li.innerHTML = '数据请求失败，请稍后再试！！！';
		$lyric.find('ul').append(li);
	})
	.always(function() {
		console.log("complete");
	});
}

// 歌曲列表的滚动
$musicList.get(0).addEventListener('mousewheel',musicScroll,false)
$musicList.get(0).addEventListener("DOMMouseScroll",musicScroll,false);
function musicScroll(e){
	e = e || window.event;
	var d = e.wheelDelta / 10 || -e.detail;
	var musicListHeight = $musicList.find('ul').height() - $musicList.height()
	var height = $musicScrollBar.parent().height() - $musicScrollBar.height()
	musicNum-=d;
	if (musicNum <= 0) {
		musicNum = 0;
	} else if(musicNum > height) {
		musicNum = height
	}
	// console.log(musicNum);
	$musicScrollBar.css({
		top: musicNum + 'px'
	})

	var a = -musicNum / height * musicListHeight;
	// console.log(musicNum / height);
	a = a > 0? 0 : a;
	$musicList.find('ul').css({
		marginTop: a + 'px'
	})	
}

/*// 歌词的滚动
$lyric.get(0).addEventListener('mousewheel',lyricScroll,false)
$lyric.get(0).addEventListener("DOMMouseScroll",lyricScroll,false);
function lyricScroll(e){
	e = e || window.event;
	var d = e.wheelDelta / 10 || -e.detail;
	var lyricListHeight = $lyric.find('ul').height() - $lyric.height()
	var height = $lyricScrollBar.parent().height() - $lyricScrollBar.height()
	lyricNum-=d;
	if (lyricNum <= 0) {
		lyricNum = 0;
	} else if(lyricNum > height) {
		lyricNum = height
	}
	// console.log(lyricNum);
	$lyricScrollBar.css({
		top: lyricNum + 'px'
	})

	var a = -lyricNum / height * lyricListHeight
	// a = a > 0? 0 : a;
	$lyric.find('ul').css({
		marginTop: a + $lyric.height()/2 + 'px'
	})
}*/

// 播放时间
function startTime(a){
	if ( Math.floor(a%60) < 10 && Math.floor(a/60) < 10) {
		currentTime = '0'+ Math.floor(a/60).toString() + ':0' + Math.floor(a%60)
	} else if (Math.floor(a/60) < 10) {
		currentTime = '0'+ Math.floor(a/60).toString() + ':' + Math.floor(a%60)
	} else {
		currentTime = Math.floor(a/60).toString() + ':' + Math.floor(a%60)
	}			
	$startTime.html(currentTime);
}

// 播放进度
function duration(totleTime) {
	// audio.currentTime  当前的时间
	var a = $audio[0].currentTime;
	// console.log(a)
	startTime(a);
	var b = Math.max(a / totleTime * $durationBar.width(),4)
	$durationBar.find('.bar').css({
		width : b + 'px'
	})
	// console.log(b >= $durationBar.width())
	if ( b >= $durationBar.width()) {
		$play.addClass('icon-tushujiemianbofang40').removeClass('icon-tushujiemianzanting40')
		clearInterval(timer1)
	}
	// 自动播放下一曲
	if (a >= totleTime) {
		var index = $audio[0].getAttribute('index');
		index++;
		index = index > length-1? 0 : index
		changeMusic(songlist[index],index)
		$musicList.find('li').eq(index).addClass('on').siblings().removeClass('on');
	}
}

// 进度条的拖动
function dragDuration(totleTime){
	$durationBar.find('.dot').mousedown(function(e){
		e = e || window.event;
		let x,offX;
		var width = $durationBar.width();
		x = e.clientX;
		offX = this.offsetLeft;
		document.onmousemove = function(e){
			clearInterval(timer1)
			e = e || window.event;
			var xNow = offX + e.clientX - x;
			if (xNow < 0) {
				xNow = 0;
			} else if(xNow > width - 4) {
				xNow = width - 4;
			}
			$durationBar.find('.bar').css({
				width: xNow + 4 + 'px'
			})

			// 歌曲的时间
			$audio[0].currentTime = (xNow + 4) / width * totleTime;
			$audio[0].volume = 0;
			startTime($audio[0].currentTime)
			timer1 = setInterval(()=>{
				duration(totleTime)
			},1000)
			// console.log(a)
		}

		document.onmouseup = function(){
			$audio[0].volume = 1;
			this.onmousemove = null;
			this.onmouseup = null;
		}	
	})
};

// 总时间
function endTime(all){
	if ( all %60 < 10 && Math.floor(all /60) < 10) {
		endTimeNum = '0'+ Math.floor(all /60).toString() + ':0' + all %60
	} else if (Math.floor(all /60) < 10) {
		endTimeNum = '0'+ Math.floor(all /60).toString() + ':' + all %60
	} else {
		endTimeNum = Math.floor(all /60).toString() + ':' + all %60
	}
	$endTime.html(endTimeNum)
}

// 暂停、播放按钮的点击事件
(function play() {
	$play.click(function(){
		/*
			$audio[0].paused
				true：暂停
				false：播放

			这里使用箭头函数 this 有问题  指向了 windwos
		 */
		if ($(this).hasClass('icon-tushujiemianzanting40') && !$audio[0].paused) {
			$(this).addClass('icon-tushujiemianbofang40').removeClass('icon-tushujiemianzanting40')
			$audio[0].pause();
			clearInterval(timer1);
		} else {
			$(this).removeClass('icon-tushujiemianbofang40').addClass('icon-tushujiemianzanting40')
			$audio[0].play()
			timer1 = setInterval(()=>{
				duration(totleTime)
			},1000)
			// 确保第一次可以拖动
			dragDuration(totleTime)
			
			// 图片的转动
			imageRotate()
			// 歌词滚动
			lyricScrollAuto()	
		}
	})
})()

// 音量控制
// audio.volume 值为 0 的时候静音
// 声音开启与关闭
$volume.click(function(event) {
	if ($(this).hasClass('icon-yinliang1')) {
		$(this).addClass('icon-jingyin1').removeClass('icon-yinliang1')

		// 当前的音量大小
		nowNolume = audio.volume;
		// 当前 bar 的宽度
		nowWidth = $volumeBar.find('.bar').width();
		console.log(nowWidth);

		audio.volume = 0;
		$volumeBar.find('.bar').css({
			width: 0
		})
	} else {
		$(this).addClass('icon-yinliang1').removeClass('icon-jingyin1')
		audio.volume = nowNolume;
		$volumeBar.find('.bar').css({
			width: nowWidth
		})
	}
});
// 音量大小控制
$volumeBar.find('.dot').mousedown(function(e){
	e = e || window.event;
	let x,offX;
	var width = $volumeBar.width();
	x = e.clientX;
	offX = this.offsetLeft;
	document.onmousemove = function(e){
		e = e || window.event;
		var xNow = offX + e.clientX - x;
		if (xNow < 0) {
			xNow = 0;
			$audio[0].volume = 0;
			$volume.addClass('icon-jingyin1').removeClass('icon-yinliang1');
		} else if(xNow > width - 4) {
			xNow = width - 4;
			$audio[0].volume = 1;
		} else {
			$volume.addClass('icon-yinliang1').removeClass('icon-jingyin1');
			$audio[0].volume = (xNow + 4) / width;
		}
		$volumeBar.find('.bar').css({
			width: xNow + 4 + 'px'
		})
	}

	document.onmouseup = function(){
		this.onmousemove = null;
		this.onmouseup = null;
	}	
})

// 上一曲、下一曲、li点击切换函数
function changeMusic(value,index){
	clearInterval(timer1);
	getLyric(value.songid);
	totleTime = value.seconds;
	$songname.html(value.songname)
	$singer.html(value.singername)
	$audio.attr({
		src: value.url,
		autoplay: true,
		alt: value.songname,
		index: index
	})
	$showImg.attr({
		src: value.albumpic_big
	})
	// 总时间
	endTime(totleTime)
	// 播放时间
	// $startTime.html()
	timer1 = setInterval(()=>{
		// console.log($audio[0].currentTime)
		// $startTime.html($audio[0].currentTime)
		duration(totleTime)
	},1000)
	// 图片的转动
	imageRotate()

	// 拖动
	dragDuration(totleTime)

	$lyric.find('ul').css({
		marginTop: $lyric.height()/2
	})
	// 初始化歌词num
	lyricNum = 0;

	// 修改播放按钮的样式
	$play.removeClass('icon-tushujiemianbofang40').addClass('icon-tushujiemianzanting40')
}

// 图片的转动
function imageRotate(){
	$showImg.css({
		transform: 'rotate('+(audio.currentTime / totleTime) * 720+'deg)'
	})
	requestAnimFrame(imageRotate)
}

// 歌词自动滚动
function lyricScrollAuto(){
	var n = 0;
	$lyric.find('li').each(function(){
		var time = $(this).attr('time');
		time = time.split(':');
		// console.log(parseFloat(time[0])*60 + parseFloat(time[1]),totleTime)
		time = parseFloat(time[0])*60 + parseFloat(time[1]),totleTime;
		if ($audio[0].currentTime > time) {
			n++;
			// console.log(n)
			// 利用
			$(this).css({
				color: 'red',
				fontSize: '26px'
			}).siblings().css({
				color: '#000',
				fontSize: '16px'
			})

			// 此歌曲的滚动条初始化
			$lyricScrollBar.css({
				top: 0
			})
			// 使用 $lyric.find('li').eq(n).height() 确保在英文的时候不会出错
			$lyric.find('ul').css({
				marginTop: $lyric.height()/2 - $lyric.find('li').eq(n).height() * n
			})
		}
	})
	requestAnimFrame(lyricScrollAuto)
}

// 搜索
function search(keywords){
	$.ajax({
	url: 'https://route.showapi.com/213-1?keyword='+keywords+'&page=1&showapi_appid=41250&showapi_sign=c63b5d4717664eb9bf8bac2ddabe704d',
	type: 'GET',
	})
	.done(function(data) {
		data = data.showapi_res_body.pagebean
		console.log(data);
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
}

// 搜索按钮的点击事件
$search.click(function(e) {
	var key = $userinput[0].value;
	key = key.trim();
	if (key != '') {
		search(key)
	} else {
		alert('请输入歌曲名字或者歌手名字')
	}
});


		var canvas = document.getElementById('canvas'),
			mp3 = document.getElementById('audio'),
			c = canvas.getContext('2d'),
            oW,
            oH,
            count,
            // 粒子的速度
            speed = 4,
            // 粒子之间的间距
            range = 80,

            lineAlpha,

            dotteds = [];


        // 获取窗口大小
        function getAndSet(){
            // 获取屏幕的宽高
            oW = window.innerWidth || document.body.clientWidth,
            oH = window.innerHeight || document.body.clientHeight;
            // 设置canvas画布的宽高
            // console.log(oW,oH);
            canvas.width = oW;
            canvas.height = oH;

            // 例子的个数
            count = (oW*oH/5000)|0;
            // console.log(count);
        }
        getAndSet();
        window.onresize = function(){
            getAndSet();
        }


		window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        try {
            var audioContext = new window.AudioContext();
        } catch (e) {
            throw new Error("您的浏览器不支持！");
        }

		//创建节点
        // 创建一个AnalyserNode，它可以用来显示音频时间和频率的数据。
        // Analyser节点不仅提供了时域数据的获取接口，还提供了频域数据的获取接口。可以通过 getByteFrequencyData 方法来获取频域数据，同时域数据的获取一样，使用一个定长的缓冲区来存放获取的数据。这个长度可以在 frequencyBinCount 属性中找到。
		var analyser = audioContext.createAnalyser(),
		// 创建一个MediaElementAudioSourceNode接口来关联HTMLMediaElement. 这可以用来播放和处理来自<video>或<audio> 元素的音频.
            source = audioContext.createMediaElementSource(mp3);
            // console.log(analyser);

		//连接：source → analyser → destination
        source.connect(analyser); //截取音频信号，不写就不会播放
        analyser.connect(audioContext.destination); //声音连接到扬声器


        
        // 粒子
        for (var i = 0; i < count; i++) {
            dotteds.push(new Dotted( i * Math.floor(Math.random() * 361) ))
        }

        function Dotted(hue){
            // 单个例子的起始坐标
            this.x = Math.random()*oW;
            this.y = Math.random()*oH;
            this.a = Math.random()*3 + 1;

            // 单个例子的速度
            this.vx = (Math.random()-.5)*speed;
            this.vy = (Math.random()-.5)*speed;

            this.hue = hue;
        }
        Dotted.prototype.update = function(){
            this.x += this.vx;
            this.y += this.vy;
            

            if(this.x < 0 || this.x > oW) {this.vx *= -1;this.hue = Math.floor(Math.random() * 361);};
            if(this.y < 0 || this.y > oH) {this.vy *= -1;this.hue = Math.floor(Math.random() * 361);};
        }
        function checkDist(a, b, dist){
            var x = a.x - b.x,
                y = a.y - b.y;

            return x*x + y*y <= dist*dist;
        }   

        // Uint8Array : 8 位无符号整数值的类型化数组。内容将初始化为 0。如果无法分配请求数目的字节，则将引发异常。
        // 下面两个必须一起，否者会报错，估计是因为时间的原因
        var data = new Uint8Array(analyser.frequencyBinCount);
        (function render(){
            // console.log(data);
            analyser.getByteFrequencyData(data); //得到音频能量值

            c.clearRect(0,0,oW,oH);
            
            // c.fillStyle = 'rgba(0, 0, 0, .1)';
            // c.fillRect(0,0,oW,oH);

            for (var i = 0; i < dotteds.length; i++) {
                var d1 = dotteds[i];
                var randomX = data[i] / 5;
                var randomY = data[i] / 5;
                if (d1.vx < 0) {
                    randomX = -randomX;
                }
                if (d1.vy < 0) {
                    randomY = -randomY;
                }
                d1.update();

                c.beginPath();
                c.arc((d1.x + randomX),(d1.y + randomY),data[i]/15,0,Math.PI*2,true);
                c.fillText(data[i],(d1.x + randomX),(d1.y + randomY));
                c.fillStyle = 'hsl('+d1.hue+', 80%, 50%)';
                c.fill();
            }
            window.requestAnimationFrame(render);
        })()


// 动画
window.requestAnimFrame = (function(){
  	return  window.requestAnimationFrame       ||
          	window.webkitRequestAnimationFrame ||
          	window.mozRequestAnimationFrame    ||
          	function( callback ){
          	  window.setTimeout(callback, 1000 / 60);
          	};
})();