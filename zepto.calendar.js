//
// Zepto calendar by @suprMax
//

(function($){
  var utils = {};
  utils.dateClone = function(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  utils.datePurify = function(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
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



  var Calendar = function(container, settings) {
    this.options = $.extend({
      start: this.dateToYMD(new Date())
    }, settings);

    this.block = container;

    this.datesList = this.block.find('.z-c-calendar');

    this.start = this.dateFromYMD(this.options.start);
    this.current = this.dateClone(this.start);
    this.today = new Date();

    this.initialize();
  };

  Calendar.prototype.initialize = function() {
    var html = this.firstRender();
    this.datesList.append(html);
  };

  Calendar.prototype.render = function() {
    var nextMonth = this.dateClone(this.current);
    nextMonth.setMonth(this.current.getMonth() + 1);

    this.datesList.append(this.renderMonth(nextMonth));
  };

  Calendar.prototype.firstRender = function() {
    var currentMonth = this.datePurify(this.start),
        prevMonth = this.dateClone(currentMonth); prevMonth.setMonth(this.start.getMonth() - 1);

    var prevDaysNum = this.dateMonthDaysNum(prevMonth),
        prefillDaysNum = (this.start.getDay() ? this.start.getDay() : 7),
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

    return html;
  };
  

  $.extend(Calendar.prototype, utils);

  $.fn.zeptoCalendar = function(settings) {
    return this.length ? new Calendar(this, settings) : void 0;
  };

})(Zepto);
