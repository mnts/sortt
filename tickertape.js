window.tickertape = {
	length: 0,
	sel: '#tickertape>.tape:visible',
	
	build: function(txt, timings){
		$('#tickertape > .tape:visible').remove();
		console.log(tickertape.syllabify(txt));
		var $el = $("<div class='tape'>"+tickertape.syllabify(txt)+"</div>").appendTo('#tickertape');
		
		if(!$el.children('li').last().hasClass('skip'))
			$el.append("<i class='skip'>&nbsp;</i>");
			
		tickertape.length = $el[0].textContent;
		//$el[0].textContent = $el[0].textContent.replace(/\s/g, "&nbsp;");
		
		$el.children('i:not(.skip)').each(function(i){
			$(this).data('time', timings[i])
		});
		
		tickertape.tick();
	},
	
	syllabify: function(txt){
		return '<i>'+txt.replace(/\s/g, "</i><i class='skip'>&nbsp;</i><i>").replace(/\|/g, "</i><i>")+'</i>';
	},
	
	stop: false,
	tick: function(eq){
		if(tickertape.stop) return;
		var $mark = $(tickertape.sel+'>.mark').nextAll('i:not(.skip)').eq(0);
		if(!$mark.length) $mark = $(tickertape.sel+'>i:not(.skip)').eq(eq || Math.round($(tickertape.sel+'>i:not(.skip)').length/2));
		$(tickertape.sel+'>.mark').removeClass('mark');
		$mark.addClass('mark');
		
		var $first = $(tickertape.sel+'>i').first();
		while($first.hasClass('skip')){
			$first.appendTo(tickertape.sel);
			$first = $(tickertape.sel+'>i').first();
		}

		$(tickertape.sel+'>i').first().appendTo(tickertape.sel);
		
		
		window.setTimeout(function(){
			tickertape.tick();
		}, parseFloat($mark.nextAll('i:not(.skip)').eq(0).data('time') || 1)*1000);
		
		// centrate marker
		
		var $sel = $(tickertape.sel).css('margin', 0);
		$('#tickertape').css('left', 0);
		tickertape.center = Math.round($('#tickertape').width()/2);
		
		var dif = tickertape.center-($(tickertape.sel+'>.mark').position().left + ($(tickertape.sel+'>.mark').width()/2));
		var dw = $sel.width() - $('#tickertape').width();
		if(dw>0) $('#tickertape').css('left', dif);else 
		$sel.css('margin-'+((dif>0)?'left':'right'), Math.abs(dif*2));
	},
};

$(function(){
	tickertape.build(
		'* sim|ple start cap first seg|ment loop tes|ting how it works',
		[.5,.4,.6,  .8,  3.1, 1.3, 1.5,1.7, 1.9, .8, .6,  .7, .9, .4]
	);
});