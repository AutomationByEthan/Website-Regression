(function($) {
    'use strict';

    // DOM Elements
    const $window = $(window);
    const $body = $('body');
    const $wrapper = $('#wrapper');
    const $header = $('#header');
    const $footer = $('#footer');
    const $main = $('#main');
    const $main_articles = $main.children('article');
    const $nav = $header.children('nav');
    const $nav_a = $nav.find('a');

    // Breakpoints
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px']
    });

    // Initialize on Page Load
    $window.on('load', () => {
        setTimeout(() => {
            $body.removeClass('is-preload');
            $wrapper.css({ display: 'flex', opacity: 1 });
            $header.css({ display: 'flex', opacity: 1 });
            $main.css({ display: 'flex', opacity: 1 });
            $footer.css({ display: 'block', opacity: 1 });
        }, 100);
    });

    // Fix: Flexbox min-height bug on IE
    if (browser.name === 'ie') {
        let flexboxFixTimeoutId;
        $window.on('resize.flexbox-fix', () => {
            clearTimeout(flexboxFixTimeoutId);
            flexboxFixTimeoutId = setTimeout(() => {
                $wrapper.css('height', $wrapper.prop('scrollHeight') > $window.height() ? 'auto' : '100vh');
            }, 250);
        }).trigger('resize.flexbox-fix');
    }

    // Navigation: Add middle alignment for even number of items
    const $nav_li = $nav.find('li');
    if ($nav_li.length % 2 === 0) {
        $nav.addClass('use-middle');
        $nav_li.eq($nav_li.length / 2).addClass('is-middle');
    }

    // Main: Article Show/Hide Methods
    const delay = 325;
    let locked = false;

    $main._show = function(id, initial = false) {
        const $article = $main_articles.filter(`#${id}`);
        if ($article.length === 0) return;

        // Handle lock
        if (locked || initial) {
            $body.addClass('is-switching').addClass('is-article-visible');
            $main_articles.removeClass('active');
            $header.hide();
            $footer.hide();
            $main.show();
            $article.show().addClass('active');
            locked = false;
            setTimeout(() => $body.removeClass('is-switching'), initial ? 1000 : 0);
            return;
        }

        locked = true;
        if ($body.hasClass('is-article-visible')) {
            const $currentArticle = $main_articles.filter('.active');
            $currentArticle.removeClass('active');
            setTimeout(() => {
                $currentArticle.hide();
                $article.show();
                setTimeout(() => {
                    $article.addClass('active');
                    $window.scrollTop(0).trigger('resize.flexbox-fix');
                    setTimeout(() => { locked = false; }, delay);
                }, 25);
            }, delay);
        } else {
            $body.addClass('is-article-visible');
            setTimeout(() => {
                $header.hide();
                $footer.hide();
                $main.show();
                $article.show();
                setTimeout(() => {
                    $article.addClass('active');
                    $window.scrollTop(0).trigger('resize.flexbox-fix');
                    setTimeout(() => { locked = false; }, delay);
                }, 25);
            }, delay);
        }
    };

    $main._hide = function(addState = false) {
    const $article = $main_articles.filter('.active');
    if (!$body.hasClass('is-article-visible')) return;

    if (addState) history.pushState(null, null, '#');

    if (locked) {
        $body.addClass('is-switching');
        $article.removeClass('active');
        $article.hide();
        $main.hide();
        $header.show();
        $footer.show();
        // Reset and retrigger fade-in animations for header elements
        if (breakpoints.active('<=medium')) {
            const $fadeElements = $header.find('.fade-in');
            $fadeElements.css({ opacity: 0, visibility: 'hidden' }); // Reset to initial state
            $fadeElements.removeClass('fade-in'); // Remove animation class
            setTimeout(() => {
                $fadeElements.addClass('fade-in'); // Re-add to trigger animation
            }, 50); // Small delay to ensure reset
        } else {
            $header.find('.content, nav').css({ opacity: 1, visibility: 'visible' });
        }
        $body.removeClass('is-article-visible');
        locked = false;
        $body.removeClass('is-switching');
        $window.scrollTop(0).trigger('resize.flexbox-fix');
        return;
    }

    locked = true;
    $article.removeClass('active');
    setTimeout(() => {
        $article.hide();
        $main.hide();
        $header.show();
        $footer.show();
        // Reset and retrigger fade-in animations for header elements
        if (breakpoints.active('<=medium')) {
            const $fadeElements = $header.find('.fade-in');
            $fadeElements.css({ opacity: 0, visibility: 'hidden' }); // Reset to initial state
            $fadeElements.removeClass('fade-in'); // Remove animation class
            setTimeout(() => {
                $fadeElements.addClass('fade-in'); // Re-add to trigger animation
            }, 50); // Small delay to ensure reset
        } else {
            $header.find('.content, nav').css({ opacity: 1, visibility: 'visible' });
        }
        setTimeout(() => {
            $body.removeClass('is-article-visible');
            $window.scrollTop(0).trigger('resize.flexbox-fix');
            setTimeout(() => { locked = false; }, delay);
        }, 25);
    }, delay);
};

    // Articles: Add Close Buttons and Prevent Click Bubbling
    $main_articles.each(function() {
        const $this = $(this);
        $('<span class="close">Close</span>').appendTo($this).on('click', () => {
            console.log(`Close button clicked for article: ${$this.attr('id')}`); // Debug
            $main._hide(true);
        });
        $this.on('click', (event) => event.stopPropagation());
    });

    // Events: Body Click and Keyup
    $body.on('click', () => {
        if ($body.hasClass('is-article-visible')) $main._hide(true);
    });

    $window.on('keyup', (event) => {
        if (event.keyCode === 27 && $body.hasClass('is-article-visible')) {
            $main._hide(true);
        }
    });

    // Navigation: Handle Hash Changes
    $nav_a.addClass('scrolly').on('click', function(event) {
        const $this = $(this);
        const id = $this.attr('href').substr(1);
        const $article = $main_articles.filter(`#${id}`);
        if ($article.length === 0) return;
        event.preventDefault();
        event.stopPropagation();
        $main._show(id);
        // Google Analytics: Track virtual page view
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                'page_path': '/' + id
            });
        }
    });

    $window.on('hashchange', (event) => {
        if (location.hash === '' || location.hash === '#') {
            event.preventDefault();
            event.stopPropagation();
            $main._hide();
        } else {
            const $article = $main_articles.filter(location.hash);
            if ($article.length > 0) {
                event.preventDefault();
                event.stopPropagation();
                $main._show(location.hash.substr(1));
                // Google Analytics: Track virtual page view on hash change
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_view', {
                        'page_path': '/' + location.hash.substr(1)
                    });
                }
            }
        }
    });

    // Scroll: Reveal and Parallax Effects
    $window.on('scroll', () => {
        $('.reveal').each(function() {
            const top = $(this).offset().top;
            const windowBottom = $window.scrollTop() + $window.height();
            if (top < windowBottom - 50) $(this).addClass('active');
        });
        $body.toggleClass('scrolled', $window.scrollTop() > 50);
    });

    // Scroll Restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    } else {
        let oldScrollPos = 0;
        let scrollPos = 0;
        const $htmlbody = $('html,body');
        $window.on('scroll', () => {
            oldScrollPos = scrollPos;
            scrollPos = $htmlbody.scrollTop();
        }).on('hashchange', () => {
            $window.scrollTop(oldScrollPos);
        });
    }

    // Initialize
    $main.hide();
    $main_articles.hide();
    if (location.hash !== '' && location.hash !== '#') {
        $window.on('load', () => $main._show(location.hash.substr(1), true));
    }

})(jQuery);

