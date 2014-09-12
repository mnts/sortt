window.carousel = {
	gifs_folder: 'gifs',
	tw: 120,
	defaultListFile: 'list.txt',
	
	iframes: {
		'gkvdd': 'http://8.th.ai/fwy/test.html'
	},
	
	iframeThumb: './thumbs/gkvdd.gif',
	
	gameTimeout: 5,
	
	parseUrl: function(url){
		url = url.split('/').slice(0,4).join('/');
		if(url.indexOf('#')+1)
			url = url.substr(0, url.indexOf('#'));
		
		
		if(url.indexOf('index.')+1)
			url = url.substr(0, url.indexOf('index'));
			
		url = url.replace(/\/$/, "");
		
		return url;
	},
	
	add: function(url, name, cont){
		if(!url) return false;
		url = carousel.parseUrl(url);
		var isGif = /[^.]+$/.exec(url)[0] == 'gif';
		//$('#thumbs>span').not(carousel.$thumbs).remove();
		if(!cont) cont = '#thumbs';
		$(cont).children('.clone').remove();
		
		if(!name) name = url.split('/').pop();
		if(isGif){
			if(!document.getElementById('pic_'+name)){
				var img = new Image();
				img.src = url;
				img.id = 'pic_'+name;
				img.name = name;
				$(img).appendTo('#pictures').hide();
			}
				
			//$("<audio loop><source src='./"+carousel.gifs_folder+"/"+name+".mp3'></audio>").appendTo('#pictures')[0].id = 'audio_'+name;
			var $thumb = carousel.createThumb(name, url).appendTo(cont).data('url', url);
		}
		else{
			if(url.indexOf('http://')<0) url = 'http://'+url;
			if(!document.getElementById('pic_'+name))
				$('<iframe scrolling="no"></iframe>').attr({src: url, id: 'pic_'+name}).appendTo('#pictures').hide();
			var $thumb = carousel.createThumb(name, url + '/' + name +'.jpg').appendTo(cont).data('url', url);
		}
		return $thumb;
	},
	
	$thumbs: $(),
	createThumb: function(name, url){
		var $thumb = $(document.createElement('span')).attr('name', name).css('background-image', "url("+url+")").click(function(){
			carousel.click(name);
		});
		
		$thumb.attr('href', url);
		//carousel.$thumbs = carousel.$thumbs.add($thumb);
		
		carousel.supportDrag($thumb);
		
		return $thumb;
	},
	
	supportDrag: function($thumb){
		var name = $thumb.attr('name');
		$thumb.drag("start", function(ev, dd){
			$('#mask').show();
		}).drag(function(ev, dd){
			carousel.drag(name, dd.deltaY, $thumb.parent());
			carousel.slide(dd.deltaX, this.parentElement);
		}).drag("end", function(ev, dd){
			$('#mask').hide();
			$('#thumbs > span[name="'+name+'"]').css('margin-bottom', 0);
			$('#sThumbs > span[name="'+name+'"]').css('background-position-y', 0);
			
			$thumb.parent()[0].slideX = parseInt($thumb.parent().css('margin-left'));
		});
	},
	
	drag: function(name, dy, $cont){
		var $els = $cont.children('span[name="'+name+'"]');
		
		if(Math.abs(dy) < 8) dy = 0;
		
		if($cont[0].id == 'thumbs'){
			if(dy < 0) return;
			$els.css('margin-bottom', -dy);
			if(dy > $els.height()/2){
				var l = $els.length;
				$els.hide('fast', function(){
					$(this).remove();
					if(!--l){
						var $thumb = carousel.add($els.eq(0).attr('href'), null, '#sThumbs');
						carousel.expand('#thumbs');
						carousel.expand('#sThumbs');
						carousel.centrate($thumb);
						$thumb.hide().show('fast');
						$('#mask').hide();
					}
				});
			}
		}
		else
		if($cont[0].id == 'sThumbs'){
			if(dy > 0) return;
			$els.css('background-position-y', dy);
			if(-dy > $els.height()/2){
				var l = $els.length;
				$els.hide('fast', function(){
					$(this).remove();
					if(!--l){
						var $thumb = carousel.add($els.eq(0).attr('href'), null, '#thumbs');
						carousel.expand('#thumbs');
						carousel.expand('#sThumbs');
						carousel.centrate($thumb);
						$thumb.hide().show('fast');
						$('#mask').hide();
					}
				});
			}
		}
	},
	
	centrate: function(el){
		var $el = $(el);
			$cont = $el.parent();
		
		var limit = 30;
		
		while($el.offset().left<0 || $el.offset().left > document.body.offsetWidth/2){
			$cont.children('span:first-child').appendTo($cont);
		}
	},
	
	slideX: 0,
	slide: function(dx, cont){
		var $cont = $(cont || '#thumbs');
		
		if(!$cont[0].slideX)
			$cont[0].slideX = 0;
			
		var x = $cont[0].slideX + dx,
			tw = $cont.children('span:last-child').width()+1;
			
		$cont.css('margin-left', x);
		if(x > tw){
			$cont.children('span:last-child').prependTo($cont);
			$cont[0].slideX -= tw;
		} else
		if(x < -tw){
			$cont.children('span:first-child').appendTo($cont);
			$cont[0].slideX += tw;
		}
		
		if(Math.abs(x) > tw)
			$cont.css('margin-left', 0);
	},
	
	sort: function(){
		$('#thumbs > span.clone').remove();
		$('#thumbs > span').sortElements(function(a, b){
			return a.attributes.name.value > b.attributes.name.value ? 1 : -1;
		});
		carousel.resize();
	},
	
	getList: function(){
		var txt = '';
		$('#thumbs > span:not(.clone)').each(function(){
			url = $(this).data('url');
			if(url)
				txt += url+'\n';
		});
		
		txt += '\n';
		$('#sThumbs > span:not(.clone)').each(function(){
			url = $(this).data('url');
			if(url)
				txt += url+'\n';
		});
		return txt;
	},
	
	download: function(){
		document.getElementById('save').setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(carousel.getList()));
		document.getElementById('save').click();
	},
	
	conts: ['#thumbs', '#sThumbs'],
	loadList: function(listTxt, cont){
		carousel.bound = undefined;
		$('#thumbs,#sThumbs').empty();
		
		var ci = 0;
		listTxt.split('\n').forEach(function(url){
			if(!url) return ++ci;
			if(!carousel.conts[ci]) return 0;
			carousel.add(url.split(' ')[0], null, carousel.conts[ci]);
		});

		carousel.bound = Math.abs(parseInt($('#thumbs').css('left')));	// left css padding
		
		//if(!cont) carousel.sort();
		//else carousel.expand(cont);
	},
	
	click: function(name){
		$('#thumbs > .active').removeClass('active');
		$('#thumbs > span[name="'+name+'"]').addClass('active');
		$('#pictures > img, #pictures > iframe').hide();
		var $frame = $('#pic_'+name).show();
		
		if(carousel.frames >= 2){
			if(!$frame.prev().show().length)
				$('#pictures > iframe:last-child').prependTo('#pictures').show();
		}
		
		if(carousel.frames >= 3){
			if(!$frame.next().show().length)
				$('#pictures > iframe:first-child').appendTo('#pictures').show();
		}
		
		$('#pictures > audio').each(function(){
			this.pause();
		});
	},
	
	limit: 555,
	snap: 100,
	thumbsMaxH: 133,
	listStartH: 500,
	minimizeTH: false,
	resize: function(h){
		var bodyH = document.body.offsetHeight;
		var span = span || bodyH - h - 20 || $('#thumbs').height() || $('#thumbs>span').height();
		carousel.snap = bodyH*(bodyH>carousel.limit?0.05:0.11);
		if(span > 700 || span < 0 || carousel.minimizeTH) return;
		
		if(span>20 && carousel.snap > span){
			span = 1;
			h = bodyH - 20;
			carousel.minimizeTH = true;
		}
		
		if((100-h*100/bodyH) > 60){
			if(carousel.frames == 2){
				var $first = $('#pictures > iframe:visible').eq(0),
					$frame = $('#pictures > iframe:visible').eq(1);
				$('#pictures > iframe').css('width', '33%').hide();
				$first.show();
				$frame.css('width', '34%').show();
				if(!$frame.next().show().length){
					$('#pictures > iframe:first-child').appendTo('#pictures').show();
				}
				carousel.frames = 3;
			}
		}
		else
		if((100-h*100/bodyH) > 40){
			if(!carousel.frames || carousel.frames >= 1 ){
				var $frame = $('#pictures > iframe:visible');
				if($frame.length > 1) $frame = $frame.eq(1);
				$('#pictures > iframe').css('width', '50%').hide();
				$frame.show();
				if(!$frame.prev().show().length){
					$('#pictures > iframe:last-child').prependTo('#pictures').show();
				}
				carousel.frames = 2;
			}
		}else
		if(carousel.frames > 1){
			$('#pictures > iframe').css('width', '100%');
			$('#pictures > iframe:visible').eq(1).siblings().hide();
			carousel.frames = 1;
		}
		
		if(span > carousel.listStartH){
			if(carousel.$list.is(':hidden'))
				carousel.listarea.value = carousel.getList();
			
			carousel.$list.show().css('top', h + 18);
		}
		else{
			if(carousel.$list.is(':visible')){
				if(carousel.listarea.value) carousel.loadList(carousel.listarea.value);
				carousel.expand('#sThumbs');
				carousel.$list.hide();
			}
		}
		
		if(span > carousel.thumbsMaxH){
			if(carousel.$sThumbs.is(':hidden')){
				carousel.$sThumbs.show();
				carousel.expand('#sThumbs');
			};
			carousel.$sThumbs.css('top', h + 20 + carousel.thumbsMaxH);
		}else
			$('#sThumbs').hide();
		
		
		if(span > carousel.thumbsMaxH && span < carousel.thumbsMaxH + carousel.$sThumbs.height()){
			span = carousel.thumbsMaxH;
		}
		else if(span > carousel.thumbsMaxH + carousel.$sThumbs.height()-1){
			span -= carousel.$sThumbs.height();
			carousel.$sThumbs.css('top', h + 20 + span);
		}
		
		var h = isNaN(h)?(bodyH - span - 20):h;
		$('#thumbs').height(span);
		$('#imgH').html('#pictures,#mask{height:'+(h)+'px} #thumbs>span{width:'+Math.round(span)+'px;}');
		
		carousel.expand();
	},
	
	expand: function(cont){
		var $cont = $(cont || '#thumbs');
		var tw = $cont.children('span:first-child').width() + 1;
		while(($cont.children('span').length * tw) < $('body').width() + carousel.bound*2){
			$cont.children('span:not(.clone)').clone(true).addClass('clone').appendTo($cont);
		}
		
		carousel.slideX = 0;
	},
	
	replay: function(){
		var audio = $('#audio_'+$('#pictures').children(':visible')[0].name)[0];
		if(audio){
			audio.currentTime=0;
			audio.play();
		};
	}
};

jQuery.fn.sortElements = (function(){
    var sort = [].sort;
    return function(comparator, getSortable){
        getSortable = getSortable || function(){return this;};
 
        var placements = this.map(function(){
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
 
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
 
            return function() {
                if (parentNode === this)
                    throw new Error("You can't sort elements if any one is a descendant of another.");
 
                parentNode.insertBefore(this, nextSibling);
                parentNode.removeChild(nextSibling);
 
            };
        });
 
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
    };
})();

String.prototype.norm = function (){
	var url = this;
	var preserveNormalForm = /[,_`;\':-]+/gi
	url = url.replace(preserveNormalForm, ' ');

	url = url.replace(/[^a-z|^0-9|^-|\s]/gi, '').trim();
	url = url.replace(/\s+/gi, '_');
	console.log(url);
	return url;
}

$(function(){
	function checkHash(hash){
		if(typeof hash != 'string') hash = window.location.hash.replace('#', '') || carousel.defaultListFile;
		$.get(hash, function(data){
			carousel.loadList(data);
			carousel.resize();
			$('#thumbs > span:first-child').click();
		});
	};
	checkHash();
	
	carousel.$list = $('#list');
	carousel.listarea = $('#list>textarea:first-child')[0];
	
	carousel.$sThumbs = $('#sThumbs');
	
	$(window).on('hashchange', checkHash);
	
	$('#pictures').click(carousel.replay);
	
	function cancel(e){
		if (e.preventDefault) e.preventDefault(); // required by FF + Safari
		e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
		return false; // required by IE
	}
	
	
	document.body.addEventListener('dragover', cancel);
	document.body.addEventListener('dragenter', cancel);
	document.body.addEventListener('drop', function(ev){
		var url = ev.dataTransfer.getData('Text');
		carousel.add(url).click();
		carousel.resize();
		ev.preventDefault();
		return false
	}, false);
	
	/*
	$(document).keyup(function(e) {
		if (e.keyCode == 13 || e.keyCode == 32) // enter , spacebar
			carousel.replay();
		if(e.keyCode == 27){ 					//esc
			$('#pictures > audio').each(function(){
				this.pause();
			});
		}
	});
	*/

	var ctrl = false, shift = false;
	$(document).keydown(function(ev){
		if(ev.ctrlKey)
			ctrl = true;
			
		if(ev.keyCode == 16)
			shift = true;
		
		if(ctrl && shift && ev.keyCode == 83){
			console.log('save');
			carousel.download();
			ev.preventDefault();
			return false;
		}
	});
	
	$(document).keyup(function(e){
		shift = ctrl = false;
	});
	
	
	var timer;
	$(document).keydown(function(ev){
		if(!ctrl && !shift && ev.keyCode == 83){
			$('#game').show();
			$('#player').hide();
			
			if(timer) clearTimeout(timer);
			timer = setTimeout(function(){
				$('#game').hide();
				$('#player').show();
			}, carousel.gameTimeout * 1000);
		}
	});
	
	$(window).resize(carousel.resize);
	//$('#thumbs').height('22%');
	carousel.resize();
	
	setInterval(function(){
		document.body.click();
	}, 100);
	
	$('#resize, #thumbs').hover(function(){
		if(!carousel.minimizeTH || $('#mask').is(':visible')) return;
		carousel.minimizeTH = false;
		$('#thumbs').height(carousel.snap);
		carousel.resize();
	});
	
	$('#resize').drag("start", function(ev, dd){
		dd.limit = $('body').offset();
		dd.start = $('#pictures').height();
		dd.span = $('#thumbs').height();
		$('#mask').show();
	}).drag(function(ev, dd){
		carousel.resize(dd.start + dd.deltaY);
	}).drag('end', function(){
		$('#mask').hide();
	});
});
