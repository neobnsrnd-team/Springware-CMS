var data_basic_mobile = {
    'snippets': [

        // ── Text (120) ─────────────────────────────────────────────────

        // heading + paragraph (mobile)
        {
            'thumbnail': 'preview/basic-03.png',
            'category': '120',
            'viewMode': 'mobile',
            'html': `
            <h1 class="size-28">Heading 1 Text Goes Here.</h1>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
            `
        },

        // two-column text → single column stacked (mobile)
        {
            'thumbnail': 'preview/basic-06.png',
            'category': '120',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                    when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
                <div class="column full">
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                    when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
            `
        },

        // image + text two-column → stacked (mobile)
        {
            'thumbnail': 'preview/basic-12.png',
            'category': '120',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full"><img src="assets/minimalist-blocks/images/ai-4DbMv.jpg" alt="" style="width: 100%;"></div>
                <div class="column full flex justify-center flex-col items-center">
                    <div class="spacer height-20"></div>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
            `
        },

        // three-column steps → single column stacked (mobile)
        {
            'thumbnail': 'preview/basic-18.png',
            'category': '120',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h2 class="size-32">01</h2>
                    <div class="spacer height-10"></div>
                    <h3 class="size-17 uppercase leading-12">Step One</h3>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full">
                    <h2 class="size-32">02</h2>
                    <div class="spacer height-10"></div>
                    <h3 class="size-17 uppercase leading-12">Step Two</h3>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full">
                    <h2 class="size-32">03</h2>
                    <div class="spacer height-10"></div>
                    <h3 class="size-17 uppercase leading-12">Step Three</h3>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                </div>
            </div>
            `
        },

        // ── Article (118) ───────────────────────────────────────────────

        // article-01 (mobile)
        {
            'thumbnail': 'preview/article-01.png',
            'category': '118',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="text-center leading-none size-32 font-extralight">Words From Heart</h1>
                    <div class="spacer height-10"></div>
                    <p class="text-center uppercase tracking-125 size-12" style="color: rgb(102, 102, 102);">By Selma Laursen</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-30"></div>
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

        // article-03 (mobile) - third + two-third → stacked
        {
            'thumbnail': 'preview/article-03.png',
            'category': '118',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="leading-none size-24 font-normal">Fascinating Places, Great Journey.</h1>
                    <div class="spacer height-10"></div>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="flex flex-col justify-center items-center column full"><img src="assets/minimalist-blocks/images/ai-EiDeP.jpg" alt="" style="width: 100%;"></div>
            </div>
            `
        },

        // article-15 (mobile) - two-column text → stacked
        {
            'thumbnail': 'preview/article-15.png',
            'category': '118',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="size-28 font-normal">Fying High</h1>
                    <p style="border-bottom: 2px solid #e74c3c; width: 60px; display: inline-block;"></p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type.</p>
                    <p class="text-justify">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
                <div class="column full">
                    <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type.</p>
                    <p class="text-justify">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
            `
        },

        // ── Headline (101) ──────────────────────────────────────────────

        // headline-01 (mobile)
        {
            'thumbnail': 'preview/headline-01.png',
            'category': '101',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="size-28 is-title4-48 inline-block tracking-125">STUNNING</h1>
                </div>
            </div>
            `
        },

        // headline-02 (mobile)
        {
            'thumbnail': 'preview/headline-02.png',
            'category': '101',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center">
                    <i class="icon ion-coffee leading-none size-42"></i>
                    <h1 class="font-medium size-32">Café &amp; Bistro</h1>
                    <p><span class="italic">Lorem Ipsum is simply dummy text</span></p>
                </div>
            </div>
            `
        },

        // headline-05 (mobile) - reduced font, touch-friendly buttons
        {
            'thumbnail': 'preview/headline-05.png',
            'category': '101',
            'viewMode': 'mobile',
            'html': `
            <div class="row clearfix">
                <div class="column full">
                    <h1 class="normal-case tracking-tight text-center font-normal size-32 leading-11">Great things don't have to be complicated.</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-30"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="text-center">
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-16 px-7 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal tracking-wide" style="background-color: rgb(240, 240, 240); padding-top: 12px; padding-bottom: 12px; min-height: 44px;">How We Work</a>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-16 px-7 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Get In Touch</a>
                    </div>
                </div>
            </div>
            `
        },

        // headline-17 (mobile) - remove is-dock parallax, stack vertically
        {
            'thumbnail': 'preview/headline-17.png',
            'category': '101',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                    <h1 class="tracking-wide leading-none font-medium size-28">Build Anything Beautifully</h1>
                    <div class="spacer height-10"></div>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                    <div class="spacer height-10"></div>
                    <div class="button-group">
                        <a href="#preview" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-14 rounded-full tracking-wide" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;" title="">Preview</a>
                        <a href="#buynow" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 text-black leading-14 rounded-full border-transparent hover:border-transparent font-normal tracking-wide" title="" style="background-color: rgb(240, 240, 240); padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                    </div>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full">
                    <img alt="" src="assets/minimalist-blocks/images/ai-9Prvh.jpg" style="width: 100%;">
                    <div class="spacer height-10"></div>
                    <img alt="" src="assets/minimalist-blocks/images/ai-IZAg5.jpg" style="width: 100%;">
                </div>
            </div>
            `
        },

        // ── Buttons (119) ───────────────────────────────────────────────

        // buttons-02 (mobile) - touch-friendly min-height
        {
            'thumbnail': 'preview/buttons-02.png',
            'category': '119',
            'viewMode': 'mobile',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid border-transparent ml-1 mr-1 hover:border-transparent rounded size-16 font-normal tracking-wide text-gray-800 underline leading-relaxed" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Get Started</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 px-7 border-current hover:border-current font-normal leading-relaxed rounded-none size-14 tracking-widest" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">View Demo</a>
            </div>
            `
        },

        // buttons-04 (mobile)
        {
            'thumbnail': 'preview/buttons-04.png',
            'category': '119',
            'viewMode': 'mobile',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mt-2 mb-1 size-16 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal tracking-wide underline px-2 ml-3 mr-3" data-bg="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Read More</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-16 px-7 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Get Started</a>
            </div>
            `
        },

        // buttons-06 (mobile)
        {
            'thumbnail': 'preview/buttons-06.png',
            'category': '119',
            'viewMode': 'mobile',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 px-7 font-normal leading-relaxed border-transparent rounded-full size-16 tracking-wide hover:border-transparent" style="color: rgb(255, 255, 255); background-color: rgb(0, 0, 0); padding-top: 12px; padding-bottom: 12px; min-height: 44px;" data-bg="rgb(0,0,0)">View Demo</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-16 px-7 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
            </div>
            `
        },

        // buttons-07 (mobile)
        {
            'thumbnail': 'preview/buttons-07.png',
            'category': '119',
            'viewMode': 'mobile',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 px-7 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal size-14 uppercase tracking-125" title="" style="background-color: rgb(240, 240, 240); padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Book a Call</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 px-7 border-current hover:border-current font-normal leading-relaxed rounded-full size-14 uppercase tracking-125" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;"><i class="icon ion-android-arrow-dropright"></i>&nbsp; How We Work</a>
            </div>
            `
        },

        // ── Photos (102) ────────────────────────────────────────────────

        // photos-01 (2-col → stacked, mobile)
        {
            'thumbnail': 'preview/photos-01.png',
            'category': '102',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full"><img src="assets/minimalist-blocks/images/ai-XUe84.jpg" alt="" style="width: 100%;" data-filename="ai-MhBT8-editIx7MmTn.png"></div>
                <div class="column full" style="margin-top: 8px;"><img src="assets/minimalist-blocks/images/ai-cvlfg.jpg" alt="" style="width: 100%;" data-filename="ai-0Xx4D-editcfCbAOe.png"></div>
            </div>
            `
        },

        // photos-02 (3-col → stacked, mobile)
        {
            'thumbnail': 'preview/photos-02.png',
            'category': '102',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full"><img src="assets/minimalist-blocks/images/ai-uDhRs.jpg" alt="" style="width: 100%;" data-filename="ai-6ay66-editiYP7lM9.png"></div>
                <div class="column full" style="margin-top: 8px;"><img src="assets/minimalist-blocks/images/ai-K5c5T.jpg" alt="" style="width: 100%;" data-filename="ai-O4SHb-editrtRtJ92.png"></div>
                <div class="column full" style="margin-top: 8px;"><img src="assets/minimalist-blocks/images/ai-0Yhoi.jpg" alt="" style="width: 100%;" data-filename="ai-Rv3el-editnRcjlrC.png"></div>
            </div>
            `
        },

        // ── Profile (103) ───────────────────────────────────────────────

        // profile-01 (mobile) - 3-col → stacked, fixed circular image sizes
        {
            'thumbnail': 'preview/profile-01.png',
            'category': '103',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="text-center tracking-wide size-28 font-normal">Meet Our Team</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-40"></div>
                </div>
            </div>
            <div class="row">
                <div class="flex flex-col justify-center items-center column full px-3">
                    <div class="img-circular" style="margin:15px 0 0;width: 120px;height: 120px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-Ayo6y.jpg" alt="" data-filename="ai-v0kWC-editXvGHq38.png"></div>
                    <p class="text-center leading-14">
                        <span class="size-17 text-center font-normal">Jennifer Clarke</span><br>
                        <span style="color: rgb(109, 109, 109);">Developer</span>
                    </p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="flex flex-col justify-center items-center column full px-3">
                    <div class="img-circular" style="margin:15px 0 0;width: 120px;height: 120px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-U9Mhk.jpg" alt="" data-filename="ai-5LB8u-editHA3SVGs.png"></div>
                    <p class="text-center leading-14">
                        <span class="size-17 text-center font-normal">Freja E. Andersen</span><br>
                        <span style="color: rgb(109, 109, 109);">Developer</span>
                    </p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="flex flex-col justify-center items-center column full px-3">
                    <div class="img-circular" style="margin:15px 0 0;width: 120px;height: 120px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-wfCwM.jpg" alt="" data-filename="ai-rBr7d-editQCT5GrW.png"></div>
                    <p class="text-center leading-14">
                        <span class="size-17 text-center font-normal">Nathan Williams</span><br>
                        <span style="color: rgb(109, 109, 109);">Illustrator</span>
                    </p>
                </div>
            </div>
            `
        },

        // profile-05 (mobile) - 2-col → stacked
        {
            'thumbnail': 'preview/profile-05.png',
            'category': '103',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h3 class="text-center font-normal size-24">The Team</h3>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full py-4">
                    <img src="assets/minimalist-blocks/images/ai-M8a3L.jpg" alt="" style="width: 100%;" data-filename="ai-Woik1-editxQ8cIMT.png">
                    <h3 class="font-normal size-21">Amanda Steele</h3>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                    <div class="is-social text-left">
                        <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
                        <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
                        <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
                    </div>
                </div>
                <div class="column full py-4">
                    <img src="assets/minimalist-blocks/images/ai-rBm3n.jpg" alt="" style="width: 100%;" data-filename="ai-O2ED1-editFBpnp2k.png">
                    <h3 class="font-normal size-21">Peter A. Lassen</h3>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                    <div class="is-social text-left">
                        <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
                        <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
                        <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
                    </div>
                </div>
            </div>
            `
        },

        // profile-07 (mobile) - third/two-third → stacked, fixed circular sizes
        {
            'thumbnail': 'preview/profile-07.png',
            'category': '103',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full text-center">
                    <h1 class="size-32 font-normal">A Passionate Team</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <p class="text-center">We work as equals &amp; celebrate as a team.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full flex flex-col justify-center items-center">
                    <div class="img-circular" style="margin:15px 0;width: 120px;height: 120px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-DJgsj.jpg" alt="" data-filename="ai-obZqc-editzbfsl0b.png"></div>
                </div>
                <div class="flex flex-col justify-center column full">
                    <h2 class="size-19 font-normal text-center">Elaine Moreno</h2>
                    <h3 class="font-light size-16 text-center" style="color: rgb(174, 174, 174);">Designer</h3>
                    <div class="spacer height-10"></div>
                    <p class="text-center">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full flex flex-col justify-center items-center">
                    <div class="spacer height-20"></div>
                    <div class="img-circular" style="margin:15px 0;width: 120px;height: 120px;"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-qugm7.jpg" alt="" data-filename="ai-49P77-editKYIzbti.png"></div>
                </div>
                <div class="flex flex-col justify-center column full">
                    <h2 class="size-19 font-normal text-center">Janice Smith</h2>
                    <h3 class="font-light size-16 text-center" style="color: rgb(174, 174, 174);">Developer</h3>
                    <div class="spacer height-10"></div>
                    <p class="text-center">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
            `
        },

        // ── Products (104) ──────────────────────────────────────────────

        // products-05 (mobile) - multi-col products → stacked
        {
            'thumbnail': 'preview/products-05.png',
            'category': '104',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h2 class="text-center size-28 font-normal">Products</h2>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full py-4"><img src="assets/minimalist-blocks/images/ai-FpLps.jpg" alt="" style="width: 100%;">
                    <h3 class="font-normal size-19">Coffee Table</h3>
                    <p class="font-medium size-24">$29</p>
                    <p class="leading-13">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer.</p>
                    <div>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mr-2 mt-2 mb-1 size-15 text-black leading-12 rounded-full border-transparent hover:border-transparent font-normal tracking-wide px-2 underline" data-bg="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">View Details</a>
                    </div>
                </div>
                <div class="column full py-4"><img src="assets/minimalist-blocks/images/ai-bHuNq.jpg" alt="" style="width: 100%;">
                    <h3 class="size-19 font-normal">Bookcase</h3>
                    <p class="font-medium size-24">$49</p>
                    <p class="leading-13">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer.</p>
                    <div>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mr-2 mt-2 mb-1 size-15 text-black leading-12 rounded-full border-transparent hover:border-transparent font-normal tracking-wide px-2 underline" data-bg="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">View Details</a>
                    </div>
                </div>
            </div>
            `
        },

        // ── Steps/Process (106) ─────────────────────────────────────────

        // steps-05 (mobile) - 3-col → stacked
        {
            'thumbnail': 'preview/steps-05.png',
            'category': '106',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <p class="italic size-15">Discover</p>
                    <h1 class="font-medium tracking-75 size-24">HOW WE WORK</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-40"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full"><i class="icon ion-android-bulb size-28" style="color: #ea653c;"></i>
                    <h3 class="font-medium tracking-wide size-17">STEP ONE</h3>
                    <p>Lorem Ipsum is simply dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-compose size-28" style="color: #ea653c;"></i>
                    <h3 class="font-medium tracking-wide size-17">STEP TWO</h3>
                    <p>Lorem Ipsum is simply dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-gear-b size-28" style="color: #ea653c;"></i>
                    <h3 class="font-medium tracking-wide size-17">STEP THREE</h3>
                    <p>Lorem Ipsum is simply dummy text of the printing industry.</p>
                </div>
            </div>
            `
        },

        // ── Pricing (107) ───────────────────────────────────────────────

        // pricing-01 (mobile) - 3-col → stacked
        {
            'thumbnail': 'preview/pricing-01.png',
            'category': '107',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full text-center">
                    <h2 class="text-center font-normal size-24">Simple Pricing</h2>
                    <p style="border-bottom: 3px solid #000; width: 80px; display: inline-block;"></p>
                    <div class="spacer height-10"></div>
                    <p style="color: rgb(109, 109, 109);" class="text-center size-14">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full p-4 flex flex-col justify-center items-center">
                    <div style="padding: 40px 20px; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); width: 100%; max-width: 390px;" class="text-left flex justify-center flex-col items-center">
                        <h3 class="text-center tracking-widest size-19">Standard</h3>
                        <p class="size-19 text-center">$<span class="size-42">9</span>/mo</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>10 GB Storage</li>
                            <li>2 Users</li>
                            <li>2 Domains</li>
                        </ul>
                        <div class="spacer height-10"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
                <div class="column full p-4 flex flex-col justify-center items-center">
                    <div style="padding: 50px 25px; width: 100%; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); max-width: 390px;" class="text-left flex justify-center flex-col items-center">
                        <h3 class="text-center tracking-widest size-19">Deluxe</h3>
                        <p class="size-19 text-center">$<span class="size-42">19</span>/mo</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>20 GB Storage</li>
                            <li>5 Users</li>
                            <li>3 Domains</li>
                        </ul>
                        <div class="spacer height-10"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
                <div class="column full p-4 flex flex-col justify-center items-center">
                    <div style="padding: 40px 20px; width: 100%; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); max-width: 390px;" class="text-left flex justify-center flex-col items-center">
                        <h3 class="text-center tracking-widest capitalize size-19">Ultimate</h3>
                        <p class="size-19 text-center">$<span class="size-42">29</span>/mo</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>30 GB Storage</li>
                            <li>10 Users</li>
                            <li>Unlimited Domains</li>
                        </ul>
                        <div class="spacer height-10"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
            </div>
            `
        },

        // pricing-04 (mobile) - 2-col → stacked
        {
            'thumbnail': 'preview/pricing-04.png',
            'category': '107',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h2 class="tracking-wide capitalize size-28 font-normal">Plans that meet your needs</h2>
                    <div class="spacer height-10"></div>
                    <p class="size-15 tracking-widest" style="color: rgb(87, 87, 87);">Fair Prices. Excellent Services.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="flex flex-col justify-center items-center column full py-4">
                    <div style="width: 100%; padding: 40px 25px; box-sizing: border-box; max-width: 390px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-19 tracking-wider">Standard</h3>
                        <div class="spacer height-10"></div>
                        <p class="size-19 leading-none">$<span class="size-48 font-extralight">19</span>/mo</p>
                        <p style="color: rgb(123, 123, 123);">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col justify-center items-center column full py-4">
                    <div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 390px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-19 tracking-wider">Pro</h3>
                        <div class="spacer height-10"></div>
                        <p class="size-19 leading-none">$<span class="size-48 font-extralight">29</span>/mo</p>
                        <p style="color: rgb(123, 123, 123);">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
            </div>
            `
        },

        // pricing-07 (mobile) - 3-col → stacked
        {
            'thumbnail': 'preview/pricing-07.png',
            'category': '107',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="size-24 font-medium tracking-wider">SUBSCRIPTION PLANS</h1>
                    <p>Choose the right plan that works for you.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full flex flex-col justify-center items-center py-4">
                    <div style="width: 100%; padding: 40px 25px; box-sizing: border-box; max-width: 390px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-19 tracking-wider">Standard</h3>
                        <div class="spacer height-10"></div>
                        <p class="size-19 leading-none font-semibold">$<span class="size-42">19</span>/mo</p>
                        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-10"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Select Plan</a>
                        </div>
                    </div>
                </div>
                <div class="column full flex flex-col justify-center items-center py-4 is-light-text">
                    <div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 390px; background-color: rgb(2, 136, 216);" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-19 tracking-wider">Deluxe</h3>
                        <div class="spacer height-10"></div>
                        <p class="size-19 leading-none font-semibold">$<span class="size-42">29</span>/mo</p>
                        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-10"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Select Plan</a>
                        </div>
                    </div>
                </div>
                <div class="column full flex flex-col justify-center items-center py-4 is-light-text">
                    <div style="width: 100%; padding: 40px 25px; box-sizing: border-box; max-width: 390px; background-color: rgb(249, 168, 37);" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-19 tracking-wider">Ultimate</h3>
                        <div class="spacer height-10"></div>
                        <p class="size-19 leading-none font-semibold">$<span class="size-42">39</span>/mo</p>
                        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-10"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-15 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Select Plan</a>
                        </div>
                    </div>
                </div>
            </div>
            `
        },

        // ── Skills (108) ────────────────────────────────────────────────

        // skills-10 (mobile) - 3-col grid → stacked
        {
            'thumbnail': 'preview/skills-10.png',
            'category': '108',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="text-center font-normal size-28">Our Expertise</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-40"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full"><i class="icon ion-ios-lightbulb-outline size-28"></i>
                    <h4 class="font-normal size-17">UI/UX</h4>
                    <p>Lorem Ipsum is dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-ios-heart-outline size-28"></i>
                    <h4 class="font-normal size-17">Full Stack Development</h4>
                    <p>Lorem Ipsum is dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-ios-list-outline size-28"></i>
                    <h4 class="font-normal size-17">Illustration</h4>
                    <p>Lorem Ipsum is dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full"><i class="icon ion-ios-camera-outline size-28"></i>
                    <h4 class="font-normal"><span class="size-17">Video Explainer</span></h4>
                    <p>Lorem Ipsum is dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-ios-locked-outline size-28"></i>
                    <h4 class="font-normal"><span class="size-17">Branding</span></h4>
                    <p>Lorem Ipsum is dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-ios-world-outline size-28"></i>
                    <h4><span class="font-normal size-17">Marketing</span></h4>
                    <p>Lorem Ipsum is dummy text of the printing industry.</p>
                </div>
            </div>
            `
        },

        // ── Achievements (109) ──────────────────────────────────────────

        // achievements-03 (mobile) - 3-col → stacked
        {
            'thumbnail': 'preview/achievements-03.png',
            'category': '109',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <p class="uppercase tracking-300 leading-18 size-12" style="color: rgb(109, 109, 109);">Achievements</p>
                    <h1 class="font-light size-24">Why we are so awesome.</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-40"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="text-left leading-14">
                        <i class="icon ion-ios-heart-outline size-32"></i>
                    </div>
                    <h2 class="leading-12 size-28">100%</h2>
                    <h3 class="leading-12 tracking-wide size-17 font-light">Satisfaction</h3>
                    <div class="spacer height-10"></div>
                    <p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full">
                    <div class="text-left leading-14">
                        <i class="icon ion-ios-people-outline size-32"></i>
                    </div>
                    <h2 class="leading-12 size-28">1.234</h2>
                    <h3 class="leading-12 size-17 tracking-wide font-light">Happy Clients</h3>
                    <div class="spacer height-10"></div>
                    <p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full">
                    <div class="text-left leading-14">
                        <i class="icon ion-ios-compose-outline size-32"></i>
                    </div>
                    <h2 class="leading-12 size-28">567</h2>
                    <h3 class="leading-12 size-17 tracking-wide font-light">Projects Done</h3>
                    <div class="spacer height-10"></div>
                    <p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
                </div>
            </div>
            `
        },

        // ── Quotes (110) ────────────────────────────────────────────────

        // quotes-02 (mobile) - reduced heading size
        {
            'thumbnail': 'preview/quotes-02.png',
            'category': '110',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full text-left">
                    <div class="text-left">
                        <i class="icon ion-quote size-28"></i>
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
                    <h1 class="size-21 leading-11">[Company Name] provide us with a forward thinking and well placed service. This has made significant impact on the efficiency and stability of our network.</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-10"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <p class="italic tracking-wider">— A User</p>
                </div>
            </div>
            `
        },

        // quotes-03 (mobile) - two-third/third → stacked
        {
            'thumbnail': 'preview/quotes-03.png',
            'category': '110',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full"><img src="assets/minimalist-blocks/images/ai-r43cG.jpg" alt="" style="width: 100%;" data-filename=" ai-49P75-editRkU0S4C.png"></div>
                <div class="flex flex-col justify-center column full py-3">
                    <div class="text-left leading-18">
                        <i class="icon ion-quote size-24"></i>
                    </div>
                    <p class="size-19 leading-14">It's easy to use, customizable, and user-friendly. A truly amazing features.</p>
                    <p style="color: rgb(138, 138, 138);">- A User</p>
                </div>
            </div>
            `
        },

        // quotes-06 (mobile) - multi-col → stacked
        {
            'thumbnail': 'preview/quotes-06.png',
            'category': '110',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="text-center size-24 font-normal">Their Stories</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-30"></div>
                </div>
            </div>
            <div class="row">
                <div class="text-center flex flex-col justify-center items-center column full"><img src="assets/minimalist-blocks/images/ai-CKaDa.jpg" alt="" style="width: 100%;" data-filename="ai-VETbj 2-editwK2A7QN.png">
                    <div class="spacer height-10"></div>
                    <div class="text-center">
                        <i class="icon ion-quote size-24"></i>
                    </div>
                    <h3 class="size-17 font-light">"Lorem Ipsum is simply dummy text of the printing and typesetting industry"</h3>
                    <p class="tracking-wider size-14" style="color: rgb(102, 102, 102);">— A Client</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="text-center flex flex-col justify-center items-center column full"><img src="assets/minimalist-blocks/images/ai-8ABNg.jpg" alt="" style="width: 100%;" data-filename="ai-3A86k-edithSvRhPC.png">
                    <div class="spacer height-10"></div>
                    <div class="text-center">
                        <i class="icon ion-quote size-24"></i>
                    </div>
                    <h3 class="size-17 font-light">"Lorem Ipsum is simply dummy text of the printing and typesetting industry"</h3>
                    <p class="tracking-wider size-14" style="color: rgb(102, 102, 102);">— A Client</p>
                </div>
            </div>
            `
        },

        // ── Partners (111) ──────────────────────────────────────────────

        // partners-02 (mobile) - 3-col logos → stacked
        {
            'thumbnail': 'preview/partners-02.png',
            'category': '111',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full text-center">
                    <h1 class="leading-18 text-center tracking-wide size-24">Our Lovely Clients</h1>
                    <p style="border-bottom: 3px solid; width: 80px; display: inline-block;"></p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-30"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full flex flex-col justify-center items-center" style="padding: 15px 0;">
                    <img src="assets/minimalist-blocks/images/creative.png" alt="" style="max-width: 200px; width: 100%;">
                </div>
                <div class="column full flex flex-col justify-center items-center" style="padding: 15px 0;">
                    <img src="assets/minimalist-blocks/images/light-studio.png" alt="" style="max-width: 200px; width: 100%;">
                </div>
                <div class="column full flex flex-col justify-center items-center" style="padding: 15px 0;">
                    <img src="assets/minimalist-blocks/images/infinitech.png" alt="" style="max-width: 200px; width: 100%;">
                </div>
            </div>
            `
        },

        // partners-05 (mobile) - 3-col x 2-row logos → stacked
        {
            'thumbnail': 'preview/partners-05.png',
            'category': '111',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="size-28"><span class="font-semibold tracking-wide size-24">Serving Clients with Passion.</span></h1>
                    <p class="size-14">We are globally recognized and trusted by the world's best names.</p>
                    <hr style="border-top: 3px solid #111;width: 60px;margin: 15px 0;">
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full" style="padding: 10px 0;"><img src="/assets/minimalist-blocks/images/worldwide.png" alt="" style="max-width: 200px; width: 100%;"></div>
                <div class="column full" style="padding: 10px 0;"><img src="/assets/minimalist-blocks/images/steady.png" alt="" style="max-width: 200px; width: 100%;"></div>
                <div class="column full" style="padding: 10px 0;"><img src="/assets/minimalist-blocks/images/design-firm.png" alt="" style="max-width: 200px; width: 100%;"></div>
            </div>
            <div class="row">
                <div class="column full" style="padding: 10px 0;"><img src="/assets/minimalist-blocks/images/infinitech.png" alt="" style="max-width: 200px; width: 100%;"></div>
                <div class="column full" style="padding: 10px 0;"><img src="/assets/minimalist-blocks/images/light-studio.png" alt="" style="max-width: 200px; width: 100%;"></div>
                <div class="column full" style="padding: 10px 0;"><img src="/assets/minimalist-blocks/images/upclick.png" alt="" style="max-width: 200px; width: 100%;"></div>
            </div>
            `
        },

        // ── 404 (113) ───────────────────────────────────────────────────

        // 404-01 (mobile) - reduced sizes, touch-friendly button
        {
            'thumbnail': 'preview/404-01.png',
            'category': '113',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <div class="text-center">
                        <i class="icon ion-android-sad size-42"></i>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-10"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <h1 class="is-title1-48 is-title-lite leading-none font-light text-center size-28">Page Not Found</h1>
                    <div class="spacer height-10"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <p class="size-16 text-center" style="color: rgb(109, 109, 109);">The page you requested couldn't be found. This could be a spelling error in the URL or a removed page.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-10"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="text-center button-group">
                        <a href="#" role="button" class="transition-all inline-block cursor-pointer no-underline border-2 border-solid mr-1 mt-2 mb-2 tracking-75 border-current text-black hover:border-current font-normal ml-1 leading-relaxed rounded-full px-8 size-13" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Back to Home</a>
                    </div>
                </div>
            </div>
            `
        },

        // 404-02 (mobile)
        {
            'thumbnail': 'preview/404-02.png',
            'category': '113',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center">
                    <i class="icon ion-alert-circled size-42"></i>
                    <h1 class="size-28 is-title2-48 is-title-lite">Oops, page not found.</h1>
                    <div class="spacer height-10"></div>
                    <p style="color: rgb(109, 109, 109);">The page you are looking for might have been removed, had its name changed, or temporarily unavailable.</p>
                    <div class="spacer height-10"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="text-center button-group">
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 px-7 border-current hover:border-current font-normal leading-relaxed rounded-full size-14 uppercase tracking-125" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">HomePage</a>
                    </div>
                </div>
            </div>
            `
        },

        // 404-03 (mobile) - reduced large 404 text
        {
            'thumbnail': 'preview/404-03.png',
            'category': '113',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="size-96 leading-none tracking-wider" style="margin-bottom: 10px;">404</h1>
                    <h3 class="size-21 tracking-225">PAGE NOT FOUND</h3>
                    <div class="spacer height-10"></div>
                    <p style="color: rgb(109, 109, 109);">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-10"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="text-center button-group">
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 border-current hover:border-current font-normal leading-relaxed rounded size-14 uppercase px-7 tracking-75" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Back to Home</a>
                    </div>
                </div>
            </div>
            `
        },

        // 404-04 (mobile)
        {
            'thumbnail': 'preview/404-04.png',
            'category': '113',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full"><i class="icon ion-android-sad size-42"></i>
                    <h1 class="is-title1-48 is-title-lite size-28">Something's wrong here... </h1>
                    <p class="size-17">The page you requested couldn't be found. This could be a spelling error in the URL or a removed page.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-10"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 size-16 px-7 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="padding-top: 12px; padding-bottom: 12px; min-height: 44px;">Back to Home</a>
                    </div>
                </div>
            </div>
            `
        },

        // ── Coming Soon (114) ───────────────────────────────────────────

        // comingsoon-03 (mobile)
        {
            'thumbnail': 'preview/comingsoon-03.png',
            'category': '114',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full center"><i class="icon ion-laptop size-42"></i>
                    <h1 class="size-24 is-title2-48 is-title-lite font-semibold">SITE IS UNDER MAINTENANCE </h1>
                    <p class="size-17">Please check back in sometime.</p>
                    <div class="spacer height-20"></div>
                    <div class="is-social edit size-21">
                        <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
                        <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
                        <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
                    </div>
                </div>
            </div>
            `
        },

        // ── FAQ (115) ───────────────────────────────────────────────────

        // faq-08 (mobile) - 2-col → stacked
        {
            'thumbnail': 'preview/faq-08.png',
            'category': '115',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="size-21 text-center tracking-wide font-normal">Frequently Asked Questions</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-30"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full"><i class="icon ion-android-cart size-24" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-17">How can I buy your product?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-earth size-24" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-17">Do you ship internationally?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full"><i class="icon ion-card size-24" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-17">What payment methods are accepted?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                    <div class="spacer height-20"></div>
                </div>
                <div class="column full"><i class="icon ion-arrow-swap size-24" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-17">What should I do if my product arrives damaged or is not what I ordered?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is dummy text of the printing.</p>
                </div>
            </div>
            `
        },

        // ── Contact (116) ───────────────────────────────────────────────

        // contact-01 (mobile) - half/half → stacked
        {
            'thumbnail': 'preview/contact-01.png',
            'category': '116',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <p class="uppercase size-12 tracking-125 text-left" style="color: rgb(102, 102, 102);">Your Company Name</p>
                    <h1 class="leading-none size-28 text-left font-normal">Get In Touch</h1>
                    <div class="spacer height-10"></div>
                    <p style="color: rgb(109, 109, 109);" class="text-left">12345 Street Name, City. State 12345
                        <br>P: (123) 456 7890 / 456 7891.
                    </p>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                    <div class="spacer height-10"></div>
                    <div class="is-social text-center">
                        <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
                        <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
                        <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
                    </div>
                    <div class="spacer height-20"></div>
                </div>
                <div class="flex flex-col justify-center items-center column full" style="filter: grayscale(1);">
                    <div class="embed-responsive embed-responsive-16by9" style="padding-bottom:75%">
                        <iframe width="100%" height="300" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" class="mg1" src="https://maps.google.com/maps?q=Melbourne,+Victoria,+Australia&amp;hl=en&amp;sll=-7.981898,112.626504&amp;sspn=0.009084,0.016512&amp;oq=melbourne&amp;hnear=Melbourne+Victoria,+Australia&amp;t=m&amp;z=10&amp;output=embed"></iframe>
                    </div>
                </div>
            </div>
            `
        },

        // contact-13 (mobile)
        {
            'thumbnail': 'preview/contact-13.png',
            'category': '116',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="size-21 font-normal text-center">Have questions? Give us a call <span style="color: rgb(230, 126, 34);">0 123 456 78 90</span></h1>
                    <div class="spacer height-20"></div>
                    <div class="is-social text-center size-18">
                        <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
                        <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
                        <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
                    </div>
                </div>
            </div>
            `
        },

        // ── About (117 area / category 103) ─────────────────────────────

        // about-04 (mobile) - two-third/third → stacked
        {
            'thumbnail': 'preview/about-04.png',
            'category': '103',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full"><img src="assets/minimalist-blocks/images/ai-lClur.jpg" alt="" style="width: 100%;"></div>
            </div>
            <div class="row">
                <div class="column full pt-2">
                    <h1 class="tracking-wide size-24">Our Story</h1>
                    <p style="border-bottom: 2px solid #f49400;width: 70px;display: inline-block;margin-top: 0;"></p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
                <div class="column full">
                    <div class="spacer height-10"></div>
                    <p class="size-14" style="color: rgb(138, 138, 138);">1st floor, Building Name. <br>Street Name, City. State 456.<br>Phone: (123) 456 7890</p>
                </div>
            </div>
            `
        },

        // about-06 (mobile) - third/two-third → stacked
        {
            'thumbnail': 'preview/about-06.png',
            'category': '103',
            'viewMode': 'mobile',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="size-24" style="margin-top: 15px;"><span class="font-semibold">Who</span> We Are</h1>
                    <p style="border-bottom: 2px solid #000;width: 30px;display: inline-block;margin-top: 0;"></p>
                </div>
                <div class="column full pb-3">
                    <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full"><img src="assets/minimalist-blocks/images/ai-9F5nG.jpg" alt="" style="width: 100%;"></div>
            </div>
            `
        },

    ]

};
