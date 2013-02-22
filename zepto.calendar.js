//
// Zepto calendar by @suprMax
//

(function($){
  var utils = {};
  (function(){
    var _supportsInterface = function(isRaw) {
      var div = document.createElement('div'),
          vendors = 'Ms O Moz Webkit'.split(' '),
          len = vendors.length,
          memo = {};

      return function(prop) {
        var key = prop;

        if (typeof memo[key] !== 'undefined') {
          return memo[key];
        }

        if (typeof div.style[prop] !== 'undefined') {
          memo[key] = prop;
          return memo[key];
        }

        prop = prop.replace(/^[a-z]/, function(val) {
          return val.toUpperCase();
        });

        for (var i = len - 1; i >= 0; i--) {
          if (typeof div.style[vendors[i] + prop] !== 'undefined') {
            if (isRaw) {
              memo[key] = ('-' + vendors[i] + '-' + prop).toLowerCase();
            }
            else {
              memo[key] = vendors[i] + prop;
            }
            return memo[key];
          }
        }

        return false;
      };
    };

    utils.supports = _supportsInterface(false);
    utils.__supports = _supportsInterface(true);
  })();
  utils.dateClone = function(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  utils.datePurify = function(date, daysOnly) {
    return new Date(date.getFullYear(), date.getMonth(), daysOnly ? date.getDate() : 1);
  };
  utils.dateToYMD = function(date) {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  };
  utils.dateFromYMD = function(str) {
    var darr = str.split('-');
    return new Date(+darr[0], +darr[1] - 1, +darr[2]);
  };
  utils.dateMonthDaysNum = function(date) {
    return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
  };
  utils.getMonthWeeksNum = function(date) {
    var daysNum = this.dateMonthDaysNum(date),
        fDayO = this.datePurify(date).getDay(),
        fDay = fDayO ? (fDayO - 1) : 6;
    return Math.ceil((daysNum + fDay) / 7);
  };

  var Calendar = function(container, settings) {
    this.options = $.extend({
      start: this.dateToYMD(new Date()),
      duration: 200
    }, settings);

    this.els = {};

    this.els.block = container;

    this.els.header = this.els.block.find('.z-c-label');
    this.els.label = this.els.block.find('.z-c-months');
    this.els.prev = this.els.block.find('.z-c-previous');
    this.els.next = this.els.block.find('.z-c-next');

    this.els.holder = this.els.block.find('.z-c-holder');
    this.els.calendar = this.els.block.find('.z-c-calendar');

    this.start = this.dateFromYMD(this.options.start);
    this.current = this.datePurify(this.start);
    this.today = this.datePurify(new Date(), true);

    this.transform = this.__supports('transform');
    this.transition = this.__supports('transition');

    this.rendered = 0;
    this.shift = 0;

    this.initialize();
  };

  Calendar.prototype.initialize = function() {
    var html = this.firstRender();
    this.els.calendar.append(html);

    this.measure();
    this.reset();
    this.logic();
  };

  Calendar.prototype.measure = function() {
    var cell = this.els.calendar.children('li:first-child');
    this.size = {};

    this.size.width = this.els.header.width();
    this.size.cell = cell.height();
  };
  Calendar.prototype.reset = function() {
    var props = {};

    this.slide(0);

    props[this.transition] = this.transform + ' ' + (this.options.duration / 1000) + 's';
    this.els.label.css(props);
    this.els.calendar.css(props);
  };

  Calendar.prototype.logic = function() {
    var _this = this;
    var handlePrev = function() {
      if (_this.els.prev.hasClass('disabled')) return;
      _this.slide(-1);
    };
    var handleNext = function() {
      if (_this.els.next.hasClass('disabled')) return;
      _this.slide(1);
    };

    this.els.prev.on('tap', handlePrev);
    this.els.next.on('tap', handleNext);
  };

  Calendar.prototype.slide = function(shift) {
    var nextMonth = this.dateClone(this.current);

    if (this.shift === 0) {
      this.els.prev.addClass('disabled');
    }
    if (this.shift === 1) {
      this.els.prev.removeClass('disabled');
    }

    this.current.setMonth(this.current.getMonth() + shift);
    this.shift += shift;

    if (this.rendered - this.shift <= 1) {
      nextMonth.setMonth(nextMonth.getMonth() + 2);
      this.els.calendar.append(this.renderMonth(nextMonth));
    }

    this.slideCalendar();
    this.slideHeader();
    this.setActive();
  };

  Calendar.prototype.slideHeader = function() {
    var props = {},
        offset = -(this.current.getMonth() * this.size.width);

    props[this.transform] = 'translate3d(' + offset + 'px, 0, 0)';
    this.els.label.css(props);
  };
  Calendar.prototype.slideCalendar = function() {
    var props = {},
        offset = -((this.els.calendar.find('li[data-date="' + this.dateToYMD(this.current) + '"]').index() / 7) | 0) * this.size.cell;
    props[this.transform] = 'translate3d(0, ' + offset + 'px, 0)';

    this.els.calendar.css(props);
    this.els.holder.css({
      height: this.getMonthWeeksNum(this.current) * this.size.cell
    });
  };
  Calendar.prototype.setActive = function() {
    var darr = this.dateToYMD(this.current).split('-');
    this.els.calendar.find('.active').removeClass('active');
    this.els.calendar.find('[data-date^="' + darr[0] + '-' + darr[1] + '"]').addClass('active');
  };

  Calendar.prototype.render = function() {
    var nextMonth = this.dateClone(this.current);
    nextMonth.setMonth(this.current.getMonth() + 1);

    this.els.calendar.append(this.renderMonth(nextMonth));
  };

  Calendar.prototype.firstRender = function() {
    var currentMonth = this.datePurify(this.start),
        prevMonth = this.dateClone(currentMonth); prevMonth.setMonth(this.start.getMonth() - 1);

    var prevDaysNum = this.dateMonthDaysNum(prevMonth),
        prefillDaysNum = (this.start.getDay() ? this.start.getDay() : 7) - 1,
        i = 0,

        html = '';

    while (prefillDaysNum > 0) {
      html += '<li class="empty' +
        (i === 0 ? ' monday' : '') +
        (i >= 5 ? ' weekend' : '') +
        '">' + (prevDaysNum - prefillDaysNum + 1) + '<\/li>';
      prefillDaysNum--;
      i++;
    }

    html += this.renderMonth(currentMonth);
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    html += this.renderMonth(currentMonth);

    return html;
  };

  Calendar.prototype.renderMonth = function(rendering) {
    var month = rendering.getMonth(),
        year = rendering.getFullYear(),
        length = this.dateMonthDaysNum(rendering),

        date = rendering.getDate(),
        day = rendering.getDay(),
        time = +rendering,

        today = +this.today,
        one_day = 86400000,

        firstweek = false,
        html = '';

    for (; date <= length; date++) {
      firstweek = (date <= 7);

      html += '<li class="z-c-day' +

              (firstweek ? ' firstweek' : '') +
              (date === 1 ? ' firstday' : '') +
              (day === 1 ? ' monday' : '') +
              (day === 0 || day === 6 ? ' weekend' : '') +
              (today === time ? ' today' : '') +
              (today > time ? ' past' : '') + '"' +

              (date === 1 ? ' data-started="' + year + '-' + ('0' + (month + 1)).slice(-2) + '"' : '') +
              ' data-date="' + year + '-' + ('0' + (month + 1)).slice(-2) + '-' + ('0' + date).slice(-2) + '"' +

              '>' + date + '<\/li>';

      time += one_day;

      day++;
      (day > 6) && (day = 0);
    }

    this.rendered++;

    return html;
  };



  $.extend(Calendar.prototype, utils);

  $.fn.zeptoCalendar = function(settings) {
    return this.length ? new Calendar(this, settings) : void 0;
  };

})(Zepto);
