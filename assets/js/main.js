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
            // Deactivate all links.
            $nav_a.removeClass('active');
            // Activate link *and* lock it (so Scrolly doesn't try to activate other links as we're scrolling to this one's section).
            $this.addClass('active').addClass('active-locked');
        })
        .each(function() {
            var $this = $(this),
                id = $this.attr('href'),
                $section = $(id);
            // No section for this link? Bail.
            if ($section.length < 1)
                return;
            // Scrolly.
            $this.scrolly({
                speed: 1000,
                offset: function() {
                    // If we're in a small viewport, use a smaller offset.
                    if (breakpoints.active('<=medium'))
                        return $header.outerHeight() - 10;
                    return 0;
                }
            });
        });

    // Close button handler.
    $main_articles.each(function() {
        var $this = $(this);
        // Already active? Skip.
        if ($this.hasClass('active'))
            return;
        // Find close button.
        var $close = $this.find('.close');
        $close.on('click', function() {
            // Remove active class from article.
            $this.removeClass('active');
            // Remove article-visible from body.
            $body.removeClass('is-article-visible');
            // Reset hash to return to main view.
            window.location.hash = '';
            // Ensure header content is visible.
            $header.find('.content, nav').css({ opacity: 1, visibility: 'visible' });
            // Reset all articles to hidden.
            $main_articles.not($this).css({ opacity: 0, visibility: 'hidden' });
            // Track close event in GA4.
            gtag('event', 'close_section', {
                'event_category': 'Navigation',
                'event_label': 'Close ' + $this.attr('id')
            });
        });
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
