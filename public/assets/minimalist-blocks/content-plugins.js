function _tabs(n) {
    var html = '';
    for (var i = 1; i <= n; i++) {
        html += '\t';
    }
    return '\n' + html;
}

// source: https: //stackoverflow.com/questions/2255689/how-to-get-the-file-path-of-the-currently-executing-javascript-code
function _path() {
    var scripts = document.querySelectorAll('script[src]');
    var currentScript = scripts[scripts.length - 1].src;
    var currentScriptChunks = currentScript.split('/');
    var currentScriptFile = currentScriptChunks[currentScriptChunks.length - 1];
    return currentScript.replace(currentScriptFile, '');
}
var _snippets_path = _path();

var data_basic = {
    'snippets': [

        // IBK 금융 컴포넌트는 우측 ComponentPanel(금융 컴포넌트 탭)에서 제공합니다.
        // ── 일반 기본 블록 ─────────────────────────────────────────────────


		{
		    'thumbnail': 'preview/basic-03.png',
		    'category': '120',
		    'html': `
			<h1>Heading 1 Text Goes Here.</h1>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
			`	
		},
		{
		    'thumbnail': 'preview/basic-05.png',
		    'category': '120',
		    'html': `
			<img src="assets/minimalist-blocks/images/ai-4fA9e.jpg" alt="">
			`	
		},
		{
		    'thumbnail': 'preview/basic-06.png',
		    'category': '120',
		    'html': `
			<div class="row">
				<div class="column half">
						<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
						when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
				</div>
				<div class="column half">
						<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
						when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
				</div>

			</div>
			`	
		},


        /* PLUGINS */
        {
		    'thumbnail': 'preview/plugin-gallery-01.png',
		    'category': '120',
		    'html': `
<div class="row">
    <div class="column">
        <div data-cb-type="media-grid" data-cb-columns="3" class="grid-sortable" data-cb-gap="16" data-cb-rounded="8" data-cb-content-theme="light">
            <div class="gallery-item">
                <img src="assets/minimalist-blocks/images/ai-MILpb.jpg" alt="Sample Title">
                <div class="item-content">

                    <h4>Sample Title</h4>
                    <div>Short descriptive text goes here</div>
                </div>
            </div>
            <div class="gallery-item">
                <img src="assets/minimalist-blocks/images/ai-2JkRP.jpg" alt="Sample Title">

            </div>
            <div class="gallery-item">
                <img src="assets/minimalist-blocks/images/ai-4mQ3H.jpg" alt="Sample Title">
                <div class="item-content">

                    <h4>Sample Title</h4>
                    <div>Short descriptive text goes here</div>
                </div>
            </div>
            <div class="gallery-item">
                <img src="assets/minimalist-blocks/images/ai-j6Oyc.jpg" alt="Sample Title">
                <div class="item-content">

                    <h4>Sample Title</h4>
                    <div>Short descriptive text goes here</div>
                </div>
            </div>
            <div class="gallery-item"><img src="assets/minimalist-blocks/images/ai-lMoX0.jpg" alt=""></div>
            <div class="gallery-item"><img src="assets/minimalist-blocks/images/ai-xPlfu.jpg" alt=""></div>
        </div>
    </div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-12.png',
		    'category': '120',
		    'html': `
<div class="row">
    <div class="column half" style="width: 57.6087%; flex: 0 0 auto;"><img src="assets/minimalist-blocks/images/ai-4DbMv.jpg" alt=""></div>
    <div class="column half flex justify-center flex-col items-center" style="width: 100%;">
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-textslider.png',
		    'category': '120',
			'type': 'glide',
		    'html': `
			<div class="row">
                    <div 
						class="column full is-dark-text" 
						data-noedit 
						data-module="text-slider" 
						data-module-desc="Text Slider" 
						data-dialog-width="1000px" 
						data-dialog-height="570px" 
						data-html="

							${encodeURIComponent(`

							<div id="_style_{id}" style="display:none">
                                #{id} .glide__arrow svg {
                                    fill: #000 !important;
                                }
								.plr { padding-left:40px;padding-right:40px; }
								.plr .glide__arrow--left { left:-70px !important; }
								.plr .glide__arrow--right { right:-70px !important;  }
			
								.pb { padding-bottom:40px; }
								.pb .glide__bullets { bottom:-20px }
			
								@media all and (max-width: 760px) {
									.plr { padding-left:0;padding-right:0; }
									.plr.m-arrows { padding-left:40px;padding-right:40px; }
			
									.pb { padding-bottom:30px; }
									.pb .glide__bullets { bottom:-15px }
								}
							</div>
							<div class="plr">
								<div id="{id}" class="glide" style="display:none">
									<div data-glide-el="track" class="glide__track">
										<div class="glide__slides space-x-3">
											<div class="glide__slide">
												<div class="is-subblock flex-col" data-subblock>
													<h3 class="font-semibold">Item 1</h3>
													<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
												</div>
											</div>
											<div class="glide__slide">
												<div class="is-subblock flex-col" data-subblock>
													<h3 class="font-semibold">Item 2</h3>
													<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
												</div>
											</div>
											<div class="glide__slide">
												<div class="is-subblock flex-col" data-subblock>
													<h3 class="font-semibold">Item 3</h3>
													<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
												</div>
											</div>
											<div class="glide__slide">
												<div class="is-subblock flex-col" data-subblock>
													<h3 class="font-semibold">Item 4</h3>
													<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
												</div>
											</div>
										</div>
									</div>
								
									<div class="glide__arrows" data-glide-el="controls">
										<button class="glide__arrow glide__arrow--left" data-glide-dir="<" style="left:-60px">
											<svg class="is-icon-flex">
												<use xlink:href="#ion-ios-arrow-left"></use>
											</svg>
										</button>
										<button class="glide__arrow glide__arrow--right" data-glide-dir=">" style="right:-60px">
											<svg class="is-icon-flex">
												<use xlink:href="#ion-ios-arrow-right"></use>
											</svg>
										</button>
									</div>
								</div>
							</div>
							
							<script>
								var css = document.querySelector('#_style_{id}').innerHTML;
								var head = document.getElementsByTagName('head')[0];
								var s = document.createElement('style');
								s.appendChild(document.createTextNode(css));
								head.appendChild(s);
				
								var svgDef = '<svg width="0" height="0" style="position:absolute;display:none;">' +
									'<defs>' +
										'<symbol viewBox="0 0 512 512" id="ion-ios-arrow-left">' +
											'<path d="M352 115.4L331.3 96 160 256l171.3 160 20.7-19.3L201.5 256z"></path>' +
										'</symbol>' +
										'<symbol viewBox="0 0 512 512" id="ion-ios-arrow-right">' +
											'<path d="M160 115.4L180.7 96 352 256 180.7 416 160 396.7 310.5 256z"></path>' +
										'</symbol>' +
									'</defs>' +
								'</svg>';
								var pre = document.querySelector('#ion-ios-arrow-left');
								if(!pre) {
									document.body.insertAdjacentHTML('beforeend', svgDef);
								}
								
								var docReady = function(fn) {
									var stateCheck = setInterval(function() {
										if (document.readyState !== 'complete') return;
										clearInterval(stateCheck);
										try {
											fn()
										} catch (e) {}
									}, 1);
								};
								docReady(function() {

									let myslider = document.querySelector("#{id}");

									let swap = true;
									if(myslider.closest('.is-edit')) swap=false;

                                    setTimeout(()=>{

                                        myslider.style.display = '';
                                        var _{id} = new Glide('#{id}', {
                                            type: 'carousel',
                                            autoplay: false,
                                            animationDuration: 1000,
                                            gap: 40,
                                            perView: 2,
                                            hoverpause: true,
                                            arrow: true,
                                            dots: false,
                                            breakpoints: {
                                                760: { perView: 1, gap: 0 }
                                            },
                                            swipeThreshold: swap, dragThreshold: swap
                                        }).mount();
                                        _cleanClonedItems();

                                    }, 400);
								});
							
                                function _cleanClonedItems() {
                                    var clones = document.querySelectorAll(".glide__slide--clone");
                                    Array.prototype.forEach.call(clones, function(clone){
                                        try {
                                            clone.removeAttribute("data-subblock");
                                            clone.childNodes[0].removeAttribute("data-subblock");
                                        } catch(e) {}
                                    });
                                }
							</script>
							
							`)}

                        "

						data-settings="

							${encodeURIComponent('' +
							'{' +
								'"type": "carousel",' +
								'"autoplay":false,' +
								'"animationDuration":1000,' +
								'"gap":40,' +
								'"perView":2,' +
								'"hoverpause":true,' +
								'"arrow":true,' +
								'"arrowColor": "#000",' +
								'"dots":false,' +
								'"fit":""' +
							'}')}

						">

                    </div>
                </div>`	
		},
		{
		    'thumbnail': 'preview/ai-B2h6J.webp',
		    'category': '120',
		    'html': `
			<video style="width: 100%;" loop="" autoplay="">
				<source src="assets/minimalist-blocks/images/ai-cQ5ST.mp4" type="video/mp4">
			</video>
			`	
		},
		{
		    'thumbnail': 'preview/basic-slider2.png', // 'preview/basic-slider.webp',
		    'category': '120',
		    'html': `
				<div data-cb-type="swiper-slider" data-cb-loading="fade" data-cb-effect="slide" data-cb-aspect-ratio="16/9" data-cb-autoplay="false" data-cb-loop="true" data-cb-slides-per-view="1" data-cb-speed="800" data-cb-space-between="0" data-cb-navigation="true" data-cb-pagination="true" data-cb-delay="3000" data-cb-text-position="position-bottom-left" style="--top-overlay-opacity: 0; --bottom-overlay-opacity: 0.4; --aspect-ratio: 16/9; --slider-height: 600px; --accent-color: #1a1a1a; --slide-background: #ffffff; --border-radius: 10px; --swiper-navigation-border-radius: 50%; --zoom-scale: 1.08; --swiper-navigation-size: 48px; --swiper-navigation-font-size: 16px; --swiper-navigation-sides-offset: 20px; --text-max-width: 400px;" data-cb-top-overlay-opacity="0" data-cb-bottom-overlay-opacity="0.4" data-cb-transition-speed="800" data-cb-navigation-style="solid" data-cb-pagination-style="rounded-rectangle" data-layout="split" data-cb-rounded-corners="10" data-cb-navigation-rounded-corners="50" data-cb-zoom-scale="108" data-cb-zoom-effect="false" data-cb-pause-on-hover="false" data-cb-navigation-button-size="48" data-cb-navigation-arrow-size="16" data-cb-navigation-offset="20" data-cb-text-max-width="400">
                    <div class="swiper">
                        <div class="swiper-wrapper">

                            <div class="swiper-slide">
                                <div class="slide-image is-inview"><video autoplay="" loop="" muted="" playsinline="" data-src-desktop="assets/minimalist-blocks/images/ai-xuSLh.mp4">
                                        <source src="assets/minimalist-blocks/images/ai-xuSLh.mp4" type="video/mp4">
                                    </video></div>
                            </div>
                            <div class="swiper-slide">
                                <div class="slide-image">
                                    <img src="assets/minimalist-blocks/images/ai-mQEub.jpg" alt="New Slide">
                                    <div class="slide-overlay"></div>
                                    <div class="slide-caption">
                                        <div class="is-subblock edit">
                                            <h3 class="slide-caption-title">Discover Timeless Elegance</h3>
                                            <p class="slide-caption-description">Experience the perfect blend of minimalist design and exceptional craftsmanship in our latest collection.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-pagination"></div>
                        <div class="swiper-button-next"></div>
                        <div class="swiper-button-prev"></div>
                    </div>
                </div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-18.png',
		    'category': '120',
		    'html': `
			<div class="row">
				<div class="column third">
					<h2 class="size-48">01</h2>
					<div class="spacer height-20"></div>
					<h3 class="size-19 uppercase leading-12">Step One</h3>
					<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
				</div>
				<div class="column third">
					<h2 class="size-48">02</h2>
					<div class="spacer height-20"></div>
					<h3 class="size-19 uppercase leading-12">Step Two</h3>
					<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
				</div>
				<div class="column third">
					<h2 class="size-48">03</h2>
					<div class="spacer height-20"></div>
					<h3 class="size-19 uppercase leading-12">Step Three</h3>
					<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
				</div>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-20.png',
		    'category': '120',
		    'html': '<hr>'
		},
		{
		    'thumbnail': 'preview/basic-youtube.png',
		    'category': '120',
		    'html': `
				<div class="embed-responsive embed-responsive-16by9">
            		<iframe width="560" height="315" src="https://www.youtube.com/embed/TSxZRHwZam8?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            	</div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-map.png',
		    'category': '120',
		    'html': `
				<div class="embed-responsive embed-responsive-16by9">
					<iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" class="mg1" src="https://maps.google.com/maps?q=Melbourne,+Victoria,+Australia&amp;hl=en&amp;sll=-7.981898,112.626504&amp;sspn=0.009084,0.016512&amp;oq=melbourne&amp;hnear=Melbourne+Victoria,+Australia&amp;t=m&amp;z=10&amp;output=embed"></iframe>
				</div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-audio.png',
		    'category': '120',
		    'html': `
				<div style="display:flex;width:100%;position:relative;margin:15px 0;background: transparent;">
					<audio controls="" style="width:100%">
						<source src="assets/minimalist-blocks/example.mp3" type="audio/mpeg">
						Your browser does not support the audio element.
					</audio>
				</div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-form.png',
		    'category': '120',
			'type': 'form',
		    'html': `
				<div class="row">
                    <div class="column" data-noedit 
                    data-dialog-width="1600px" 
                    data-dialog-height="85vh" 
                    data-module="form-builder" 
                    data-module-desc="Form Builder" 
                    data-html="

							${encodeURIComponent(`
                            <div id="_style_{id}" style="display:none">
                                #{id} {
                                    transition: all 0.3s ease-out;
                                    height: auto;
                                }
                                #{id}.collapsed {
                                    overflow: hidden;
                                    height: 0;
                                }
                                #status_{id} {
                                    transition: all 0.3s ease-out;
                                    height: auto;
                                }
                                #status_{id}.collapsed {
                                    overflow: hidden;
                                    height: 0;
                                }
                            </div>
                            <form id="form_{id}" method="POST" action="/formsubmission" style="padding: 25px 0 20px">
                                <div id="{id}"></div>

                                <div id="status_{id}" class="collapsed"></div>
                            </form>
                            
                            <script>
                            var css = document.querySelector('#_style_{id}').innerHTML;
                            var head = document.getElementsByTagName('head')[0];
                            var s = document.createElement('style');
                            s.appendChild(document.createTextNode(css));
                            head.appendChild(s);
                            
                            var docReady = function(fn) {
                                var stateCheck = setInterval(function() {
                                    if (document.readyState !== "complete") return;
                                    clearInterval(stateCheck);
                                    try {
                                        fn()
                                    } catch (e) {}
                                }, 1);
                            };
                  
                            docReady(function() {
                    
                                var elm = document.getElementById('{id}');
                                var viewer = new FormViewer(elm);

                                let json = {
    "title": "Let’s Build Something Cool!",
    "description": "Fuel your creativity with ease.",
    "elements": [
        {
            "title": "Your Name:",
            "name": "your_name",
            "type": "short-text",
            "isRequired": true,
            "placeholder": "Enter your name"
        },
        {
            "title": "Your Best Email:",
            "name": "email",
            "type": "email",
            "isRequired": true,
            "placeholder": "Enter your email"
        }
    ],
    "useSubmitButton": true,
    "submitText": "Let’s Go!"
};
                                
                                const initialFormData = JSON.stringify(json);
                                viewer.view(initialFormData); 

                                var statusInfo = document.querySelector('#status_{id}');

                                var form = document.querySelector('#form_{id}');

                                async function handleSubmit(event) {
                                    event.preventDefault();

                                    var btnSend = form.querySelector('.btn-submitform');
                                    
                                    btnSend.innerHTML = '<span class="loading-icon"><svg class="animate-spin" style="margin-right:7px;width:20px;height:20px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></span>Submit';

                                    var data = new FormData(form);

                                    fetch(form.action, {
                                        method: form.method,
                                        body: data,
                                        headers: {
                                            'Accept': 'application/json'
                                        }
                                    })
                                    .then(response=>response.json())
                                    .then(data=>{
                                        if(!data.error) {
                                            statusInfo.innerHTML = '<div class="text-center pt-4 pb-4"><i class="bi bi-send-check size-64"></i>' +
                                            '</div><div class="leading-14 text-center size-38 pb-4">Thanks for your submission!</div>';
                                            form.reset();

                                            elm.classList.add('collapsed');
                                            setTimeout(function(){
                                                statusInfo.classList.remove('collapsed');
                                            },300);

                                        } else {
                                            statusInfo.innerHTML = '<div class="leading-14 text-center size-38 pt-4 pb-4">Oops! There was a problem submitting your form.</div>';
                                        
                                            // elm.classList.toggle('collapsed');
                                            setTimeout(function(){
                                                // statusInfo.innerHTML = data.error;
                                                statusInfo.classList.remove('collapsed');
                                            },300);
                                        }

                                        btnSend.innerHTML = 'Submit';
                                    });
                                }

                                form.addEventListener('submit', handleSubmit);
                          
                            });
                            </script>					
							
							`)}

                        " 
						
						data-settings="

							${encodeURIComponent(`
                            {
                              "json": {
    "title": "Let’s Build Something Cool!",
    "description": "Fuel your creativity with ease.",
    "elements": [
        {
            "title": "Your Name:",
            "name": "your_name",
            "type": "short-text",
            "isRequired": true,
            "placeholder": "Enter your full name"
        },
        {
            "title": "Your Best Email:",
            "name": "email",
            "type": "email",
            "isRequired": true,
            "placeholder": "Enter your email"
        }
    ],
    "useSubmitButton": true,
    "submitText": "Let’s Go!"
},
                                "thankYouMessage": "Thanks for your submission!",
                                "errorMessage": "Oops! There was a problem submitting your form.",
                                "buttonText": "Submit",
                                "hideHeader": false,
                                "formAction": "/formsubmission"
                            }
                          `)}
						
						">

                    </div>
                </div>
			`	
		},
		{
		    'thumbnail': 'preview/basic-code.png',
		    'category': '120',
		    'html': `
			<div class="row">
				<div class="column full" data-noedit data-html="

					${encodeURIComponent(`<h1 id="{id}">Lorem ipsum</h1>
						<p>This is a custom code block. To edit, select this block and click the Settings button.</p>
						<script>
						var docReady = function (fn) {
							var stateCheck = setInterval(function () {
								if (document.readyState !== "complete") return;
								clearInterval(stateCheck);
								try{fn()}catch(e){}
							}, 1);
						};
						docReady(function() {
							document.querySelector(\'#{id}\').innerHTML =\'<b>Code Block</b>\';
						});
						</script>`)}

				">

				</div>
			</div>
			`	
		},

		/* Article */
		{
		    'thumbnail': 'preview/article-01.png',
		    'category': '118',
		    'html': `
			<div class="row">

				<div class="column full">
					<h1 class="text-center leading-none size-64 font-extralight">Words From Heart</h1>
					<div class="spacer height-20"></div>
					<p class="text-center uppercase tracking-125 size-14" style="color: rgb(102, 102, 102);">By Selma Laursen</p>
				</div>
			</div>

			<div class="row">
				<div class="column full">
					<div class="spacer height-60"></div>
				</div>
			</div>
			<div class="row">
				<div class="flex flex-col justify-center column full">
					<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry.&nbsp;Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.&nbsp;</p>
					<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry.&nbsp;Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.&nbsp;<br></p>
				</div>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/article-03.png',
		    'category': '118',
		    'html': `
<div class="row relative sm-items-1">
    <div class="py-6 flex flex-col justify-center column third">
        <h1 class="leading-none size-28 font-normal">Fascinating Places, Great Journey.</h1>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
    <div class="flex flex-col justify-center items-center column two-third"><img src="assets/minimalist-blocks/images/ai-EiDeP.jpg" alt=""></div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/article-15.png',
		    'category': '118',
		    'html': `
			<div class="row">
				<div class="column full center">
					<h1 class="size-35 font-normal">Fying High</h1>
					<p style="border-bottom: 2px solid #e74c3c; width: 60px; display: inline-block;"></p>
				</div>
			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-40"></div>
				</div>
			</div>
			<div class="row">
				<div class="column half">
					<p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type.</p>
					<p class="text-justify">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
				</div>
				<div class="column half">
					<p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type.</p>
					<p class="text-justify">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
				</div>
			</div>
			`	
		},

		/* Headline */
		{
		    'thumbnail': 'preview/headline-01.png',
		    'category': '101',
		    'html': `
			<div class="row">
				<div class="column full center">
					<h1 class="size-42 is-title4-48 inline-block tracking-125">STUNNING</h1>
				</div>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/headline-02.png',
		    'category': '101',
		    'html': `
			<div class="row">
				<div class="column full center">
					<i class="icon ion-coffee leading-none size-60"></i>
					<h1 class="font-medium size-54">Café &amp; Bistro</h1>
					<p><span class="italic">Lorem Ipsum is simply dummy text</span></p>
				</div>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/headline-05.png',
		    'category': '101',
		    'html': `
			<div class="row clearfix">
				<div class="column full">
					<h1 class="normal-case tracking-tight text-center font-normal size-64 leading-11">Great things don’t have to be complicated.</h1>
				</div>
			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-60"></div>
				</div>
			</div>
			<div class="row">
				<div class="column full">
					<div class="text-center">
						<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal tracking-wide" style="background-color: rgb(240, 240, 240);">How We Work</a>
						<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide">Get In Touch</a>
					</div>
				</div>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/headline-17.png',
		    'category': '101',
		    'html': `
<div class="row relative sm-items-1">
    <div class="column half" style="width: 42.1053%; flex: 0 0 auto;">
        <div class="spacer height-40"></div>
        <h1 class="tracking-wide leading-none font-medium size-48">Build Anything Beautifully</h1>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
        <div class="spacer height-20"></div>

        <div class="button-group">
            <a href="#preview" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-14 rounded-full tracking-wide" title="">Preview</a>
            <a href="#buynow" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 text-black leading-14 rounded-full border-transparent hover:border-transparent font-normal tracking-wide" title="" style="background-color: rgb(240, 240, 240);">Buy Now</a>
        </div>
    </div>
    <div style="position: relative; width: 100%;" class="flex flex-col justify-center column half">
        <div class="is-dock">
            <div style="width: 90%;left: 15%;top: 19%;min-width:400px">

                <img alt="" data-noresize="" src="assets/minimalist-blocks/images/ai-9Prvh.jpg" style="width: 100%; box-shadow: rgba(22, 22, 22, 0.2) 3em 3em 5em;" data-bottom-top="transform: translateX(130px);" data-center-top="transform: translateX(0px);" data-50-top="transform: translateX(0px);" data-top-bottom="transform: translateX(125px);" data-filename="ai-xG2F8-editSVxYrFy.png">
            </div>
            <div style="width: 92%;left: 41%;top: 41%;">
                <img alt="" data-noresize="" src="assets/minimalist-blocks/images/ai-IZAg5.jpg" style="width: 100%; box-shadow: rgba(22, 22, 22, 0.2) 3em 3em 5em;" data-bottom-top="transform: translateX(100px);" data-center-top="transform: translateX(0px);" data-50-top="transform: translateX(0px);" data-top-bottom="transform: translateX(100px);" data-filename="ai-iiPhS-editHBnPc8L.png">
            </div>
        </div>
    </div>
</div>
			`	
		},

		/* Buttons */
		{
		    'thumbnail': 'preview/buttons-02.png',
		    'category': '119',
		    'html': `
			<div class="text-center">
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid border-transparent ml-1 mr-1 hover:border-transparent rounded size-16 py-1 px-5 font-normal tracking-wide text-gray-800 underline leading-relaxed" title="">Get Started</a>
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-8 border-current hover:border-current font-normal leading-relaxed rounded-none size-15 tracking-widest" title="">View Demo</a>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/buttons-04.png',
		    'category': '119',
		    'html': `
			<div class="text-center">
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mt-2 mb-1 py-2 size-18 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal tracking-wide underline px-2 ml-3 mr-3" data-bg="">Read More</a>
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide">Get Started</a>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/buttons-06.png',
		    'category': '119',
		    'html': `
			<div class="text-center">
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 font-normal leading-relaxed border-transparent rounded-full size-18 tracking-wide hover:border-transparent" style="color: rgb(255, 255, 255); background-color: rgb(0, 0, 0);" data-bg="rgb(0,0,0)">View Demo</a>
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide">Buy Now</a>
			</div>
			`	
		},
		{
		    'thumbnail': 'preview/buttons-07.png',
		    'category': '119',
		    'html': `
			<div class="text-center">
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal size-14 uppercase tracking-125" title="" style="background-color: rgb(240, 240, 240);">Book a Call</a>
				<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full size-14 uppercase tracking-125" title=""><i class="icon ion-android-arrow-dropright"></i>&nbsp; How We Work</a>
			</div>
			`	
		},

		/* Photos */
		{
		    'thumbnail': 'preview/photos-01.png',
		    'category': '102',
		    'html': `
<div class="row">
    <div class="column half"><img src="assets/minimalist-blocks/images/ai-XUe84.jpg" alt="" style="margin: 0;float: left;" data-filename="ai-MhBT8-editIx7MmTn.png"></div>
    <div class="column half"><img src="assets/minimalist-blocks/images/ai-cvlfg.jpg" alt="" style="margin: 0;float: left;" data-filename="ai-0Xx4D-editcfCbAOe.png"></div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/photos-02.png',
		    'category': '102',
		    'html': `
<div class="row">
    <div class="column third"><img src="assets/minimalist-blocks/images/ai-uDhRs.jpg" alt="" style="margin: 0;float: left;" data-filename="ai-6ay66-editiYP7lM9.png"></div>
    <div class="column third"><img src="assets/minimalist-blocks/images/ai-K5c5T.jpg" alt="" style="margin: 0;float: left;" data-filename="ai-O4SHb-editrtRtJ92.png"></div>
    <div class="column third"><img src="assets/minimalist-blocks/images/ai-0Yhoi.jpg" alt="" style="margin: 0;float: left;" data-filename="ai-Rv3el-editnRcjlrC.png"></div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/photos-03.png',
		    'category': '102',
		    'html': `
<img src="assets/minimalist-blocks/images/ai-gX9nR.jpg" alt="">
			`	
		},

		/* Profile */
		{
		    'thumbnail': 'preview/profile-01.png',
		    'category': '103',
		    'html': `
<div class="row">
    <div class="column full">
        <h1 class="text-center tracking-wide size-42 font-normal">Meet Our Team</h1>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-80"></div>
    </div>
</div>
<div class="row">
    <div class="flex flex-col justify-center items-center column third px-3">
        <div class="img-circular" style="margin:25px 0 0;width: 10vw;height: 10vw;min-width:150px;min-height:150px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-Ayo6y.jpg" alt="" data-filename="ai-v0kWC-editXvGHq38.png"></div>
        <p class="text-center leading-14">
            <span class="size-19 text-center font-normal">Jennifer Clarke</span><br>
            <span style="color: rgb(109, 109, 109);">Developer</span>
        </p>
    </div>
    <div class="flex flex-col justify-center items-center column third px-3">
        <div class="img-circular" style="margin:25px 0 0;width: 10vw;height: 10vw;min-width:150px;min-height:150px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-U9Mhk.jpg" alt="" data-filename="ai-5LB8u-editHA3SVGs.png"></div>
        <p class="text-center leading-14">
            <span class="size-19 text-center font-normal">Freja E. Andersen</span><br>
            <span style="color: rgb(109, 109, 109);">Developer</span>
        </p>
    </div>
    <div class="flex flex-col justify-center items-center column third px-3">
        <div class="img-circular" style="margin:25px 0 0;width: 10vw;height: 10vw;min-width:150px;min-height:150px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-wfCwM.jpg" alt="" data-filename="ai-rBr7d-editQCT5GrW.png"></div>
        <p class="text-center leading-14">
            <span class="size-19 text-center font-normal">Nathan Williams</span><br>
            <span style="color: rgb(109, 109, 109);">Illustrator</span>
        </p>
    </div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/profile-05.png',
		    'category': '103',
		    'html': `
<div class="row">
    <div class="column full">
        <h3 class="text-center font-normal size-32">The Team</h3>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-20"></div>
    </div>
</div>            
<div class="row">
    <div class="column half py-4">
        <img src="assets/minimalist-blocks/images/ai-M8a3L.jpg" alt="" data-filename="ai-Woik1-editxQ8cIMT.png">
        <h3 class="font-normal size-24">Amanda Steele</h3>
        <p style="max-width: 400px;">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        <div class="is-social text-left">
            <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
            <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
            <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
        </div>
    </div>
    <div class="column half py-4">
        <img src="assets/minimalist-blocks/images/ai-rBm3n.jpg" alt="" data-filename="ai-O2ED1-editFBpnp2k.png">
        <h3 class="font-normal size-24">Peter A. Lassen</h3>
        <p style="max-width: 400px;">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        <div class="is-social text-left">
            <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
            <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
            <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
        </div>
    </div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/profile-07.png',
		    'category': '103',
		    'html': `
<div class="row">
    <div class="column full text-center">
        <h1 class="size-60 font-normal">A Passionate Team</h1>
    </div>
</div>
<div class="row">
    <div class="column full">
        <p class="text-center">We work as equals &amp; celebrate as a team.</p>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-40"></div>
    </div>
</div>
<div class="row">
    <div class="text-right column third flex flex-col justify-center items-center">
        <div class="img-circular" style="margin:25px 0;width: 13vw;height: 13vw;min-width:150px;min-height:150px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-DJgsj.jpg" alt="" data-filename="ai-obZqc-editzbfsl0b.png"></div>
    </div>
    <div class="flex flex-col justify-center column two-third">
        <h2 class="size-21 font-normal">Elaine Moreno</h2>
        <h3 class="font-light size-18" style="color: rgb(174, 174, 174);">Designer</h3>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
</div>
<div class="row relative desktop-column-reverse md-column-reverse sm-column-reverse">
    <div class="flex flex-col justify-center column two-third">
        <h2 class="size-21 font-normal">Janice Smith</h2>
        <h3 class="font-light size-18" style="color: rgb(174, 174, 174);">Developer</h3>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
    <div class="text-left column third flex flex-col justify-center items-center">
        <div class="img-circular" style="margin:25px 0;width: 13vw;height: 13vw;min-width:150px;min-height:150px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-qugm7.jpg" alt="" data-filename="ai-49P77-editKYIzbti.png"></div>
    </div>
</div>
			`	
		},

		/* Products */
		{
		    'thumbnail': 'preview/products-05.png',
		    'category': '104',
		    'html': `
<div class="row">
    <div class="column full">
        <h2 class="text-center size-42 font-normal">Products</h2>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-40"></div>
    </div>
</div>
<div class="row relative sm-items-2">
    <div class="column py-4"><img src="assets/minimalist-blocks/images/ai-FpLps.jpg" alt="">

        <h3 class="font-normal size-21">Coffee Table</h3>
        <p class="font-medium size-32">$29</p>

        <p class="leading-13">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer.</p>
        <div>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide">Buy Now</a>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 text-black leading-12 rounded-full border-transparent hover:border-transparent font-normal tracking-wide px-2 underline" data-bg="">View Details</a>
        </div>
    </div>
    <div class="column py-4"><img src="assets/minimalist-blocks/images/ai-bHuNq.jpg" alt="">

        <h3 class="size-21 font-normal">Bookcase</h3>
        <p class="font-medium size-32">$49</p>

        <p class="leading-13">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer.</p>
        <div>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide">Buy Now</a>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 text-black leading-12 rounded-full border-transparent hover:border-transparent font-normal tracking-wide px-2 underline" data-bg="">View Details</a>
        </div>
    </div>
</div>
			`	
		},

		/* Process/Steps */
		{
		    'thumbnail': 'preview/steps-05.png',
		    'category': '106',
		    'html': `
			<div class="row">
				<div class="column full">
					<p class="italic size-17">Discover</p>
					<h1 class="font-medium tracking-75 size-32">HOW WE WORK</h1>
				</div>
			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-80"></div>
				</div>
			</div>
			<div class="row">
				<div class="column third"><i class="icon ion-android-bulb size-32" style="color: #ea653c;"></i>
					<h3 class="font-medium tracking-wide size-19">STEP ONE</h3>
					<p>Lorem Ipsum is simply dummy text of the printing industry.</p>
				</div>
				<div class="column third"><i class="icon ion-compose size-32" style="color: #ea653c;"></i>
					<h3 class="font-medium tracking-wide size-19">STEP TWO</h3>
					<p>Lorem Ipsum is simply dummy text of the printing industry.</p>
				</div>
				<div class="column third"><i class="icon ion-gear-b size-32" style="color: #ea653c;"></i>
					<h3 class="font-medium tracking-wide size-19">STEP THREE</h3>
					<p>Lorem Ipsum is simply dummy text of the printing industry.</p>
				</div>
			</div>
			`	
		},

		/* Pricing */
		{
		    'thumbnail': 'preview/pricing-01.png',
		    'category': '107',
		    'html': `
			<div class="row">
				<div class="column third xs-hidden" style="width: 100%;">
					<div class="spacer height-80"></div>
				</div>
				<div style="width: 52.7981%; flex: 0 0 auto;" class="column third text-center">
					<h2 class="text-center font-normal size-28">Simple Pricing</h2>
					<p style="border-bottom: 3px solid #000; width: 80px; display: inline-block;"></p>
					<div class="spacer height-20"></div>
					<p style="color: rgb(109, 109, 109);" class="text-center size-14">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
						when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
				</div>
				<div class="column third xs-hidden" style="width: 100%;">
					<div class="spacer height-80"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full xs-hidden">
					<div class="spacer height-60"></div>
				</div>

			</div>
			<div class="row relative sm-items-2">
				<div class="column third p-7 flex flex-col justify-center items-center">
					<div style="padding: 50px 20px; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); width: 100%; max-width: 450px;" class="text-left flex justify-center flex-col items-center">
						<h3 class="text-center tracking-widest size-21">Standard</h3>
						<p class="size-21 text-center">$<span class="size-64">9</span>/mo</p>

						<ul style="list-style: initial;padding-left: 20px;">
							<li>10 GB Storage</li>
							<li>2 Users</li>
							<li>2 Domains</li>
						</ul>
						<div class="spacer height-20"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="">Buy Now</a>
						</div>
					</div>
				</div>
				<div class="column third p-7 flex flex-col justify-center items-center">
					<div style="padding: 90px 30px; width: 100%; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); max-width: 450px;" class="text-left flex justify-center flex-col items-center">
						<h3 class="text-center tracking-widest size-21">Deluxe</h3>
						<p class="size-21 text-center">$<span class="size-64">19</span>/mo</p>

						<ul style="list-style: initial;padding-left: 20px;">
							<li>20 GB Storage</li>
							<li>5 Users</li>
							<li>3 Domains</li>
						</ul>
						<div class="spacer height-20"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="">Buy Now</a>
						</div>
					</div>
				</div>
				<div class="column third p-7 flex flex-col justify-center items-center">
					<div style="padding: 50px 20px; width: 100%; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); max-width: 450px;" class="text-left flex justify-center flex-col items-center">
						<h3 class="text-center tracking-widest capitalize size-21">Ultimate</h3>
						<p class="size-21 text-center">$<span class="size-64">29</span>/mo</p>
						<ul style="list-style: initial;padding-left: 20px;">
							<li>30 GB Storage</li>
							<li>10 Users</li>
							<li>Unlimited Domains</li>
						</ul>
						<div class="spacer height-20"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="">Buy Now</a>
						</div>
					</div>
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/pricing-04.png',
		    'category': '107',
		    'html': `
			<div class="row">
				<div class="column full center">
					<h2 class="tracking-wide capitalize size-42 font-normal">Plans that meet your needs</h2>
					<div class="spacer height-20"></div>
					<p class="size-17 tracking-widest" style="color: rgb(87, 87, 87);">Fair Prices. Excellent Services.</p>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-60"></div>
				</div>

			</div>
			<div class="row relative">
				<div class="flex flex-col justify-center items-center column half py-4">
					<div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 450px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
						<h3 class="size-21 tracking-wider">Standard</h3>
						<div class="spacer height-20"></div>
						<p class="size-21 leading-none">$<span class="size-72 font-extralight">19</span>/mo</p>
						<p style="color: rgb(123, 123, 123);">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p>

						<ul style="list-style: initial;padding-left: 20px;">
							<li>Feature One</li>
							<li>Feature Two</li>
							<li>Feature Three</li>
						</ul>
						<div class="spacer height-40"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="">Buy Now</a>
						</div>
					</div>
				</div>
				<div class="flex flex-col justify-center items-center column half py-4">
					<div style="width: 100%; padding: 80px 40px; box-sizing: border-box; max-width: 550px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
						<h3 class="size-21 tracking-wider">Pro</h3>
						<div class="spacer height-20"></div>
						<p class="size-21 leading-none">$<span class="size-72 font-extralight">29</span>/mo</p>
						<p style="color: rgb(123, 123, 123);">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>

						<ul style="list-style: initial;padding-left: 20px;">
							<li>Feature One</li>
							<li>Feature Two</li>
							<li>Feature Three</li>
						</ul>
						<div class="spacer height-40"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="">Buy Now</a>
						</div>
					</div>
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/pricing-07.png',
		    'category': '107',
		    'html': `
			<div class="row">
				<div class="column full center">
					<h1 class="size-35 font-medium tracking-wider">SUBSCRIPTION PLANS</h1>
					<p>Choose the right plan that works for you.</p>
				</div>

			</div>
			<div class="row">
				<div class="column full xs-hidden">
					<div class="spacer height-40"></div>
				</div>

			</div>
			<div class="row relative sm-items-2">
				<div class="column third flex flex-col justify-center items-center py-4">
					<div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 450px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
						<h3 class="size-21 tracking-wider">Standard</h3>
						<div class="spacer height-20"></div>
						<p class="size-21 leading-none font-semibold">$<span class="size-64">19</span>/mo</p>
						<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>

						<ul style="list-style: initial;padding-left: 20px;">
							<li>Feature One</li>
							<li>Feature Two</li>
							<li>Feature Three</li>
						</ul>
						<div class="spacer height-20"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="">Select Plan</a>
						</div>
					</div>
				</div>
				<div class="column third flex flex-col justify-center items-center py-4 is-light-text">
					<div style="width: 100%; padding: 80px 40px; box-sizing: border-box; max-width: 550px; background-color: rgb(2, 136, 216);" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
						<h3 class="size-21 tracking-wider">Deluxe</h3>
						<div class="spacer height-20"></div>
						<p class="size-21 leading-none font-semibold">$<span class="size-64">29</span>/mo</p>
						<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>

						<ul style="list-style: initial;padding-left: 20px;">
							<li>Feature One</li>
							<li>Feature Two</li>
							<li>Feature Three</li>
						</ul>
						<div class="spacer height-20"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="">Select Plan</a>
						</div>
					</div>
				</div>
				<div class="column third flex flex-col justify-center items-center py-4 is-light-text">
					<div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 450px; background-color: rgb(249, 168, 37);" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
						<h3 class="size-21 tracking-wider">Ultimate</h3>
						<div class="spacer height-20"></div>
						<p class="size-21 leading-none font-semibold">$<span class="size-64">39</span>/mo</p>
						<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>

						<ul style="list-style: initial;padding-left: 20px;">
							<li>Feature One</li>
							<li>Feature Two</li>
							<li>Feature Three</li>
						</ul>
						<div class="spacer height-20"></div>
						<div class="button-group">
							<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="">Select Plan</a>
						</div>
					</div>
				</div>

			</div>
			`	
		},

		/* Skills */
		{
		    'thumbnail': 'preview/skills-10.png',
		    'category': '108',
		    'html': `
			<div class="row">
				<div class="column full">
					<h1 class="text-center font-normal">Our Expertise</h1>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-80"></div>
				</div>

			</div>
			<div class="row">
				<div class="column third"><i class="icon ion-ios-lightbulb-outline size-35"></i>
					<h4 class="font-normal size-19">UI/UX</h4>
					<p>Lorem Ipsum is dummy text of the printing industry.</p>
				</div>
				<div class="column third"><i class="icon ion-ios-heart-outline size-35"></i>
					<h4 class="font-normal size-19">Full Stack Development</h4>
					<p>Lorem Ipsum is dummy text of the printing industry.</p>
				</div>
				<div class="column third"><i class="icon ion-ios-list-outline size-35"></i>
					<h4 class="font-normal size-19">Illustration</h4>
					<p>Lorem Ipsum is dummy text of the printing industry.</p>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column third"><i class="icon ion-ios-camera-outline size-35"></i>
					<h4 class="font-normal"><span class="size-19">Video Explainer</span></h4>
					<p>Lorem Ipsum is dummy text of the printing industry.</p>
				</div>
				<div class="column third"><i class="icon ion-ios-locked-outline size-35"></i>
					<h4 class="font-normal"><span class="size-19">Branding</span></h4>
					<p>Lorem Ipsum is dummy text of the printing industry.</p>
				</div>
				<div class="column third"><i class="icon ion-ios-world-outline size-35"></i>
					<h4><span class="font-normal size-19">Marketing</span></h4>
					<p>Lorem Ipsum is dummy text of the printing industry.</p>
				</div>

			</div>
			`	
		},

		/* Achievements */
		{
		    'thumbnail': 'preview/achievements-03.png',
		    'category': '109',
		    'html': `
			<div class="row">
				<div class="column full">
					<p class="uppercase tracking-300 leading-18 size-12" style="color: rgb(109, 109, 109);">Achievements</p>
					<h1 class="font-light size-35">Why we are so awesome.</h1>
				</div>
			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-80"></div>
				</div>
			</div>
			<div class="row">
				<div class="column third">
					<div class="text-left leading-14">
						<i class="icon ion-ios-heart-outline size-48"></i>
					</div>
					<h2 class="leading-12 size-35">100%</h2>
					<h3 class="leading-12 tracking-wide size-19 font-light">Satisfaction</h3>
					<div class="spacer height-20"></div>
					<p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
				</div>
				<div class="column third">
					<div class="text-left leading-14">
						<i class="icon ion-ios-people-outline size-48"></i>
					</div>
					<h2 class="leading-12 size-35">1.234</h2>
					<h3 class="leading-12 size-19 tracking-wide font-light">Happy Clients</h3>
					<div class="spacer height-20"></div>
					<p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
				</div>
				<div class="column third">
					<div class="text-left leading-14">
						<i class="icon ion-ios-compose-outline size-48"></i>
					</div>
					<h2 class="leading-12 size-35">567</h2>
					<h3 class="leading-12 size-19 tracking-wide font-light">Projects Done</h3>
					<div class="spacer height-20"></div>
					<p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
				</div>
			</div>
			`	
		},

		/* Quotes */
		{
		    'thumbnail': 'preview/quotes-02.png',
		    'category': '110',
		    'html': `
			<div class="row">
				<div class="column full text-left">
					<div class="text-left">
						<i class="icon ion-quote size-32"></i>
					</div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-40"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<h1 class="size-32 leading-11">[Company Name] provide us with a forward thinking and well placed service. This has made significant impact on the efficiency and stability of our network.</h1>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<p class="italic tracking-wider">— A User</p>
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/quotes-03.png',
		    'category': '110',
		    'html': `
<div class="row">
    <div class="column two-third"><img src="assets/minimalist-blocks/images/ai-r43cG.jpg" alt="" data-filename=" ai-49P75-editRkU0S4C.png"></div>

    <div class="flex flex-col justify-center column third py-3">
        <div class="text-left leading-18">
            <i class="icon ion-quote size-28"></i>
        </div>

        <p class="size-21 leading-14">It's easy to use, customizable, and user-friendly. A truly amazing features.</p>

        <p style="color: rgb(138, 138, 138);">- A User</p>
    </div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/quotes-06.png',
		    'category': '110',
		    'html': `
<div class="row">
    <div class="column full">
        <h1 class="text-center size-35 font-normal">Their Stories</h1>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-60"></div>
    </div>
</div>
<div class="row">
    <div class="text-center flex flex-col justify-center items-center column"><img src="assets/minimalist-blocks/images/ai-CKaDa.jpg" alt="" data-filename="ai-VETbj 2-editwK2A7QN.png">
        <div class="spacer height-20"></div>
        <div class="text-center">
            <i class="icon ion-quote size-28"></i>
        </div>

        <h3 class="size-19 font-light">"Lorem Ipsum is simply dummy text of the printing and typesetting industry"</h3>
        <p class="tracking-wider size-16" style="color: rgb(102, 102, 102);">— A Client</p>
    </div>
    <div class="text-center flex flex-col justify-center items-center column" style="width: 50%; flex: 0 0 auto;"><img src="assets/minimalist-blocks/images/ai-8ABNg.jpg" alt="" data-filename="ai-3A86k-edithSvRhPC.png">
        <div class="spacer height-20"></div>
        <div class="text-center">
            <i class="icon ion-quote size-28"></i>
        </div>

        <h3 class="size-19 font-light">"Lorem Ipsum is simply dummy text of the printing and typesetting industry"</h3>
        <p class="tracking-wider size-16" style="color: rgb(102, 102, 102);">— A Client</p>
    </div>
</div>
			`	
		},

		/* Partners */
		{
		    'thumbnail': 'preview/partners-02.png',
		    'category': '111',
		    'html': `
			<div class="row">
				<div class="column full text-center">
					<h1 class="leading-18 text-center tracking-wide size-35">Our Lovely Clients</h1>
					<p style="border-bottom: 3px solid; width: 80px; display: inline-block;"></p>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-60"></div>
				</div>

			</div>
			<div class="row">
				<div class="column third flex flex-col justify-center items-center">
					<img src="assets/minimalist-blocks/images/creative.png" alt="">
				</div>
				<div class="column third flex flex-col justify-center items-center">
					<img src="assets/minimalist-blocks/images/light-studio.png" alt="">
				</div>
				<div class="column third flex flex-col justify-center items-center">
					<img src="assets/minimalist-blocks/images/infinitech.png" alt="">
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/partners-05.png',
		    'category': '111',
		    'html': `
			<div class="row">
				<div class="column full">
					<h1 class="size-42"><span class="font-semibold tracking-wide size-35">Serving Clients with Passion.</span></h1>
					<p class="size-16">We are globally recognized and trusted by the world's best names.</p>
					<hr style="border-top: 3px solid #111;width: 60px;margin: 20px 0;">
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-60"></div>
				</div>

			</div>
			<div class="row">
				<div class="column third"><img src="/assets/minimalist-blocks/images/worldwide.png" alt=""></div>
				<div class="column third"><img src="/assets/minimalist-blocks/images/steady.png" alt=""></div>
				<div class="column third"><img src="/assets/minimalist-blocks/images/design-firm.png" alt=""></div>

			</div>
			<div class="row">
				<div class="column third"><img src="/assets/minimalist-blocks/images/infinitech.png" alt=""></div>
				<div class="column third"><img src="/assets/minimalist-blocks/images/light-studio.png" alt=""></div>
				<div class="column third"><img src="/assets/minimalist-blocks/images/upclick.png" alt=""></div>

			</div>
			`	
		},

		/* 404 */
		{
		    'thumbnail': 'preview/404-01.png',
		    'category': '113',
		    'html': `
			<div class="row">
				<div class="column full">
					<div class="text-center">
						<i class="icon ion-android-sad size-64"></i>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<h1 class="is-title1-48 is-title-lite leading-none font-light text-center size-42">Page Not Found</h1>
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<p class="size-19 text-center" style="color: rgb(109, 109, 109);">The page you requested couldn't be found. This could be a spelling error in the URL or a removed page.</p>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="text-center button-group">
						<a href="#" role="button" class="transition-all inline-block cursor-pointer no-underline border-2 border-solid mr-1 mt-2 mb-2 tracking-75 py-2 border-current text-black hover:border-current font-normal ml-1 leading-relaxed rounded-full px-11 size-13" onmouseover="if(this.getAttribute('data-hover-bg'))this.style.backgroundColor=this.getAttribute('data-hover-bg');" onmouseout="if(this.getAttribute('data-bg'))this.style.backgroundColor=this.getAttribute('data-bg');else this.style.backgroundColor=''">Back to Home</a>
					</div>
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/404-02.png',
		    'category': '113',
		    'html': `
			<div class="row">
				<div class="column full center">
					<i class="icon ion-alert-circled size-64"></i>
					<h1 class="size-42 is-title2-48 is-title-lite">Oops, page not found.</h1>
					<div class="spacer height-20"></div>
					<p style="color: rgb(109, 109, 109);">The page you are looking for might have been removed, had its name changed, or temporarily unavailable.</p>
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="text-center button-group">
						<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full size-14 uppercase tracking-125">HomePage</a>
					</div>
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/404-03.png',
		    'category': '113',
		    'html': `
			<div class="row">
				<div class="column full center">
					<h1 class="size-196 leading-none tracking-wider" style="margin-bottom: 10px;">404</h1>
					<h3 class="size-28 tracking-225">PAGE NOT FOUND</h3>
					<div class="spacer height-20"></div>
					<p style="color: rgb(109, 109, 109);">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="text-center button-group">
						<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 border-current hover:border-current font-normal leading-relaxed rounded size-14 uppercase pt-2 pb-2 px-8 tracking-75">Back to Home</a>
					</div>
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/404-04.png',
		    'category': '113',
		    'html': `
			<div class="row">
				<div class="column full"><i class="icon ion-android-sad size-64"></i>
					<h1 class="is-title1-48 is-title-lite size-42">Something's wrong here... </h1>
					<p class="size-21">The page you requested couldn't be found. This could be a spelling error in the URL or a removed page.</p>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-20"></div>
				</div>

			</div>
			<div class="row">
				<div class="column full">
					<div style="white-space: nowrap;">
						<a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide">Back to Home</a>
					</div>
				</div>

			</div>
			`	
		},

		/* Coming Soon */
		{
		    'thumbnail': 'preview/comingsoon-03.png',
		    'category': '114',
		    'html': `
			<div class="row">
				<div class="column full center"><i class="icon ion-laptop size-64"></i>
					<h1 class="size-35 is-title2-48 is-title-lite font-semibold">SITE IS UNDER MAINTENANCE </h1>
					<p class="size-21">Please check back in sometime.</p>
					<div class="spacer height-40"></div>
					<div class="is-social edit size-21">
						<a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
						<a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
						<a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
					</div>
				</div>

			</div>
			`	
		},

		/* FAQ */
		{
		    'thumbnail': 'preview/faq-08.png',
		    'category': '115',
		    'html': `
			<div class="row">
				<div class="column full">
					<h1 class="size-28 text-center tracking-wide font-normal">Frequently Asked Questions</h1>
				</div>
			</div>
			<div class="row">
				<div class="column full">
					<div class="spacer height-60"></div>
				</div>
			</div>
			<div class="row">
				<div class="column half"><i class="icon ion-android-cart size-28" style="color: rgb(174, 174, 174);"></i>
					<p class="font-normal size-19">How can I buy your product?</p>
					<p style="color: rgb(138, 138, 138); max-width: 600px;">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
				</div>
				<div class="column half"><i class="icon ion-earth size-28" style="color: rgb(174, 174, 174);"></i>
					<p class="font-normal size-19">Do you ship internationally?</p>
					<p style="color: rgb(138, 138, 138); max-width: 600px;">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
				</div>
			</div>
			<div class="row">
				<div class="column half"><i class="icon ion-card size-28" style="color: rgb(174, 174, 174);"></i>
					<p class="font-normal size-19">What payment methods are accepted?</p>
					<p style="color: rgb(138, 138, 138); max-width: 600px;">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
				</div>
				<div class="column half"><i class="icon ion-arrow-swap size-28" style="color: rgb(174, 174, 174);"></i>
					<p class="font-normal size-19">What should I do if my product arrives damaged or is not what I ordered?</p>
					<p style="color: rgb(138, 138, 138); max-width: 600px;">Lorem Ipsum is dummy text of the printing.</p>
				</div>
			</div>
			`	
		},

		/* Contact */
		{
		    'thumbnail': 'preview/contact-01.png',
		    'category': '116',
		    'html': `
			<div class="row relative sm-items-1">
				<div class="py-6 flex flex-col justify-center column half">
					<p class="uppercase size-12 tracking-125 text-left" style="color: rgb(102, 102, 102);">Your Company Name</p>
					<h1 class="leading-none size-42 text-left font-normal">Get In Touch</h1>
					<div class="spacer height-20"></div>

					<p style="color: rgb(109, 109, 109);" class="text-left">12345 Street Name, City. State 12345
						<br>P: (123) 456 7890 / 456 7891.
					</p>
					<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.
						Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
						when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
					<div class="spacer height-20"></div>
					<div class="is-social text-center">
						<a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
						<a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
						<a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
					</div>
				</div>
				<div class="flex flex-col justify-center items-center column half" style="filter: grayscale(1);">
					<div class="embed-responsive embed-responsive-16by9" style="padding-bottom:100%">
						<iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" class="mg1" src="https://maps.google.com/maps?q=Melbourne,+Victoria,+Australia&amp;hl=en&amp;sll=-7.981898,112.626504&amp;sspn=0.009084,0.016512&amp;oq=melbourne&amp;hnear=Melbourne+Victoria,+Australia&amp;t=m&amp;z=10&amp;output=embed"></iframe>
					</div>
				</div>

			</div>
			`	
		},
		{
		    'thumbnail': 'preview/contact-13.png',
		    'category': '116',
		    'html': `
			<div class="row">
				<div class="column full" style="width: 100%; flex: 0 0 auto;">
					<h1 class="size-28 font-normal text-center">Have questions? Give us a call <span style="color: rgb(230, 126, 34);">0 123 456 78 90</span></h1>
					<div class="spacer height-40"></div>
					<div class="is-social  text-center size-18">
                        <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
                        <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
                        <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
					</div>
				</div>
			</div>
			`	
		},

		/* About */
		{
		    'thumbnail': 'preview/about-04.png',
		    'category': '103',
		    'html': `
<div class="row">
    <div class="column full"><img src="assets/minimalist-blocks/images/ai-lClur.jpg" alt=""></div>
</div>
<div class="row">
    <div class="column full pt-2">
        <h1 class="tracking-wide">Our Story</h1>
        <p style="border-bottom: 2px solid #f49400;width: 70px;display: inline-block;margin-top: 0;"></p>
    </div>
</div>
<div class="row">
    <div class="column two-third">
        <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
    <div class="column third">
        <p class="size-14" style="color: rgb(138, 138, 138);">1st floor, Building Name. <br>Street Name, City. State 456.<br>Phone: (123) 456 7890</p>
    </div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/about-06.png',
		    'category': '103',
		    'html': `
<div class="row">
    <div class="column third">
        <h1 class="size-28" style="margin-top: 15px;"><span class="font-semibold">Who</span> We Are</h1>
        <p style="border-bottom: 2px solid #000;width: 30px;display: inline-block;margin-top: 0;"></p>
    </div>
    <div class="column two-third pb-5">
        <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.</p>
    </div>
</div>
<div class="row">
    <div class="column full"><img src="assets/minimalist-blocks/images/ai-9F5nG.jpg" alt=""></div>
</div>
			`	
		},
		{
			'thumbnail': 'preview/basic-codeview.png',
			'category': '120',
			'html':
				`<div class="row">
					<div class="column full" data-noedit data-module="codeview" data-module-desc="Code" data-dialog-height="570px" data-html="${encodeURIComponent(`

						<div class="hide-on-print" style="display: flex;justify-content: flex-end;margin-bottom:5px"><button id="_copycode{id}" style="font-family:system-ui;font-size:13px;font-weight:300;padding:0;border:none;background:transparent;display:flex;cursor:pointer;">
							<svg width="16" height="16" style="margin-right:3px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path>
							</svg>
							Copy Code</button><!-- Tooltip element below the button -->
                            <div id="tooltip{id}" style="display: none; margin-top: 25px; background-color: #333; color: #fff; padding: 5px 10px; border-radius: 4px; position: absolute; z-index: 1; font-size: 12px;">Copied.</div>
						</div>
						<pre id="{id}" class="language-markup" style="font-size:14px;background-color: #f4f4f4;padding: 12px 16px;text-wrap: wrap;">&lt;h1>Hello World&lt;/h1></pre>
						<scr`+`ipt>
							var docReady = function(fn) {
								var stateCheck = setInterval(function() {
									if (document.readyState !== "complete") return;
									clearInterval(stateCheck);
									try {
										fn()
									} catch (e) {}
								}, 1);
							};
							docReady(function() {
								var block = document.getElementById('{id}');
						
								if (typeof Prism === 'undefined') {
									var prismCss = document.createElement('link');
									prismCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism.min.css';
									prismCss.rel = 'stylesheet';
						
									var prismThemeCss = document.createElement('link');
									prismThemeCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-coy.min.css';
									prismThemeCss.rel = 'stylesheet';
						
									var prismJs = document.createElement('script');
									prismJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js';
									prismJs.onload = function() {
										var styleElement = document.createElement('style');
										styleElement.innerHTML = \`
											<style>
												:not(pre)>code[class*=language-], pre[class*=language-] {
													background-color: #f4f4f4 !important;
													padding: 12px 16px !important;
												}
												pre[class*=language-]:after, pre[class*=language-]:before {
													box-shadow: none;
												}
												:not(pre)>code[class*=language-], pre[class*=language-] {
													margin-bottom: 0.5rem;
												}
												div[data-html] {
													min-height: 40px;
												}
												code[class*=language-], pre[class*=language-] {
													text-shadow: none;
												}
											</style>
											\`;
										document.head.appendChild(styleElement);
						
										Prism.highlightElement(block);
									};
						
									document.head.appendChild(prismCss);
									document.head.appendChild(prismThemeCss);
									document.head.appendChild(prismJs);
								} else {
									Prism.highlightElement(block);
								}
								try {
									Prism.highlightElement(block);
								} catch (e) {}
						
								var btnCopyCode = document.getElementById('_copycode{id}');
                                var tooltip = document.getElementById('tooltip{id}');
								btnCopyCode.addEventListener('click', () => {
									const range = document.createRange();
									range.selectNode(block);
									window.getSelection().addRange(range);
									try {
										document.execCommand('copy');
                                        tooltip.style.display = 'block';
                                        setTimeout(() => {
                                            tooltip.style.display = 'none';
                                        }, 1000);
									} catch (err) {
										console.error('Failed to copy code:', err);
									}
									window.getSelection().removeAllRanges();
								});
						
							});
						</scr`+`ipt>

						`)}" 
						
						data-settings="${encodeURIComponent(`
							
							{
								"code": "<h1>Hello World<h1>",
								"theme": "none"
							}

						`)}">
					</div>
				</div>`
		}, 


        /* PLUGINS */
		{
		    'thumbnail': 'preview/plugin-pendulum.png',
		    'category': '120',
		    'html': `
<div class="row">
    <div class="column flex flex-col justify-center items-start">
        <h1 class="font-medium size-35">AI-Powered Data Science Solutions</h1>
        <p>Transform your data into actionable insights with cutting-edge machine learning and advanced analytics.</p>
        <div>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mt-2 mb-1 font-normal tracking-normal rounded-full py-2 px-6 size-15 leading-14 border-transparent hover:border-transparent" style="color: rgb(250, 250, 250); background-color: rgb(24, 24, 27);" onmouseover="if(this.getAttribute('data-hover-bg'))this.style.backgroundColor=this.getAttribute('data-hover-bg');" onmouseout="if(this.getAttribute('data-bg'))this.style.backgroundColor=this.getAttribute('data-bg');else this.style.backgroundColor='';" data-bg="rgb(24, 24, 27)" data-hover-bg="rgb(63, 63, 70)">Read More</a>
        </div>
    </div>
    <div class="column" style="width: 70%; flex: 0 0 auto;">
        <div data-cb-type="pendulum" data-cb-speed="2.1" data-cb-color="#6464ff" data-cb-pendulum-count="10" data-cb-trail-length="100" data-cb-bg-color="#ffffff" data-cb-color-variation="100" data-cb-line-width="3.5" data-cb-trail-opacity="0.1" data-cb-pendulum-opacity="0" data-cb-ball-size="3" data-cb-ball-opacity="0.1" data-cb-blur="0" data-cb-draw-mode="curves" data-cb-fade-curve="linear" data-cb-swing-angle="60" data-cb-start-angle="45" data-cb-length-ratio="0.3" data-cb-base-freq="0.005" data-cb-freq-increment="0.001" data-cb-freq-distribution="linear" data-cb-pivot-y="20" data-cb-canvas-size="600" data-cb-margin="10" data-cb-transparent-bg="true">
        </div>
    </div>
</div>
`	
		},
		{
		    'thumbnail': 'preview/plugin-mockup.png',
		    'category': '120',
		    'html': `
<div data-cb-type="browser-mockup" data-cb-max-width="1400" data-cb-rotate-x="8" data-cb-rotate-y="-3" data-cb-enable-hover="true">
    <div class="app-showcase">
        <div class="app-container" style="transform: rotateX(0deg) rotateY(0deg);">
            <div class="app-window">
                <div class="window-header">
                    <div class="window-dot"></div>
                    <div class="window-dot"></div>
                    <div class="window-dot"></div>
                </div>
                <div class="app-screenshot">
                    <img src="assets/minimalist-blocks/images/ai-lClur.jpg" alt="App Mockup" class="screenshot-image">
                </div>
            </div>
        </div>
    </div>
</div>
			`	
		},
		{
		    'thumbnail': 'preview/plugin-card-list.png',
		    'category': '120',
		    'html': `
<div data-cb-type="card-list" data-cb-items-per-row="2" data-cb-gap="26" data-cb-aspect-ratio="16/9" data-cb-accent-color="#000000" tabindex="0" role="region" aria-label="Card list" style="position: relative; --accent-color: #000000; --accent-color-light: rgb(64, 64, 64);">
    <div class="card-list-grid grid-sortable">
        <div class="card-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-XUe84.jpg" alt="Product 1">
            </div>
            <div class="item-content">
                <h3 class="item-title">Premium Widget</h3>
                <p class="item-description">High-quality craftsmanship</p>
                <a href="/product/1" class="item-link">Learn More →</a>
            </div>
        </div>
        <div class="card-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-cvlfg.jpg" alt="Product 1">
            </div>
            <div class="item-content">
                <h3 class="item-title">Premium Widget</h3>
                <p class="item-description">High-quality craftsmanship</p>
                <a href="/product/2" class="item-link">Learn More →</a>
            </div>
        </div>
        <div class="card-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-HzKor.jpg" alt="Product 1">
            </div>
            <div class="item-content">
                <h3 class="item-title">Premium Widget</h3>
                <p class="item-description">High-quality craftsmanship</p>
                <a href="/product/3" class="item-link">Learn More →</a>
            </div>
        </div>
        <div class="card-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-iNSwQ.jpg" alt="Premium Widget">
            </div>
            <div class="item-content">
                <h3 class="item-title">Premium Widget</h3>
                <p class="item-description">High-quality craftsmanship</p>
                <a href="/product/4" class="item-link">Learn More →</a>
            </div>
        </div>
    </div>
</div>
`	
		},
		{
		    'thumbnail': 'preview/plugin-media-slider.png',
		    'category': '120',
		    'html': `
<div data-cb-type="media-slider" data-cb-items-per-slide="3" data-cb-gap="26" data-cb-aspect-ratio="3/4" tabindex="0" role="region" aria-label="Media slider" aria-roledescription="carousel" style="position: relative; overflow: hidden; --accent-color: #000000; --accent-color-light: rgb(64, 64, 64);" data-cb-accent-color="#000000" data-cb-autoplay="false" data-cb-autoplay-speed="3000" data-cb-loop="true" data-cb-pause-on-hover="true" data-cb-show-arrows="true" data-cb-show-dots="true" data-cb-show-counter="false">
    <div class="media-slider-track">

        <div class="slider-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-ER9hZ.jpg" alt="Sample Title 1">
            </div>
            <div class="item-content">
                <h3 class="item-title">Sample Title 1</h3>
                <p class="item-description">Short descriptive text goes here</p>
                <a href="#" class="item-link">Learn More →</a>
            </div>
        </div>
        <div class="slider-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-ehmKk.jpg" alt="Sample Title 2">
            </div>
            <div class="item-content">
                <h3 class="item-title">Sample Title 2</h3>
                <p class="item-description">Use any kind of image here</p>
                <a href="#" class="item-link">Learn More →</a>
            </div>
        </div>
        <div class="slider-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-0Yhoi.jpg" alt="Sample Title 3">
            </div>
            <div class="item-content">
                <h3 class="item-title">Sample Title 4</h3>
                <p class="item-description">Flexible placeholder text</p>
                <a href="#" class="item-link">Learn More →</a>
            </div>
        </div>
        <div class="slider-item">
            <div class="item-media">
                <img src="assets/minimalist-blocks/images/ai-uDhRs.jpg" alt="Sample Title 4">
            </div>
            <div class="item-content">
                <h3 class="item-title">Sample Title 3</h3>
                <p class="item-description">A brief caption or summary</p>
                <a href="#" class="item-link">Learn More →</a>
            </div>
        </div>
    </div>
</div>
`	
		},
		{
		    'thumbnail': 'preview/plugin-hero-anim.png',
		    'category': '120',
		    'html': `
<div class="row">
    <div class="column flex flex-col justify-center" style="width: 42.5%; flex: 0 0 auto;">
        <h1 class="size-48 font-medium">AI-Powered Data Science Solutions</h1>
        <p>Transform your data into actionable insights with cutting-edge machine learning and advanced analytics.</p>
        <div>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mt-2 mb-1 font-normal tracking-normal rounded-full py-2 px-6 size-15 leading-14 border-transparent hover:border-transparent" style="color: rgb(250, 250, 250); background-color: rgb(24, 24, 27);" onmouseover="if(this.getAttribute('data-hover-bg'))this.style.backgroundColor=this.getAttribute('data-hover-bg');" onmouseout="if(this.getAttribute('data-bg'))this.style.backgroundColor=this.getAttribute('data-bg');else this.style.backgroundColor='';" data-bg="rgb(24, 24, 27)" data-hover-bg="rgb(63, 63, 70)">Read More</a>
        </div>
    </div>
    <div class="column" style="width: 100%;">

        <div data-cb-type="hero-animation" data-cb-animation-type="bezier" data-cb-speed="2.4" data-cb-base-color="rgba(255, 0, 112, 1)" data-cb-canvas-width="600" data-cb-canvas-height="600">
            <canvas></canvas>
        </div>
    </div>
</div>
    `	
		},
		{
		    'thumbnail': 'preview/plugin-logo-loop.png',
		    'category': '120',
		    'html': `
<div data-cb-type="logo-loop" data-cb-speed="40" data-cb-gap="60" data-cb-pause-on-hover="true" class="cb-logo-loop--fade-edges flex" data-cb-direction="left">
    <div class="logo-item">
        <img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" width="120">
    </div>
    <div class="logo-item">
        <img src="https://cdn.simpleicons.org/vue.js/4FC08D" alt="Vue.js" width="120">
    </div>
    <div class="logo-item">
        <img src="https://cdn.simpleicons.org/next.js/000000" alt="Next.js" width="120">
    </div>

    <div class="logo-item">
        <img src="https://cdn.simpleicons.org/laravel/FF2D20" alt="Laravel" width="120">
    </div>
    <div class="logo-item">
        <img src="https://cdn.simpleicons.org/ruby/CC342D" alt="Ruby" width="120">
    </div>

</div>
`	
		},
		{
		    'thumbnail': 'preview/plugin-before-after.png',
		    'category': '120',
		    'html': `
<div data-cb-type="before-after-slider" data-cb-orientation="horizontal" data-cb-start-position="40" data-cb-show-labels="true">
    <div class="ba-container">
        <div class="ba-before">
            <img src="assets/minimalist-blocks/images/ai-iNSwQ.jpg" alt="Before renovation">
            <span class="ba-label-before">Before</span>
        </div>
        <div class="ba-after">
            <img src="assets/minimalist-blocks/images/ai-HzKor.jpg" alt="After renovation">
            <span class="ba-label-after">After</span>
        </div>
        <div class="ba-slider">
            <div class="ba-handle"></div>
        </div>
    </div>
</div>
`	
		},
		{
		    'thumbnail': 'preview/plugin-timeline.png',
		    'category': '120',
		    'html': `
<div data-cb-type="timeline" data-cb-orientation="vertical" data-cb-animate="true" data-cb-accentcolor="#8b5cf6" data-cb-linewidth="2" data-cb-dotsize="14" class="timeline-vertical" role="list" aria-label="Product Roadmap" style="--timeline-accent: rgba(59, 130, 246, 1); --timeline-line-width: 2px; --timeline-dot-size: 10px;" data-cb-accent-color="rgba(59, 130, 246, 1)" data-cb-line-width="2" data-cb-dot-size="10">
    <div>
        <div class="timeline-item" data-status="completed" data-item-id="item-h1" role="listitem">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-content">
                <span class="timeline-date">Phase 1</span>
                <h3 class="timeline-title">Research &amp; Planning</h3>
                <p class="timeline-desc">Conducted market research and defined product requirements with stakeholder input.</p>
            </div>
        </div>
        <div class="timeline-item" data-status="completed" data-item-id="item-h2" role="listitem">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-content">
                <span class="timeline-date">Phase 2</span>
                <h3 class="timeline-title">Design &amp; Prototype</h3>
                <p class="timeline-desc">Created user-centered designs and built interactive prototypes for testing.</p>
            </div>
        </div>
        <div class="timeline-item" data-status="current" data-item-id="item-h3" role="listitem">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-content">
                <span class="timeline-date">Phase 3</span>
                <h3 class="timeline-title">Development</h3>
                <p class="timeline-desc">Building the core platform with focus on performance and scalability.</p>
            </div>
        </div>
        <div class="timeline-item" data-status="upcoming" data-item-id="item-h4" role="listitem">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-content">
                <span class="timeline-date">Phase 4</span>
                <h3 class="timeline-title">Testing &amp; QA</h3>
                <p class="timeline-desc">Comprehensive testing across devices and browsers to ensure quality.</p>
            </div>
        </div>
        <div class="timeline-item" data-status="upcoming" data-item-id="item-h5" role="listitem">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-content">
                <span class="timeline-date">Phase 5</span>
                <h3 class="timeline-title">Launch</h3>
                <p class="timeline-desc">Official product release with marketing campaign and customer onboarding.</p>
            </div>
        </div>
    </div>
    <div>
    </div>
</div>
`	
		},
		{
		    'thumbnail': 'preview/plugin-accordion.png',
		    'category': '120',
		    'html': `
<div data-cb-type="faq" data-cb-allow-multiple="true" data-cb-open-first="true" style="--border-radius: 10px;" data-cb-border-radius="10">
    <div class="accordion-item">
        <div class="accordion-header">
            <span class="accordion-question edit">What is this platform about?</span>
            <span class="accordion-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </span>
        </div>
        <div class="accordion-content">
            <div class="accordion-answer is-subblock edit">
                <p>Our platform helps you connect, create, and collaborate effortlessly. Whether you’re exploring new ideas or managing ongoing projects, everything is designed to keep your workflow simple and organized.</p>
            </div>
        </div>
    </div>
    <div class="accordion-item">
        <div class="accordion-header">
            <span class="accordion-question edit">How do I get started?</span>
            <span class="accordion-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </span>
        </div>
        <div class="accordion-content">
            <div class="accordion-answer is-subblock edit">
                <p>Just sign up with your email address, create a profile, and explore the dashboard. From there, you can access all available tools, tutorials, and community resources to help you begin.</p>
            </div>
        </div>
    </div>
    <div class="accordion-item">
        <div class="accordion-header">
            <span class="accordion-question edit">Can I use this on mobile devices?</span>
            <span class="accordion-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </span>
        </div>
        <div class="accordion-content">
            <div class="accordion-answer is-subblock edit">
                <p>Yes! The platform is fully optimized for smartphones and tablets, so you can stay productive wherever you are.</p>
            </div>
        </div>
    </div>
</div>
`
		},
		{
		    'thumbnail': 'preview/plugin-media-grid.png',
		    'category': '120',
		    'html': `
<div data-cb-type="media-grid" data-cb-columns="3" class="grid-sortable" data-cb-gap="16" data-cb-rounded="8" data-cb-content-theme="light">

    <div class="gallery-item">
        <img src="assets/minimalist-blocks/images/ai-ehmKk.jpg" alt="Sample Title">
        <div class="item-content">

            <h4>Sample Title</h4>
            <div>Short descriptive text goes here</div>
        </div>
    </div>
    <div class="gallery-item">
        <img src="assets/minimalist-blocks/images/ai-yBliz.jpg" alt="Sample Title">

    </div>
    <div class="gallery-item">
        <img src="assets/minimalist-blocks/images/ai-sFtJP2.jpg" alt="Sample Title">
        <div class="item-content">

            <h4>Sample Title</h4>
            <div>Short descriptive text goes here</div>
        </div>
    </div>
    <div class="gallery-item">
        <img src="assets/minimalist-blocks/images/ai-ER9hZ.jpg" alt="Sample Title">
        <div class="item-content">

            <h4>Sample Title</h4>
            <div>Short descriptive text goes here</div>
        </div>
    </div>
    <div class="gallery-item"><img src="assets/minimalist-blocks/images/ai-XUe84.jpg" alt=""></div>
    <div class="gallery-item"><img src="assets/minimalist-blocks/images/ai-4UgvH.jpg" alt=""></div>
    <div class="gallery-item"><img src="assets/minimalist-blocks/images/ai-xPlfu.jpg" alt=""></div>
</div>
`	
		},
		{
		    'thumbnail': 'preview/plugin-social-share.png',
		    'category': '120',
		    'html': `
<div data-cb-type="social-share" data-cb-show-x="true" data-cb-show-facebook="true" data-cb-show-linked-in="true" data-cb-show-whats-app="true" data-cb-show-copy-link="true" data-cb-show-more="true" data-cb-share-title="How to Build Amazing Websites" data-cb-share-text="Learn the secrets to creating stunning, high-performance websites in 2025." data-cb-label-text="Share this article" data-cb-original-content="" data-cb-alignment="center" data-cb-show-label="true">
    <div class="share-container" role="group" aria-label="Share this page" data-alignment="center" aria-labelledby="share-label-cnftppq10"><span class="share-label" id="share-label-cnftppq10">Share this article</span>
        <div class="share-buttons flex" role="list">
            <div role="listitem"><button class="share-btn" type="button" aria-label="Share on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg></button></div>
            <div role="listitem"><button class="share-btn" type="button" aria-label="Share on Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                    </svg></button></div>
            <div role="listitem"><button class="share-btn" type="button" aria-label="Share on LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                    </svg></button></div>
            <div role="listitem"><button class="share-btn" type="button" aria-label="Share on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                    </svg></button></div>
            <div role="listitem"><button class="share-btn" type="button" aria-label="Copy link to clipboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg></button></div>
            <div class="share-more" role="listitem"><button class="share-btn" type="button" aria-label="More sharing options" aria-expanded="false" aria-haspopup="true" aria-controls="share-dropdown-9zv110z4t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg></button>
                <div class="share-dropdown" id="share-dropdown-9zv110z4t" role="menu" aria-label="Additional sharing options">
                    <button type="button" role="menuitem" data-platform="reddit">Reddit</button>
                    <button type="button" role="menuitem" data-platform="telegram">Telegram</button>
                    <button type="button" role="menuitem" data-platform="email">Email</button>
                </div>
            </div>
        </div>
    </div>
</div>
`
		},
		{
		    'thumbnail': 'preview/plugin-cta-buttons.png',
		    'category': '120',
		    'html': `
<div data-cb-type="cta-buttons" data-cb-primary-padding-y="12" data-cb-primary-padding-x="24" data-cb-primary-font-size="18" data-cb-secondary-padding-y="12" data-cb-secondary-padding-x="24" data-cb-secondary-font-size="18" style="gap: 24px; flex-wrap: wrap; display: flex; justify-content: center; align-items: center;" class="flex justify-center items-center" data-cb-primary-text="Start Building" data-cb-primary-link="" data-cb-primary-style="gradient" data-cb-primary-color1="#6366f1" data-cb-primary-color2="#8b5cf6" data-cb-primary-text-color="#ffffff" data-cb-primary-border-radius="12" data-cb-primary-font-weight="true" data-cb-primary-shadow="true" data-cb-primary-hover-lift="true" data-cb-secondary-text="View Documentation" data-cb-secondary-link="" data-cb-secondary-style="outline" data-cb-secondary-color1="rgba(229, 229, 229, 1)" data-cb-secondary-color2="rgba(205, 205, 205, 1)" data-cb-secondary-text-color="#0f172a" data-cb-secondary-border-radius="12" data-cb-secondary-font-weight="true" data-cb-secondary-shadow="true" data-cb-secondary-hover-lift="false" data-cb-gap="24" data-cb-alignment="center">
    <a href="#signup" class="cta-btn primary-gradient hover-lift">
        Sign Up Free
    </a>
    <a href="#demo" class="cta-btn secondary-outline">
        Watch Demo
    </a>
</div>
`
		},
		{
		    'thumbnail': 'preview/plugin-anim-stats.png',
		    'category': '120',
		    'html': `
<div data-cb-type="animated-stats" data-variant="minimal" data-cb-columns="4" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;" class="text-center" data-cb-alignment="center" data-cb-duration="2" data-cb-delay="0.1" data-cb-easing="ease-out" data-cb-icon-size="32" data-cb-number-size="34" data-cb-label-size="16">
    <div class="stat-item" data-target="500" data-suffix="+" data-stat-id="stat-19">
        <div class="stat-icon" data-icon-type="bootstrap">
            <i class="bi bi-globe"></i>
        </div>
        <div class="stat-number">500+</div>
        <div class="stat-label">Global Clients</div>
    </div>
    <div class="stat-item" data-target="50" data-suffix="+" data-stat-id="stat-20">
        <div class="stat-icon" data-icon-type="bootstrap">
            <i class="bi bi-person-badge-fill"></i>
        </div>
        <div class="stat-number">50+</div>
        <div class="stat-label">Team Members</div>
    </div>
    <div class="stat-item" data-target="10" data-suffix="+" data-stat-id="stat-21">
        <div class="stat-icon" data-icon-type="bootstrap">
            <i class="bi bi-pin-map-fill"></i>
        </div>
        <div class="stat-number">10+</div>
        <div class="stat-label">Countries</div>
    </div>
    <div class="stat-item" data-target="100" data-suffix="%" data-stat-id="stat-22">
        <div class="stat-icon" data-icon-type="bootstrap">
            <i class="bi bi-bullseye"></i>
        </div>
        <div class="stat-number">100%</div>
        <div class="stat-label">Commitment</div>
    </div>
</div>
`
		},

	]

};