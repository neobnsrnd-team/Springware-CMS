var data_basic_responsive = {
    'snippets': [

        // ── Text (120) ─────────────────────────────────────────────────

        // heading + paragraph (responsive)
        {
            'thumbnail': 'preview/basic-03.png',
            'category': '120',
            'viewMode': 'responsive',
            'html': `
            <h1 style="font-size: clamp(28px, 5vw, 42px);">Heading 1 Text Goes Here.</h1>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
            `
        },

        // two-column text (responsive)
        {
            'thumbnail': 'preview/basic-06.png',
            'category': '120',
            'viewMode': 'responsive',
            'html': `
            <div class="row sm-items-1">
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

        // image + text two-column (responsive)
        {
            'thumbnail': 'preview/basic-12.png',
            'category': '120',
            'viewMode': 'responsive',
            'html': `
<div class="row sm-items-1">
    <div class="column half"><img src="assets/minimalist-blocks/images/ai-4DbMv.jpg" alt="" style="max-width: 100%; height: auto;"></div>
    <div class="column half flex justify-center flex-col items-center" style="width: 100%;">
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
</div>
            `
        },

        // three-column steps (responsive)
        {
            'thumbnail': 'preview/basic-18.png',
            'category': '120',
            'viewMode': 'responsive',
            'html': `
            <div class="row sm-items-1">
                <div class="column third">
                    <h2 style="font-size: clamp(32px, 5vw, 48px);">01</h2>
                    <div class="spacer height-20"></div>
                    <h3 class="size-19 uppercase leading-12">Step One</h3>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                </div>
                <div class="column third">
                    <h2 style="font-size: clamp(32px, 5vw, 48px);">02</h2>
                    <div class="spacer height-20"></div>
                    <h3 class="size-19 uppercase leading-12">Step Two</h3>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                </div>
                <div class="column third">
                    <h2 style="font-size: clamp(32px, 5vw, 48px);">03</h2>
                    <div class="spacer height-20"></div>
                    <h3 class="size-19 uppercase leading-12">Step Three</h3>
                    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                </div>
            </div>
            `
        },

        // ── Article (118) ───────────────────────────────────────────────

        // article-01 (responsive)
        {
            'thumbnail': 'preview/article-01.png',
            'category': '118',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="text-center leading-none font-extralight" style="font-size: clamp(32px, 6vw, 64px);">Words From Heart</h1>
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

        // article-03 (responsive)
        {
            'thumbnail': 'preview/article-03.png',
            'category': '118',
            'viewMode': 'responsive',
            'html': `
<div class="row relative sm-items-1">
    <div class="py-6 flex flex-col justify-center column third">
        <h1 class="leading-none font-normal" style="font-size: clamp(22px, 4vw, 28px);">Fascinating Places, Great Journey.</h1>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
    <div class="flex flex-col justify-center items-center column two-third"><img src="assets/minimalist-blocks/images/ai-EiDeP.jpg" alt="" style="max-width: 100%; height: auto;"></div>
</div>
            `
        },

        // article-15 (responsive)
        {
            'thumbnail': 'preview/article-15.png',
            'category': '118',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="font-normal" style="font-size: clamp(24px, 4vw, 35px);">Fying High</h1>
                    <p style="border-bottom: 2px solid #e74c3c; width: 60px; display: inline-block;"></p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-40"></div>
                </div>
            </div>
            <div class="row sm-items-1">
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

        // ── Headline (101) ──────────────────────────────────────────────

        // headline-01 (responsive)
        {
            'thumbnail': 'preview/headline-01.png',
            'category': '101',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="is-title4-48 inline-block tracking-125" style="font-size: clamp(28px, 5vw, 42px);">STUNNING</h1>
                </div>
            </div>
            `
        },

        // headline-02 (responsive)
        {
            'thumbnail': 'preview/headline-02.png',
            'category': '101',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center">
                    <i class="icon ion-coffee leading-none size-60"></i>
                    <h1 class="font-medium" style="font-size: clamp(32px, 6vw, 54px);">Cafe &amp; Bistro</h1>
                    <p><span class="italic">Lorem Ipsum is simply dummy text</span></p>
                </div>
            </div>
            `
        },

        // headline-05 (responsive)
        {
            'thumbnail': 'preview/headline-05.png',
            'category': '101',
            'viewMode': 'responsive',
            'html': `
            <div class="row clearfix">
                <div class="column full">
                    <h1 class="normal-case tracking-tight text-center font-normal leading-11" style="font-size: clamp(28px, 5vw, 64px);">Great things don't have to be complicated.</h1>
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
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal tracking-wide" style="background-color: rgb(240, 240, 240); min-height: 44px;">How We Work</a>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="min-height: 44px;">Get In Touch</a>
                    </div>
                </div>
            </div>
            `
        },

        // headline-17 (responsive)
        {
            'thumbnail': 'preview/headline-17.png',
            'category': '101',
            'viewMode': 'responsive',
            'html': `
<div class="row relative sm-items-1">
    <div class="column half" style="flex: 0 0 auto;">
        <div class="spacer height-40"></div>
        <h1 class="tracking-wide leading-none font-medium" style="font-size: clamp(28px, 5vw, 48px);">Build Anything Beautifully</h1>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
        <div class="spacer height-20"></div>
        <div class="button-group">
            <a href="#preview" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-14 rounded-full tracking-wide" title="" style="min-height: 44px;">Preview</a>
            <a href="#buynow" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 text-black leading-14 rounded-full border-transparent hover:border-transparent font-normal tracking-wide" title="" style="background-color: rgb(240, 240, 240); min-height: 44px;">Buy Now</a>
        </div>
    </div>
    <div style="position: relative; width: 100%;" class="flex flex-col justify-center column half">
        <div class="is-dock">
            <div style="width: 90%;left: 15%;top: 19%;">
                <img alt="" data-noresize="" src="assets/minimalist-blocks/images/ai-9Prvh.jpg" style="max-width: 100%; height: auto; box-shadow: rgba(22, 22, 22, 0.2) 3em 3em 5em;" data-bottom-top="transform: translateX(130px);" data-center-top="transform: translateX(0px);" data-50-top="transform: translateX(0px);" data-top-bottom="transform: translateX(125px);">
            </div>
            <div style="width: 92%;left: 41%;top: 41%;">
                <img alt="" data-noresize="" src="assets/minimalist-blocks/images/ai-IZAg5.jpg" style="max-width: 100%; height: auto; box-shadow: rgba(22, 22, 22, 0.2) 3em 3em 5em;" data-bottom-top="transform: translateX(100px);" data-center-top="transform: translateX(0px);" data-50-top="transform: translateX(0px);" data-top-bottom="transform: translateX(100px);">
            </div>
        </div>
    </div>
</div>
            `
        },

        // ── Buttons (119) ───────────────────────────────────────────────

        // buttons-02 (responsive)
        {
            'thumbnail': 'preview/buttons-02.png',
            'category': '119',
            'viewMode': 'responsive',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid border-transparent ml-1 mr-1 hover:border-transparent rounded size-16 py-1 px-5 font-normal tracking-wide text-gray-800 underline leading-relaxed" title="" style="min-height: 44px;">Get Started</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-8 border-current hover:border-current font-normal leading-relaxed rounded-none size-15 tracking-widest" title="" style="min-height: 44px;">View Demo</a>
            </div>
            `
        },

        // buttons-04 (responsive)
        {
            'thumbnail': 'preview/buttons-04.png',
            'category': '119',
            'viewMode': 'responsive',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mt-2 mb-1 py-2 size-18 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal tracking-wide underline px-2 ml-3 mr-3" data-bg="" style="min-height: 44px;">Read More</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="min-height: 44px;">Get Started</a>
            </div>
            `
        },

        // buttons-06 (responsive)
        {
            'thumbnail': 'preview/buttons-06.png',
            'category': '119',
            'viewMode': 'responsive',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 font-normal leading-relaxed border-transparent rounded-full size-18 tracking-wide hover:border-transparent" style="color: rgb(255, 255, 255); background-color: rgb(0, 0, 0); min-height: 44px;" data-bg="rgb(0,0,0)">View Demo</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="min-height: 44px;">Buy Now</a>
            </div>
            `
        },

        // buttons-07 (responsive)
        {
            'thumbnail': 'preview/buttons-07.png',
            'category': '119',
            'viewMode': 'responsive',
            'html': `
            <div class="text-center">
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 text-black leading-relaxed rounded-full border-transparent hover:border-transparent font-normal size-14 uppercase tracking-125" title="" style="background-color: rgb(240, 240, 240); min-height: 44px;">Book a Call</a>
                <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full size-14 uppercase tracking-125" title="" style="min-height: 44px;"><i class="icon ion-android-arrow-dropright"></i>&nbsp; How We Work</a>
            </div>
            `
        },

        // ── Photos (102) ────────────────────────────────────────────────

        // photos-01 (responsive)
        {
            'thumbnail': 'preview/photos-01.png',
            'category': '102',
            'viewMode': 'responsive',
            'html': `
<div class="row sm-items-1">
    <div class="column half"><img src="assets/minimalist-blocks/images/ai-XUe84.jpg" alt="" style="margin: 0; max-width: 100%; height: auto;"></div>
    <div class="column half"><img src="assets/minimalist-blocks/images/ai-cvlfg.jpg" alt="" style="margin: 0; max-width: 100%; height: auto;"></div>
</div>
            `
        },

        // photos-02 (responsive)
        {
            'thumbnail': 'preview/photos-02.png',
            'category': '102',
            'viewMode': 'responsive',
            'html': `
<div class="row sm-items-1">
    <div class="column third"><img src="assets/minimalist-blocks/images/ai-uDhRs.jpg" alt="" style="margin: 0; max-width: 100%; height: auto;"></div>
    <div class="column third"><img src="assets/minimalist-blocks/images/ai-K5c5T.jpg" alt="" style="margin: 0; max-width: 100%; height: auto;"></div>
    <div class="column third"><img src="assets/minimalist-blocks/images/ai-0Yhoi.jpg" alt="" style="margin: 0; max-width: 100%; height: auto;"></div>
</div>
            `
        },

        // photos-03 (responsive)
        {
            'thumbnail': 'preview/photos-03.png',
            'category': '102',
            'viewMode': 'responsive',
            'html': `
<img src="assets/minimalist-blocks/images/ai-gX9nR.jpg" alt="" style="max-width: 100%; height: auto;">
            `
        },

        // ── Profile (103) ───────────────────────────────────────────────

        // profile-01 (responsive)
        {
            'thumbnail': 'preview/profile-01.png',
            'category': '103',
            'viewMode': 'responsive',
            'html': `
<div class="row">
    <div class="column full">
        <h1 class="text-center tracking-wide font-normal" style="font-size: clamp(28px, 5vw, 42px);">Meet Our Team</h1>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-80"></div>
    </div>
</div>
<div class="row sm-items-1">
    <div class="flex flex-col justify-center items-center column third px-3">
        <div class="img-circular" style="margin:25px 0 0;width: clamp(100px, 12vw, 180px);height: clamp(100px, 12vw, 180px);"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-Ayo6y.jpg" alt=""></div>
        <p class="text-center leading-14">
            <span class="size-19 text-center font-normal">Jennifer Clarke</span><br>
            <span style="color: rgb(109, 109, 109);">Developer</span>
        </p>
    </div>
    <div class="flex flex-col justify-center items-center column third px-3">
        <div class="img-circular" style="margin:25px 0 0;width: clamp(100px, 12vw, 180px);height: clamp(100px, 12vw, 180px);"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-U9Mhk.jpg" alt=""></div>
        <p class="text-center leading-14">
            <span class="size-19 text-center font-normal">Freja E. Andersen</span><br>
            <span style="color: rgb(109, 109, 109);">Developer</span>
        </p>
    </div>
    <div class="flex flex-col justify-center items-center column third px-3">
        <div class="img-circular" style="margin:25px 0 0;width: clamp(100px, 12vw, 180px);height: clamp(100px, 12vw, 180px);"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-wfCwM.jpg" alt=""></div>
        <p class="text-center leading-14">
            <span class="size-19 text-center font-normal">Nathan Williams</span><br>
            <span style="color: rgb(109, 109, 109);">Illustrator</span>
        </p>
    </div>
</div>
            `
        },

        // profile-05 (responsive)
        {
            'thumbnail': 'preview/profile-05.png',
            'category': '103',
            'viewMode': 'responsive',
            'html': `
<div class="row">
    <div class="column full">
        <h3 class="text-center font-normal" style="font-size: clamp(24px, 4vw, 32px);">The Team</h3>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-20"></div>
    </div>
</div>
<div class="row sm-items-1">
    <div class="column half py-4">
        <img src="assets/minimalist-blocks/images/ai-M8a3L.jpg" alt="" style="max-width: 100%; height: auto;">
        <h3 class="font-normal size-24">Amanda Steele</h3>
        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        <div class="is-social text-left">
            <a href="https://twitter.com/"><i class="bi bi-twitter-x" style="margin-right: 1em"></i></a>
            <a href="https://www.facebook.com/"><i class="bi bi-facebook" style="margin-right: 1em"></i></a>
            <a href="mailto:you@example.com"><i class="bi bi-envelope"></i></a>
        </div>
    </div>
    <div class="column half py-4">
        <img src="assets/minimalist-blocks/images/ai-rBm3n.jpg" alt="" style="max-width: 100%; height: auto;">
        <h3 class="font-normal size-24">Peter A. Lassen</h3>
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

        // profile-07 (responsive)
        {
            'thumbnail': 'preview/profile-07.png',
            'category': '103',
            'viewMode': 'responsive',
            'html': `
<div class="row">
    <div class="column full text-center">
        <h1 class="font-normal" style="font-size: clamp(32px, 6vw, 60px);">A Passionate Team</h1>
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
<div class="row sm-items-1">
    <div class="text-right column third flex flex-col justify-center items-center">
        <div class="img-circular" style="margin:25px 0;width: clamp(100px, 13vw, 200px);height: clamp(100px, 13vw, 200px);"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-DJgsj.jpg" alt=""></div>
    </div>
    <div class="flex flex-col justify-center column two-third">
        <h2 class="size-21 font-normal">Elaine Moreno</h2>
        <h3 class="font-light size-18" style="color: rgb(174, 174, 174);">Designer</h3>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
</div>
<div class="row relative desktop-column-reverse md-column-reverse sm-column-reverse sm-items-1">
    <div class="flex flex-col justify-center column two-third">
        <h2 class="size-21 font-normal">Janice Smith</h2>
        <h3 class="font-light size-18" style="color: rgb(174, 174, 174);">Developer</h3>
        <div class="spacer height-20"></div>
        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
    <div class="text-left column third flex flex-col justify-center items-center">
        <div class="img-circular" style="margin:25px 0;width: clamp(100px, 13vw, 200px);height: clamp(100px, 13vw, 200px);"><img style="height: 100%; width: 100%; object-fit: cover" src="assets/minimalist-blocks/images/ai-qugm7.jpg" alt=""></div>
    </div>
</div>
            `
        },

        // ── Products (104) ──────────────────────────────────────────────

        // products-05 (responsive)
        {
            'thumbnail': 'preview/products-05.png',
            'category': '104',
            'viewMode': 'responsive',
            'html': `
<div class="row">
    <div class="column full">
        <h2 class="text-center font-normal" style="font-size: clamp(28px, 5vw, 42px);">Products</h2>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-40"></div>
    </div>
</div>
<div class="row relative sm-items-1">
    <div class="column py-4"><img src="assets/minimalist-blocks/images/ai-FpLps.jpg" alt="" style="max-width: 100%; height: auto;">
        <h3 class="font-normal size-21">Coffee Table</h3>
        <p class="font-medium size-32">$29</p>
        <p class="leading-13">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer.</p>
        <div>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" style="min-height: 44px;">Buy Now</a>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 text-black leading-12 rounded-full border-transparent hover:border-transparent font-normal tracking-wide px-2 underline" data-bg="" style="min-height: 44px;">View Details</a>
        </div>
    </div>
    <div class="column py-4"><img src="assets/minimalist-blocks/images/ai-bHuNq.jpg" alt="" style="max-width: 100%; height: auto;">
        <h3 class="size-21 font-normal">Bookcase</h3>
        <p class="font-medium size-32">$49</p>
        <p class="leading-13">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer.</p>
        <div>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" style="min-height: 44px;">Buy Now</a>
            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 text-black leading-12 rounded-full border-transparent hover:border-transparent font-normal tracking-wide px-2 underline" data-bg="" style="min-height: 44px;">View Details</a>
        </div>
    </div>
</div>
            `
        },

        // ── Steps (106) ─────────────────────────────────────────────────

        // steps-05 (responsive)
        {
            'thumbnail': 'preview/steps-05.png',
            'category': '106',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full">
                    <p class="italic size-17">Discover</p>
                    <h1 class="font-medium tracking-75" style="font-size: clamp(24px, 4vw, 32px);">HOW WE WORK</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-80"></div>
                </div>
            </div>
            <div class="row sm-items-1">
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

        // ── Pricing (107) ───────────────────────────────────────────────

        // pricing-01 (responsive)
        {
            'thumbnail': 'preview/pricing-01.png',
            'category': '107',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full text-center">
                    <h2 class="text-center font-normal" style="font-size: clamp(22px, 4vw, 28px);">Simple Pricing</h2>
                    <p style="border-bottom: 3px solid #000; width: 80px; display: inline-block;"></p>
                    <div class="spacer height-20"></div>
                    <p style="color: rgb(109, 109, 109);" class="text-center size-14">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-60"></div>
                </div>
            </div>
            <div class="row relative sm-items-1">
                <div class="column third p-7 flex flex-col justify-center items-center">
                    <div style="padding: 50px 20px; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); width: 100%; max-width: 450px;" class="text-left flex justify-center flex-col items-center">
                        <h3 class="text-center tracking-widest size-21">Standard</h3>
                        <p class="size-21 text-center">$<span style="font-size: clamp(42px, 6vw, 64px);">9</span>/mo</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>10 GB Storage</li>
                            <li>2 Users</li>
                            <li>2 Domains</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="" style="min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
                <div class="column third p-7 flex flex-col justify-center items-center">
                    <div style="padding: 90px 30px; width: 100%; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); max-width: 450px;" class="text-left flex justify-center flex-col items-center">
                        <h3 class="text-center tracking-widest size-21">Deluxe</h3>
                        <p class="size-21 text-center">$<span style="font-size: clamp(42px, 6vw, 64px);">19</span>/mo</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>20 GB Storage</li>
                            <li>5 Users</li>
                            <li>3 Domains</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="" style="min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
                <div class="column third p-7 flex flex-col justify-center items-center">
                    <div style="padding: 50px 20px; width: 100%; box-sizing: border-box; border: 1px solid rgb(85, 85, 85); max-width: 450px;" class="text-left flex justify-center flex-col items-center">
                        <h3 class="text-center tracking-widest capitalize size-21">Ultimate</h3>
                        <p class="size-21 text-center">$<span style="font-size: clamp(42px, 6vw, 64px);">29</span>/mo</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>30 GB Storage</li>
                            <li>10 Users</li>
                            <li>Unlimited Domains</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-7 border-current hover:border-current font-normal leading-12 rounded-full tracking-wide" title="" style="min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
            </div>
            `
        },

        // pricing-04 (responsive)
        {
            'thumbnail': 'preview/pricing-04.png',
            'category': '107',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h2 class="tracking-wide capitalize font-normal" style="font-size: clamp(28px, 5vw, 42px);">Plans that meet your needs</h2>
                    <div class="spacer height-20"></div>
                    <p class="size-17 tracking-widest" style="color: rgb(87, 87, 87);">Fair Prices. Excellent Services.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-60"></div>
                </div>
            </div>
            <div class="row relative sm-items-1">
                <div class="flex flex-col justify-center items-center column half py-4">
                    <div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 450px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-21 tracking-wider">Standard</h3>
                        <div class="spacer height-20"></div>
                        <p class="size-21 leading-none">$<span class="font-extralight" style="font-size: clamp(48px, 7vw, 72px);">19</span>/mo</p>
                        <p style="color: rgb(123, 123, 123);">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-40"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col justify-center items-center column half py-4">
                    <div style="width: 100%; padding: 80px 40px; box-sizing: border-box; max-width: 550px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-21 tracking-wider">Pro</h3>
                        <div class="spacer height-20"></div>
                        <p class="size-21 leading-none">$<span class="font-extralight" style="font-size: clamp(48px, 7vw, 72px);">29</span>/mo</p>
                        <p style="color: rgb(123, 123, 123);">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-40"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="min-height: 44px;">Buy Now</a>
                        </div>
                    </div>
                </div>
            </div>
            `
        },

        // pricing-07 (responsive)
        {
            'thumbnail': 'preview/pricing-07.png',
            'category': '107',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="font-medium tracking-wider" style="font-size: clamp(24px, 4vw, 35px);">SUBSCRIPTION PLANS</h1>
                    <p>Choose the right plan that works for you.</p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-40"></div>
                </div>
            </div>
            <div class="row relative sm-items-1">
                <div class="column third flex flex-col justify-center items-center py-4">
                    <div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 450px;" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-21 tracking-wider">Standard</h3>
                        <div class="spacer height-20"></div>
                        <p class="size-21 leading-none font-semibold">$<span style="font-size: clamp(42px, 6vw, 64px);">19</span>/mo</p>
                        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="min-height: 44px;">Select Plan</a>
                        </div>
                    </div>
                </div>
                <div class="column third flex flex-col justify-center items-center py-4 is-light-text">
                    <div style="width: 100%; padding: 80px 40px; box-sizing: border-box; max-width: 550px; background-color: rgb(2, 136, 216);" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-21 tracking-wider">Deluxe</h3>
                        <div class="spacer height-20"></div>
                        <p class="size-21 leading-none font-semibold">$<span style="font-size: clamp(42px, 6vw, 64px);">29</span>/mo</p>
                        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="min-height: 44px;">Select Plan</a>
                        </div>
                    </div>
                </div>
                <div class="column third flex flex-col justify-center items-center py-4 is-light-text">
                    <div style="width: 100%; padding: 50px 30px; box-sizing: border-box; max-width: 450px; background-color: rgb(249, 168, 37);" class="is-card shadow-1 text-left flex justify-center flex-col items-center">
                        <h3 class="size-21 tracking-wider">Ultimate</h3>
                        <div class="spacer height-20"></div>
                        <p class="size-21 leading-none font-semibold">$<span style="font-size: clamp(42px, 6vw, 64px);">39</span>/mo</p>
                        <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                        <ul style="list-style: initial;padding-left: 20px;">
                            <li>Feature One</li>
                            <li>Feature Two</li>
                            <li>Feature Three</li>
                        </ul>
                        <div class="spacer height-20"></div>
                        <div class="button-group">
                            <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-17 px-6 border-current hover:border-current font-normal leading-12 rounded tracking-wide" title="" style="min-height: 44px;">Select Plan</a>
                        </div>
                    </div>
                </div>
            </div>
            `
        },

        // ── Skills (108) ────────────────────────────────────────────────

        // skills-10 (responsive)
        {
            'thumbnail': 'preview/skills-10.png',
            'category': '108',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="text-center font-normal" style="font-size: clamp(28px, 5vw, 42px);">Our Expertise</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-80"></div>
                </div>
            </div>
            <div class="row sm-items-1">
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
            <div class="row sm-items-1">
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

        // ── Achievements (109) ──────────────────────────────────────────

        // achievements-03 (responsive)
        {
            'thumbnail': 'preview/achievements-03.png',
            'category': '109',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full">
                    <p class="uppercase tracking-300 leading-18 size-12" style="color: rgb(109, 109, 109);">Achievements</p>
                    <h1 class="font-light" style="font-size: clamp(24px, 4vw, 35px);">Why we are so awesome.</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-80"></div>
                </div>
            </div>
            <div class="row sm-items-1">
                <div class="column third">
                    <div class="text-left leading-14">
                        <i class="icon ion-ios-heart-outline size-48"></i>
                    </div>
                    <h2 class="leading-12" style="font-size: clamp(28px, 4vw, 35px);">100%</h2>
                    <h3 class="leading-12 tracking-wide size-19 font-light">Satisfaction</h3>
                    <div class="spacer height-20"></div>
                    <p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
                </div>
                <div class="column third">
                    <div class="text-left leading-14">
                        <i class="icon ion-ios-people-outline size-48"></i>
                    </div>
                    <h2 class="leading-12" style="font-size: clamp(28px, 4vw, 35px);">1.234</h2>
                    <h3 class="leading-12 size-19 tracking-wide font-light">Happy Clients</h3>
                    <div class="spacer height-20"></div>
                    <p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
                </div>
                <div class="column third">
                    <div class="text-left leading-14">
                        <i class="icon ion-ios-compose-outline size-48"></i>
                    </div>
                    <h2 class="leading-12" style="font-size: clamp(28px, 4vw, 35px);">567</h2>
                    <h3 class="leading-12 size-19 tracking-wide font-light">Projects Done</h3>
                    <div class="spacer height-20"></div>
                    <p style="color: rgb(109, 109, 109);" class="leading-13">Lorem Ipsum is simply dummy text of the printing industry.</p>
                </div>
            </div>
            `
        },

        // ── Quotes (110) ────────────────────────────────────────────────

        // quotes-02 (responsive)
        {
            'thumbnail': 'preview/quotes-02.png',
            'category': '110',
            'viewMode': 'responsive',
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
                    <h1 class="leading-11" style="font-size: clamp(22px, 4vw, 32px);">[Company Name] provide us with a forward thinking and well placed service. This has made significant impact on the efficiency and stability of our network.</h1>
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

        // quotes-03 (responsive)
        {
            'thumbnail': 'preview/quotes-03.png',
            'category': '110',
            'viewMode': 'responsive',
            'html': `
<div class="row sm-items-1">
    <div class="column two-third"><img src="assets/minimalist-blocks/images/ai-r43cG.jpg" alt="" style="max-width: 100%; height: auto;"></div>
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

        // quotes-06 (responsive)
        {
            'thumbnail': 'preview/quotes-06.png',
            'category': '110',
            'viewMode': 'responsive',
            'html': `
<div class="row">
    <div class="column full">
        <h1 class="text-center font-normal" style="font-size: clamp(24px, 4vw, 35px);">Their Stories</h1>
    </div>
</div>
<div class="row">
    <div class="column full">
        <div class="spacer height-60"></div>
    </div>
</div>
<div class="row sm-items-1">
    <div class="text-center flex flex-col justify-center items-center column"><img src="assets/minimalist-blocks/images/ai-CKaDa.jpg" alt="" style="max-width: 100%; height: auto;">
        <div class="spacer height-20"></div>
        <div class="text-center">
            <i class="icon ion-quote size-28"></i>
        </div>
        <h3 class="size-19 font-light">"Lorem Ipsum is simply dummy text of the printing and typesetting industry"</h3>
        <p class="tracking-wider size-16" style="color: rgb(102, 102, 102);">— A Client</p>
    </div>
    <div class="text-center flex flex-col justify-center items-center column"><img src="assets/minimalist-blocks/images/ai-8ABNg.jpg" alt="" style="max-width: 100%; height: auto;">
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

        // ── Partners (111) ──────────────────────────────────────────────

        // partners-02 (responsive)
        {
            'thumbnail': 'preview/partners-02.png',
            'category': '111',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full text-center">
                    <h1 class="leading-18 text-center tracking-wide" style="font-size: clamp(24px, 4vw, 35px);">Our Lovely Clients</h1>
                    <p style="border-bottom: 3px solid; width: 80px; display: inline-block;"></p>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-60"></div>
                </div>
            </div>
            <div class="row sm-items-1">
                <div class="column third flex flex-col justify-center items-center">
                    <img src="assets/minimalist-blocks/images/creative.png" alt="" style="max-width: 100%; height: auto;">
                </div>
                <div class="column third flex flex-col justify-center items-center">
                    <img src="assets/minimalist-blocks/images/light-studio.png" alt="" style="max-width: 100%; height: auto;">
                </div>
                <div class="column third flex flex-col justify-center items-center">
                    <img src="assets/minimalist-blocks/images/infinitech.png" alt="" style="max-width: 100%; height: auto;">
                </div>
            </div>
            `
        },

        // partners-05 (responsive)
        {
            'thumbnail': 'preview/partners-05.png',
            'category': '111',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 style="font-size: clamp(24px, 4vw, 42px);"><span class="font-semibold tracking-wide" style="font-size: clamp(24px, 4vw, 35px);">Serving Clients with Passion.</span></h1>
                    <p class="size-16">We are globally recognized and trusted by the world's best names.</p>
                    <hr style="border-top: 3px solid #111;width: 60px;margin: 20px 0;">
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-60"></div>
                </div>
            </div>
            <div class="row sm-items-1">
                <div class="column third"><img src="/assets/minimalist-blocks/images/worldwide.png" alt="" style="max-width: 100%; height: auto;"></div>
                <div class="column third"><img src="/assets/minimalist-blocks/images/steady.png" alt="" style="max-width: 100%; height: auto;"></div>
                <div class="column third"><img src="/assets/minimalist-blocks/images/design-firm.png" alt="" style="max-width: 100%; height: auto;"></div>
            </div>
            <div class="row sm-items-1">
                <div class="column third"><img src="/assets/minimalist-blocks/images/infinitech.png" alt="" style="max-width: 100%; height: auto;"></div>
                <div class="column third"><img src="/assets/minimalist-blocks/images/light-studio.png" alt="" style="max-width: 100%; height: auto;"></div>
                <div class="column third"><img src="/assets/minimalist-blocks/images/upclick.png" alt="" style="max-width: 100%; height: auto;"></div>
            </div>
            `
        },

        // ── 404 (113) ───────────────────────────────────────────────────

        // 404-01 (responsive)
        {
            'thumbnail': 'preview/404-01.png',
            'category': '113',
            'viewMode': 'responsive',
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
                    <h1 class="is-title1-48 is-title-lite leading-none font-light text-center" style="font-size: clamp(28px, 5vw, 42px);">Page Not Found</h1>
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
                        <a href="#" role="button" class="transition-all inline-block cursor-pointer no-underline border-2 border-solid mr-1 mt-2 mb-2 tracking-75 py-2 border-current text-black hover:border-current font-normal ml-1 leading-relaxed rounded-full px-11 size-13" style="min-height: 44px;">Back to Home</a>
                    </div>
                </div>
            </div>
            `
        },

        // 404-02 (responsive)
        {
            'thumbnail': 'preview/404-02.png',
            'category': '113',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center">
                    <i class="icon ion-alert-circled size-64"></i>
                    <h1 class="is-title2-48 is-title-lite" style="font-size: clamp(28px, 5vw, 42px);">Oops, page not found.</h1>
                    <div class="spacer height-20"></div>
                    <p style="color: rgb(109, 109, 109);">The page you are looking for might have been removed, had its name changed, or temporarily unavailable.</p>
                    <div class="spacer height-20"></div>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="text-center button-group">
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full size-14 uppercase tracking-125" style="min-height: 44px;">HomePage</a>
                    </div>
                </div>
            </div>
            `
        },

        // 404-03 (responsive)
        {
            'thumbnail': 'preview/404-03.png',
            'category': '113',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center">
                    <h1 class="leading-none tracking-wider" style="font-size: clamp(96px, 20vw, 196px); margin-bottom: 10px;">404</h1>
                    <h3 class="tracking-225" style="font-size: clamp(18px, 3vw, 28px);">PAGE NOT FOUND</h3>
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
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 border-current hover:border-current font-normal leading-relaxed rounded size-14 uppercase pt-2 pb-2 px-8 tracking-75" style="min-height: 44px;">Back to Home</a>
                    </div>
                </div>
            </div>
            `
        },

        // 404-04 (responsive)
        {
            'thumbnail': 'preview/404-04.png',
            'category': '113',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full"><i class="icon ion-android-sad size-64"></i>
                    <h1 class="is-title1-48 is-title-lite" style="font-size: clamp(28px, 5vw, 42px);">Something's wrong here... </h1>
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
                    <div>
                        <a href="#" role="button" class="transition-all inline-block whitespace-nowrap cursor-pointer no-underline border-2 border-solid mr-2 mt-2 mb-1 py-2 size-18 px-9 border-current hover:border-current font-normal leading-relaxed rounded-full tracking-wide" style="min-height: 44px;">Back to Home</a>
                    </div>
                </div>
            </div>
            `
        },

        // ── Coming Soon (114) ───────────────────────────────────────────

        // comingsoon-03 (responsive)
        {
            'thumbnail': 'preview/comingsoon-03.png',
            'category': '114',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full center"><i class="icon ion-laptop size-64"></i>
                    <h1 class="is-title2-48 is-title-lite font-semibold" style="font-size: clamp(24px, 4vw, 35px);">SITE IS UNDER MAINTENANCE </h1>
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

        // ── FAQ (115) ───────────────────────────────────────────────────

        // faq-08 (responsive)
        {
            'thumbnail': 'preview/faq-08.png',
            'category': '115',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="text-center tracking-wide font-normal" style="font-size: clamp(22px, 4vw, 28px);">Frequently Asked Questions</h1>
                </div>
            </div>
            <div class="row">
                <div class="column full">
                    <div class="spacer height-60"></div>
                </div>
            </div>
            <div class="row sm-items-1">
                <div class="column half"><i class="icon ion-android-cart size-28" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-19">How can I buy your product?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                </div>
                <div class="column half"><i class="icon ion-earth size-28" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-19">Do you ship internationally?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                </div>
            </div>
            <div class="row sm-items-1">
                <div class="column half"><i class="icon ion-card size-28" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-19">What payment methods are accepted?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                </div>
                <div class="column half"><i class="icon ion-arrow-swap size-28" style="color: rgb(174, 174, 174);"></i>
                    <p class="font-normal size-19">What should I do if my product arrives damaged or is not what I ordered?</p>
                    <p style="color: rgb(138, 138, 138);">Lorem Ipsum is dummy text of the printing.</p>
                </div>
            </div>
            `
        },

        // ── Contact (116) ───────────────────────────────────────────────

        // contact-01 (responsive)
        {
            'thumbnail': 'preview/contact-01.png',
            'category': '116',
            'viewMode': 'responsive',
            'html': `
            <div class="row relative sm-items-1">
                <div class="py-6 flex flex-col justify-center column half">
                    <p class="uppercase size-12 tracking-125 text-left" style="color: rgb(102, 102, 102);">Your Company Name</p>
                    <h1 class="leading-none text-left font-normal" style="font-size: clamp(28px, 5vw, 42px);">Get In Touch</h1>
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

        // contact-13 (responsive)
        {
            'thumbnail': 'preview/contact-13.png',
            'category': '116',
            'viewMode': 'responsive',
            'html': `
            <div class="row">
                <div class="column full">
                    <h1 class="font-normal text-center" style="font-size: clamp(20px, 3vw, 28px);">Have questions? Give us a call <span style="color: rgb(230, 126, 34);">0 123 456 78 90</span></h1>
                    <div class="spacer height-40"></div>
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

        // about-04 (responsive)
        {
            'thumbnail': 'preview/about-04.png',
            'category': '103',
            'viewMode': 'responsive',
            'html': `
<div class="row">
    <div class="column full"><img src="assets/minimalist-blocks/images/ai-lClur.jpg" alt="" style="max-width: 100%; height: auto;"></div>
</div>
<div class="row">
    <div class="column full pt-2">
        <h1 class="tracking-wide" style="font-size: clamp(28px, 5vw, 42px);">Our Story</h1>
        <p style="border-bottom: 2px solid #f49400;width: 70px;display: inline-block;margin-top: 0;"></p>
    </div>
</div>
<div class="row sm-items-1">
    <div class="column two-third">
        <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    </div>
    <div class="column third">
        <p class="size-14" style="color: rgb(138, 138, 138);">1st floor, Building Name. <br>Street Name, City. State 456.<br>Phone: (123) 456 7890</p>
    </div>
</div>
            `
        },

        // about-06 (responsive)
        {
            'thumbnail': 'preview/about-06.png',
            'category': '103',
            'viewMode': 'responsive',
            'html': `
<div class="row sm-items-1">
    <div class="column third">
        <h1 style="margin-top: 15px; font-size: clamp(22px, 4vw, 28px);"><span class="font-semibold">Who</span> We Are</h1>
        <p style="border-bottom: 2px solid #000;width: 30px;display: inline-block;margin-top: 0;"></p>
    </div>
    <div class="column two-third pb-5">
        <p class="text-justify">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.</p>
    </div>
</div>
<div class="row">
    <div class="column full"><img src="assets/minimalist-blocks/images/ai-9F5nG.jpg" alt="" style="max-width: 100%; height: auto;"></div>
</div>
            `
        }

    ]

};
