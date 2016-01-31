$(function () {

	var Styleguide = function($element)
	{
		this.$element = $element;
		this.init();

		$(window).resize($.proxy(this.onResize, this));
	}

	Styleguide.prototype = {

		breakpoints: [768,992,1200],
		previews: [],
		previewWidth: '100%',
		previewWidthCalc: 0,
		loadPreviewsAtStart: new Array(3),

		init: function()
		{
			for(var i=0;i<this.loadPreviewsAtStart.length;i++){ this.loadPreviewsAtStart[i] = i; }

			this.showLoader();

			this.initMenu();
			this.initViewportControls();
			this.initTabs();

			$('[data-preview="frame"]', this.$element).each($.proxy(function(i, el) { 
			   this.previews.push($(el));
			},this));
			this.initPreviewFrames();

			this.hideLoader();

			hljs.initHighlightingOnLoad();
		},

		onResize: function()
		{
			if (this.getBreakpoint() > 0) {
				$.sidr('open', 'styleguideSections');
			} else {
				$.sidr('close', 'styleguideSections');
			}
			//this.fitFramesToContents();

			this.initResizables();
		},

		initMenu: function()
		{
			$('.styleguide__toolbar__menu').sidr({
				name: "styleguideSections",
				speed: 200
			});
			if (this.getBreakpoint() > 0) {
				$.sidr('open', 'styleguideSections');
			}
			window.setTimeout(function(){
				$('body').removeClass('pending');
			}, 200);

		},

		initResizableFrames: function()
		{
			this.resizePreviews();
		},

		initViewportControls: function()
		{
			// initialize range slider
			var max = 100,
				min = 0;
		    $( "#styleguideViewportRange" ).slider({
		      value: max,
		      min: min,
		      max: max,
		      range: "min",
		      slide: $.proxy(this.onViewportResize, this),
		      start: $.proxy(this.onViewportResizeStart, this),
		      stop:$.proxy(this.onViewportResizeStop, this)
		    });
		    $( "#styleguideViewportWidth" ).val( $( "#styleguideViewportRange" ).slider( "value" ) );
			this.setPreviewWidth(100, true);

			$('[data-viewport]').on('click', $.proxy(function(evt){
				var val = $(evt.currentTarget).data('width');
				if (val.toString().indexOf('%') != -1) {
					val = parseInt(val);
				} else {
					val = $(evt.currentTarget).data('width')/$( "#styleguideViewportRange" ).width()*100;
				}
				$( "#styleguideViewportRange" ).slider('value', val );
				this.setPreviewWidth(val, true);
	        	this.resizePreviews();
	        	//this.fitFramesToContents();
			}, this));

			this.refreshViewportControls();
		},

		onViewportResize: function( event, ui ) {
	        $( "#styleguideViewportWidth" ).val( ui.value );
	        this.setPreviewWidth(ui.value, true);
	        this.resizePreviews();
	    }, 

	    onViewportResizeStart: function( event, ui ) {
	    	this.$element.addClass('styleguide--resizing');
	    }, 

	    onViewportResizeStop: function( event, ui ) {
	    	this.$element.removeClass('styleguide--resizing');
	    	//this.fitFramesToContents();
	    }, 

		initTabs: function()
		{
			$('.nav-tabs a').click(function (e) {
			  e.preventDefault()
			  $(this).tab('show')
			})
		},

		initPreviewFrames: function()
		{
			$(this.previews).each($.proxy(function(i, $el){
				var $frame = $('iframe', $el).show();
				this.fitFrameToContent($frame, $el);
				//$frame.contens().requestAnimationFrame(this.fitFrameToContent);
				$frame.on('load', $.proxy(function(i, evt){
				    //window.setTimeout($.proxy(function(){
						this.fitFrameToContent($(evt.currentTarget), $el);
						this.validatePreview($el);
						$el.removeClass("loading");
						this.loadPreview([i+1,i+2,i+3]);
					//}, this), 50);
				},this,i));
			},this));

			this.loadPreview(this.loadPreviewsAtStart);
			this.initResizables();
		},

		loadPreview: function(index, force)
		{
			if (!(index instanceof Array)) {
				index = [index];
			}
			for(i=0;i<index.length;i++){
				if (this.previews[index[i]]) {
					var $frame = $('iframe', this.previews[index[i]]);
					if ( $frame.attr('src') != $frame.data('src') || force ) {
						$frame.attr('src', $frame.data('src'));
					}
				}
			}
		},

		updatePreviewWidthIndicators: function($el)
		{
			if ($el) {
				$('[data-resize="width"]', $el).html($el.width());
				return;
			}
			$(this.previews).each($.proxy(function(i, $el){
	    		$('[data-resize="width"]', $el).html($el.width());
	    	}, this));
		},

		onResizableResize: function( event, ui)
		{
			this.updatePreviewWidthIndicators(ui.element);
		},

		initResizables: function()
		{
			$(this.previews).each($.proxy(function(i, $el){

				if ($el.resizable( "instance" )) {
					$el.resizable( "option", "maxWidth", this.getMaxResizeWidth() );
					return;
				}

				$el.resizable({
			      handles: "e",
			      start: $.proxy(this.onViewportResizeStart, this),
			      stop: $.proxy(this.onViewportResizeStop, this),
			      resize: $.proxy(this.onResizableResize, this),
			      maxWidth: this.getMaxResizeWidth()
			    });

			}, this));
		},

		// should obviously be more generic
		getMaxResizeWidth: function()
		{
			return $( "#styleguideViewportRange" ).width();
		},

		// set heights according to contents
		fitFramesToContents: function()
		{
			$(this.previews).each($.proxy(function(i, $el){
				this.fitFrameToContent($('iframe', $el), $el);
			},this));
		},

		fitFrameToContent: function($frame, $parent)
		{
			var win = $frame.get(0).contentWindow || $frame.get(0),
				doc = $frame.get(0).contentDocument || $frame.get(0).contentWindow.document;
				//height = $($frame.contents()).find('body').outerHeight(true);
			if (doc && doc.body) {
				height = doc.body.scrollHeight;
				if (height != $parent.height()) {
					$parent.height(height);
				}
			}
			
			win.requestAnimationFrame($.proxy(this.fitFrameToContent, this, $frame, $parent));
		},

		getBreakpoint: function()
		{
			if ($(window).width() >= this.breakpoints[1] ) {
				return 1;
			}
			if ($(window).width() >= this.breakpoints[2] ) {
				return 2;
			}
			if ($(window).width() >= this.breakpoints[3] ) {
				return 3;
			}

			return 0;
		},

		showLoader: function()
		{
			this.$element.addClass('styleguide--loading');
		},

		hideLoader: function()
		{
			this.$element.removeClass('styleguide--loading');
		},

		resizePreviews: function()
		{
			$(this.previews).each($.proxy(function(i, $el){
				$el.width( this.previewWidth );
			}, this));

			this.refreshViewportControls();
			this.updatePreviewWidthIndicators();
		},

		setPreviewWidth: function(val, usePercentage)
		{
			if (usePercentage) {
				this.previewWidth = val + "%"; // todo: dynamisch den Pixelwert setzen
				this.previewWidthCalc = (val/100)*$( "#styleguideViewportRange" ).width();
				return;
			}

			this.previewWidth = val;
			this.previewWidthCalc = val;
		},

		refreshViewportControls: function()
		{
			$('[data-viewport]').each($.proxy(function(i, el){
				var $el = $(el),
					min = $el.data('viewport'),
					max = false,
					active = false;


				if ($el.next() && $el.next().data('viewport')) {
					var max = parseInt($el.next().data('viewport'))-1;
				} 
					
				if (max) { 
					if (this.previewWidthCalc >= min && this.previewWidthCalc < max) { active = true; }
				} else {
					if (this.previewWidthCalc >= min) { active = true; }
				}

				if (active) {
					$el.addClass('active');
				} else {
					$el.removeClass('active');
				}
			}, this));
		},

		/*
		 * Automatically send all generated markup to the validation service API at w3c
		 * @todo: Does this have a request limit? Maybe validation should only commence on demand...
		 */
		validatePreviews: function()
		{
			$(this.previews).each($.proxy(function(i, $el){
				this.validatePreview($el);
			}, this));
		},

		validatePreview: function($element)
		{
			var frame = $('iframe', $element).get(0),
			    $parent = $element.closest('.styleguide__block');

			if ($('[data-validation="results"]', $parent).length == 0) {
				return;
			}

			var frameDocument = (frame.contentWindow || frame.contentDocument);
			frameDocument = frameDocument.document;
			var serializer = new XMLSerializer();
			var html = serializer.serializeToString(frameDocument);

			$.ajax("https://validator.nu/?out=json", {
			    method: 'post',
			    contentType: 'text/html; charset=utf-8',
			    data: html,
			    async: true,
			    success: function(response){
			    	if (response && response.messages) {
			    		var errors = [], mess = '';
			    		for (var x=0;x<response.messages.length;x++) {
			    			if (response.messages[x].type == 'error') {
			    				mess = $('<span class="error__message" />').text(response.messages[x].message);
			    				extract = $('<code class="error__extract" />').text(response.messages[x].extract);
			    				errors.push(mess);
			    				$parent.addClass('notvalid');
			    				$('<li class="error" />').html(mess).append(extract).appendTo($('[data-validation="results"]', $parent));
			    			}
			    		}
			    		if (errors.length == 0) {
			    			$parent.removeClass('notvalid').addClass('valid');
			    			$('[data-validation="results"]', $parent).html('<li class="success">No validation errors found.</li>');
			    		}
			    	}
			      
			    }
			});
		}
	}

	$(document).ready(function(){
		$('.styleguide').each(function(i, el) {
			$(el).data('styleguide', new Styleguide($(el)));
		});
	});
});