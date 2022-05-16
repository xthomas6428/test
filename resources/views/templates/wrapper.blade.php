<html>
    <head>
        <title>{{ config('app.name', 'Pterodactyl') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">

            <link rel="stylesheet" href="/assets/enigma_theme_5/style.css">

            <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
            <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
            <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
            <link rel="shortcut icon" href="/favicons/favicon.ico">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
            <meta name="theme-color" content="#0e4688">
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show
        <style>
            @import url('//fonts.googleapis.com/css?family=Rubik:300,400,500&display=swap');
            @import url('//fonts.googleapis.com/css?family=IBM+Plex+Mono|IBM+Plex+Sans:500&display=swap');
        </style>

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}">
        <div onclick="menu()" class="mobile_menu"><i class="bi bi-list"></i></div>
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show

        <link rel="stylesheet" href="/assets/enigma_theme_5/style.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

        <script>
            function menu() {
                if($('.ebtnLL')[0]) {
                    if($('.ebtnLL').css('display') == 'none') { $('.ebtnLL').show(); } else
                    if($('.ebtnLL').css('display') == 'block') { $('.ebtnLL').hide(); }
                }
            }

            setInterval(function(){
                if($('.fNmetC')[0]) $('.fNmetC')[0].innerHTML = '© 2015 - 2021&nbsp;<a rel="noopener nofollow noreferrer" href="https://pterodactyl.io" target="_blank" class="kbxq2g-4 hcJQtJ">Pterodactyl Software</a><br><img src="/assets/enigma_theme_5/enigma_logo_t.png" style="width:20px;display:inline-block;"> Theme by <u><a href="https://discord.gg/C5Ex7cJU5r">Enigma production</a></u>';
            },500);
        </script>
    </body>
</html>
