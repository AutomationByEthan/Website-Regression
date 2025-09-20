(function($) {
    var $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $header = $('#header'),
        $footer = $('#footer'),
        $main = $('#main'),
        $main_articles = $main.find('article');

    // Breakpoints.
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px']
    });

    // Play initial animations on page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
            // Initialize article visibility: hide all articles on load.
            $main_articles.css({ opacity: 0, visibility: 'hidden' });
            $main_articles.removeClass('active');
        }, 100);
    });

    // Fix: Flexbox min-height bug on IE.
    if (browser.name == 'ie') {
        var flexboxFixTimeoutId;
        $window.on('resize.flexbox-fix', function() {
            clearTimeout(flexboxFixTimeoutId);
            flexboxFixTimeoutId = setTimeout(function() {
                if ($wrapper.height() < $window.height())
                    $wrapper.css('height', 'auto');
                else
                    $wrapper.css('height', '100vh');
            }, 250);
        }).trigger('resize.flexbox-fix');
    }

    // Nav.
    var $nav = $header.find('nav'),
        $nav_a = $nav.find('a');

    $nav_a
        .addClass('scrolly')
        .on('click', function() {
            var $this = $(this);
            // External link? Bail.
            if ($this.attr('href').charAt(0) != '#')
                return;
            // Deactivate all links and articles.
            $nav_a.removeClass('active active-locked');
            $main_articles.removeClass('active').css({ opacity: 0, visibility: 'hidden' });
            // Activate clicked link and corresponding article.
            $this.addClass('active active-locked');
            var id = $this.attr('href');
            var $section = $(id);
            if ($section.length > 0) {
                $section.addClass('active').css({ opacity: 1, visibility: 'visible' });
                $body.addClass('is-article-visible');
            }
            // Track navigation event in GA4.
            gtag('event', 'navigate_section', {
                'event_category': 'Navigation',
                'event_label': 'Open ' + id.replace('#', '')
            });
        })
        .each(function() {
            var $this = $(this),
                id = $this.attr('href'),
                $section = $(id);
            // No section? Bail.
            if ($section.length < 1)
                return;
            // Scrolly.
            $this.scrolly({
                speed: 1000,
                offset: function() {
                    if (breakpoints.active('<=medium'))
                        return $header.outerHeight() - 10;
                    return 0;
                }
            });
        });

    // Close button handler.
    $main_articles.each(function() {
        var $this = $(this);
        var $close = $this.find('.close');
        $close.on('click', function() {
            // Remove active class and hide article.
            $this.removeClass('active').css({ opacity: 0, visibility: 'hidden' });
            // Remove article-visible from body.
            $body.removeClass('is-article-visible');
            // Reset hash to homepage.
            window.location.hash = '';
            // Ensure header content is visible.
            $header.find('.content, nav').css({ opacity: 1, visibility: 'visible' });
            // Hide all other articles.
            $main_articles.not($this).css({ opacity: 0, visibility: 'hidden' }).removeClass('active');
            // Track close event in GA4.
            if (typeof gtag !== 'undefined') {
                gtag('event', 'close_section', {
                    'event_category': 'Navigation',
                    'event_label': 'Close ' + $this.attr('id')
                });
            }
        });
    });

    // Handle initial hash on load.
    $window.on('load hashchange', function() {
        var hash = window.location.hash;
        if (hash && hash !== '#') {
            var $section = $(hash);
            if ($section.length > 0) {
                $main_articles.removeClass('active').css({ opacity: 0, visibility: 'hidden' });
                $section.addClass('active').css({ opacity: 1, visibility: 'visible' });
                $body.addClass('is-article-visible');
                $nav_a.removeClass('active active-locked');
                $nav_a.filter('[href="' + hash + '"]').addClass('active active-locked');
            }
        } else {
            $main_articles.removeClass('active').css({ opacity: 0, visibility: 'hidden' });
            $body.removeClass('is-article-visible');
            $header.find('.content, nav').css({ opacity: 1, visibility: 'visible' });
        }
    });

    // Scrolly.
    $('.scrolly').scrolly({
        speed: 1000,
        offset: function() {
            if (breakpoints.active('<=medium'))
                return $header.outerHeight() - 10;
            return 0;
        }
    });

    // Header.
    if (breakpoints.active('<=medium')) {
        $wrapper.css('padding-top', ($header.outerHeight() - 10) + 'px');
    }

    $window.on('resize', function() {
        if (breakpoints.active('<=medium'))
            $wrapper.css('padding-top', ($header.outerHeight() - 10) + 'px');
        else
            $wrapper.css('padding-top', '');
    });

})(jQuery);
