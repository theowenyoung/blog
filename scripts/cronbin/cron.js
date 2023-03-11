// https://www.npmjs.com/package/cron-schedule
const cronSchedule = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) =>
    key in obj
      ? __defProp(obj, key, {
          enumerable: true,
          configurable: true,
          writable: true,
          value,
        })
      : (obj[key] = value);
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === "object") || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj)) throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Cron: () => Cron,
    IntervalBasedCronScheduler: () => IntervalBasedCronScheduler,
    TIMEOUT_MAX: () => TIMEOUT_MAX,
    TimerBasedCronScheduler: () => TimerBasedCronScheduler,
    extractDateElements: () => extractDateElements,
    getDaysBetweenWeekdays: () => getDaysBetweenWeekdays,
    getDaysInMonth: () => getDaysInMonth,
    longTimeout: () => longTimeout,
    parseCronExpression: () => parseCronExpression,
    wrapFunction: () => wrapFunction,
  });

  // src/utils.ts
  var TIMEOUT_MAX = 2147483647;
  function longTimeout(fn, timeout, handle) {
    let after = 0;
    if (timeout > TIMEOUT_MAX) {
      after = timeout - TIMEOUT_MAX;
      timeout = TIMEOUT_MAX;
    }
    handle != null
      ? handle
      : (handle = {
          timeoutId: void 0,
        });
    handle.timeoutId = setTimeout(() => {
      if (after > 0) {
        longTimeout(fn, after, handle);
      } else {
        fn();
      }
    }, timeout);
    return handle;
  }
  function extractDateElements(date) {
    return {
      second: date.getSeconds(),
      minute: date.getMinutes(),
      hour: date.getHours(),
      day: date.getDate(),
      month: date.getMonth(),
      weekday: date.getDay(),
      year: date.getFullYear(),
    };
  }
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function getDaysBetweenWeekdays(weekday1, weekday2) {
    if (weekday1 <= weekday2) {
      return weekday2 - weekday1;
    }
    return 6 - weekday1 + weekday2 + 1;
  }
  function wrapFunction(fn, errorHandler) {
    return () => {
      try {
        const res = fn();
        if (res instanceof Promise) {
          res.catch((err) => {
            if (errorHandler) {
              errorHandler(err);
            }
          });
        }
      } catch (err) {
        if (errorHandler) {
          errorHandler(err);
        }
      }
    };
  }

  // src/schedulers/interval-based.ts
  var _interval, _intervalId, _tasks, _nextTaskId;
  var IntervalBasedCronScheduler = class {
    constructor(interval) {
      __privateAdd(this, _interval, void 0);
      __privateAdd(this, _intervalId, void 0);
      __privateAdd(this, _tasks, []);
      __privateAdd(this, _nextTaskId, 1);
      __privateSet(this, _interval, interval);
      this.start();
    }
    start() {
      if (__privateGet(this, _intervalId) !== void 0) {
        throw new Error("Scheduler already started.");
      }
      __privateSet(
        this,
        _intervalId,
        setInterval(this.processTasks.bind(this), __privateGet(this, _interval))
      );
    }
    stop() {
      if (__privateGet(this, _intervalId)) {
        clearInterval(__privateGet(this, _intervalId));
        __privateSet(this, _intervalId, void 0);
      }
    }
    insertTask(newTask) {
      const index = __privateGet(this, _tasks).findIndex(
        (task) => task.nextExecution.getTime() > newTask.nextExecution.getTime()
      );
      __privateGet(this, _tasks).splice(index, 0, newTask);
    }
    registerTask(cron, task, opts) {
      var _a;
      const id = __privateGet(this, _nextTaskId);
      this.insertTask({
        id,
        cron,
        nextExecution: cron.getNextDate(),
        task,
        isOneTimeTask:
          (_a = opts == null ? void 0 : opts.isOneTimeTask) != null
            ? _a
            : false,
        errorHandler: opts == null ? void 0 : opts.errorHandler,
      });
      __privateSet(this, _nextTaskId, __privateGet(this, _nextTaskId) + 1);
      return id;
    }
    unregisterTask(id) {
      const taskIndex = __privateGet(this, _tasks).findIndex(
        (task) => task.id === id
      );
      if (taskIndex === -1) throw new Error("Task not found.");
      __privateGet(this, _tasks).splice(taskIndex, 1);
    }
    sortTasks() {
      __privateGet(this, _tasks).sort((a, b) => {
        return a.nextExecution.getTime() - b.nextExecution.getTime();
      });
    }
    processTasks() {
      const now = Date.now();
      let taskExecuted = false;
      let oneTimeTaskExecuted = false;
      for (let i = 0; i < __privateGet(this, _tasks).length; i += 1) {
        const task = __privateGet(this, _tasks)[i];
        if (task.nextExecution.getTime() <= now) {
          wrapFunction(task.task, task.errorHandler)();
          if (!task.isOneTimeTask) {
            taskExecuted = true;
            task.nextExecution = task.cron.getNextDate();
          } else {
            oneTimeTaskExecuted = true;
          }
        } else {
          break;
        }
      }
      if (oneTimeTaskExecuted) {
        __privateSet(
          this,
          _tasks,
          __privateGet(this, _tasks).filter(
            (task) => task.nextExecution.getTime() > now
          )
        );
      }
      if (taskExecuted) {
        this.sortTasks();
      }
    }
  };
  _interval = new WeakMap();
  _intervalId = new WeakMap();
  _tasks = new WeakMap();
  _nextTaskId = new WeakMap();

  // src/schedulers/timer-based.ts
  var TimerBasedCronScheduler = class {
    static setTimeout(cron, task, opts) {
      const nextSchedule = cron.getNextDate();
      const timeout = nextSchedule.getTime() - Date.now();
      return longTimeout(
        wrapFunction(task, opts == null ? void 0 : opts.errorHandler),
        timeout
      );
    }
    static setInterval(cron, task, opts) {
      var _a;
      const handle =
        (_a = opts == null ? void 0 : opts.handle) != null
          ? _a
          : { timeoutId: void 0 };
      const { timeoutId } = this.setTimeout(cron, () => {
        wrapFunction(task, opts == null ? void 0 : opts.errorHandler)();
        this.setInterval(
          cron,
          task,
          __spreadProps(__spreadValues({}, opts), { handle })
        );
      });
      handle.timeoutId = timeoutId;
      return handle;
    }
    static clearTimeoutOrInterval(handle) {
      if (handle.timeoutId) {
        clearTimeout(handle.timeoutId);
      }
    }
  };

  // src/cron.ts
  var Cron = class {
    constructor({ seconds, minutes, hours, days, months, weekdays }) {
      if (!seconds || seconds.size === 0)
        throw new Error("There must be at least one allowed second.");
      if (!minutes || minutes.size === 0)
        throw new Error("There must be at least one allowed minute.");
      if (!hours || hours.size === 0)
        throw new Error("There must be at least one allowed hour.");
      if (!months || months.size === 0)
        throw new Error("There must be at least one allowed month.");
      if ((!weekdays || weekdays.size === 0) && (!days || days.size === 0))
        throw new Error("There must be at least one allowed day or weekday.");
      this.seconds = Array.from(seconds).sort((a, b) => a - b);
      this.minutes = Array.from(minutes).sort((a, b) => a - b);
      this.hours = Array.from(hours).sort((a, b) => a - b);
      this.days = Array.from(days).sort((a, b) => a - b);
      this.months = Array.from(months).sort((a, b) => a - b);
      this.weekdays = Array.from(weekdays).sort((a, b) => a - b);
      const validateData = (name, data, constraint) => {
        if (
          data.some(
            (x) =>
              typeof x !== "number" ||
              x % 1 !== 0 ||
              x < constraint.min ||
              x > constraint.max
          )
        ) {
          throw new Error(
            `${name} must only consist of integers which are within the range of ${constraint.min} and ${constraint.max}`
          );
        }
      };
      validateData("seconds", this.seconds, { min: 0, max: 59 });
      validateData("minutes", this.minutes, { min: 0, max: 59 });
      validateData("hours", this.hours, { min: 0, max: 23 });
      validateData("days", this.days, { min: 1, max: 31 });
      validateData("months", this.months, { min: 0, max: 11 });
      validateData("weekdays", this.weekdays, { min: 0, max: 6 });
      this.reversed = {
        seconds: this.seconds.map((x) => x).reverse(),
        minutes: this.minutes.map((x) => x).reverse(),
        hours: this.hours.map((x) => x).reverse(),
        days: this.days.map((x) => x).reverse(),
        months: this.months.map((x) => x).reverse(),
        weekdays: this.weekdays.map((x) => x).reverse(),
      };
    }
    findAllowedHour(dir, startHour) {
      return dir === "next"
        ? this.hours.find((x) => x >= startHour)
        : this.reversed.hours.find((x) => x <= startHour);
    }
    findAllowedMinute(dir, startMinute) {
      return dir === "next"
        ? this.minutes.find((x) => x >= startMinute)
        : this.reversed.minutes.find((x) => x <= startMinute);
    }
    findAllowedSecond(dir, startSecond) {
      return dir === "next"
        ? this.seconds.find((x) => x > startSecond)
        : this.reversed.seconds.find((x) => x < startSecond);
    }
    findAllowedTime(dir, startTime) {
      let hour = this.findAllowedHour(dir, startTime.hour);
      if (hour !== void 0) {
        if (hour === startTime.hour) {
          let minute = this.findAllowedMinute(dir, startTime.minute);
          if (minute !== void 0) {
            if (minute === startTime.minute) {
              const second = this.findAllowedSecond(dir, startTime.second);
              if (second !== void 0) {
                return { hour, minute, second };
              } else {
                minute = this.findAllowedMinute(
                  dir,
                  dir === "next" ? startTime.minute + 1 : startTime.minute - 1
                );
                if (minute !== void 0) {
                  return {
                    hour,
                    minute,
                    second:
                      dir === "next"
                        ? this.seconds[0]
                        : this.reversed.seconds[0],
                  };
                }
              }
            } else {
              return {
                hour,
                minute,
                second:
                  dir === "next" ? this.seconds[0] : this.reversed.seconds[0],
              };
            }
          }
          hour = this.findAllowedHour(
            dir,
            dir === "next" ? startTime.hour + 1 : startTime.hour - 1
          );
          if (hour !== void 0) {
            return {
              hour,
              minute:
                dir === "next" ? this.minutes[0] : this.reversed.minutes[0],
              second:
                dir === "next" ? this.seconds[0] : this.reversed.seconds[0],
            };
          }
        } else {
          return {
            hour,
            minute: dir === "next" ? this.minutes[0] : this.reversed.minutes[0],
            second: dir === "next" ? this.seconds[0] : this.reversed.seconds[0],
          };
        }
      }
      return void 0;
    }
    findAllowedDayInMonth(dir, year, month, startDay) {
      var _a, _b;
      if (startDay < 1) throw new Error("startDay must not be smaller than 1.");
      const daysInMonth = getDaysInMonth(year, month);
      const daysRestricted = this.days.length !== 31;
      const weekdaysRestricted = this.weekdays.length !== 7;
      if (!daysRestricted && !weekdaysRestricted) {
        if (startDay > daysInMonth) {
          return dir === "next" ? void 0 : daysInMonth;
        }
        return startDay;
      }
      let allowedDayByDays;
      if (daysRestricted) {
        allowedDayByDays =
          dir === "next"
            ? this.days.find((x) => x >= startDay)
            : this.reversed.days.find((x) => x <= startDay);
        if (allowedDayByDays !== void 0 && allowedDayByDays > daysInMonth) {
          allowedDayByDays = void 0;
        }
      }
      let allowedDayByWeekdays;
      if (weekdaysRestricted) {
        const startWeekday = new Date(year, month, startDay).getDay();
        const nearestAllowedWeekday =
          dir === "next"
            ? (_a = this.weekdays.find((x) => x >= startWeekday)) != null
              ? _a
              : this.weekdays[0]
            : (_b = this.reversed.weekdays.find((x) => x <= startWeekday)) !=
              null
            ? _b
            : this.reversed.weekdays[0];
        if (nearestAllowedWeekday !== void 0) {
          const daysBetweenWeekdays =
            dir === "next"
              ? getDaysBetweenWeekdays(startWeekday, nearestAllowedWeekday)
              : getDaysBetweenWeekdays(nearestAllowedWeekday, startWeekday);
          allowedDayByWeekdays =
            dir === "next"
              ? startDay + daysBetweenWeekdays
              : startDay - daysBetweenWeekdays;
          if (allowedDayByWeekdays > daysInMonth || allowedDayByWeekdays < 1) {
            allowedDayByWeekdays = void 0;
          }
        }
      }
      if (allowedDayByDays !== void 0 && allowedDayByWeekdays !== void 0) {
        return dir === "next"
          ? Math.min(allowedDayByDays, allowedDayByWeekdays)
          : Math.max(allowedDayByDays, allowedDayByWeekdays);
      }
      if (allowedDayByDays !== void 0) {
        return allowedDayByDays;
      }
      if (allowedDayByWeekdays !== void 0) {
        return allowedDayByWeekdays;
      }
      return void 0;
    }
    getNextDate(startDate = new Date()) {
      const startDateElements = extractDateElements(startDate);
      let minYear = startDateElements.year;
      let startIndexMonth = this.months.findIndex(
        (x) => x >= startDateElements.month
      );
      if (startIndexMonth === -1) {
        startIndexMonth = 0;
        minYear++;
      }
      const maxIterations = this.months.length * 5;
      for (let i = 0; i < maxIterations; i++) {
        const year =
          minYear + Math.floor((startIndexMonth + i) / this.months.length);
        const month = this.months[(startIndexMonth + i) % this.months.length];
        const isStartMonth =
          year === startDateElements.year && month === startDateElements.month;
        let day = this.findAllowedDayInMonth(
          "next",
          year,
          month,
          isStartMonth ? startDateElements.day : 1
        );
        let isStartDay = isStartMonth && day === startDateElements.day;
        if (day !== void 0 && isStartDay) {
          const nextTime = this.findAllowedTime("next", startDateElements);
          if (nextTime !== void 0) {
            return new Date(
              year,
              month,
              day,
              nextTime.hour,
              nextTime.minute,
              nextTime.second
            );
          }
          day = this.findAllowedDayInMonth("next", year, month, day + 1);
          isStartDay = false;
        }
        if (day !== void 0 && !isStartDay) {
          return new Date(
            year,
            month,
            day,
            this.hours[0],
            this.minutes[0],
            this.seconds[0]
          );
        }
      }
      throw new Error("No valid next date was found.");
    }
    getNextDates(amount, startDate) {
      const dates = [];
      let nextDate;
      for (let i = 0; i < amount; i++) {
        nextDate = this.getNextDate(nextDate != null ? nextDate : startDate);
        dates.push(nextDate);
      }
      return dates;
    }
    *getNextDatesIterator(startDate, endDate) {
      let nextDate;
      while (true) {
        nextDate = this.getNextDate(startDate);
        startDate = nextDate;
        if (endDate && endDate.getTime() < nextDate.getTime()) {
          return;
        }
        yield nextDate;
      }
    }
    getPrevDate(startDate = new Date()) {
      const startDateElements = extractDateElements(startDate);
      let maxYear = startDateElements.year;
      let startIndexMonth = this.reversed.months.findIndex(
        (x) => x <= startDateElements.month
      );
      if (startIndexMonth === -1) {
        startIndexMonth = 0;
        maxYear--;
      }
      const maxIterations = this.reversed.months.length * 5;
      for (let i = 0; i < maxIterations; i++) {
        const year =
          maxYear -
          Math.floor((startIndexMonth + i) / this.reversed.months.length);
        const month =
          this.reversed.months[
            (startIndexMonth + i) % this.reversed.months.length
          ];
        const isStartMonth =
          year === startDateElements.year && month === startDateElements.month;
        let day = this.findAllowedDayInMonth(
          "prev",
          year,
          month,
          isStartMonth ? startDateElements.day : 31
        );
        let isStartDay = isStartMonth && day === startDateElements.day;
        if (day !== void 0 && isStartDay) {
          const prevTime = this.findAllowedTime("prev", startDateElements);
          if (prevTime !== void 0) {
            return new Date(
              year,
              month,
              day,
              prevTime.hour,
              prevTime.minute,
              prevTime.second
            );
          }
          if (day > 1) {
            day = this.findAllowedDayInMonth("prev", year, month, day - 1);
            isStartDay = false;
          }
        }
        if (day !== void 0 && !isStartDay) {
          return new Date(
            year,
            month,
            day,
            this.reversed.hours[0],
            this.reversed.minutes[0],
            this.reversed.seconds[0]
          );
        }
      }
      throw new Error("No valid previous date was found.");
    }
    getPrevDates(amount, startDate) {
      const dates = [];
      let prevDate;
      for (let i = 0; i < amount; i++) {
        prevDate = this.getPrevDate(prevDate != null ? prevDate : startDate);
        dates.push(prevDate);
      }
      return dates;
    }
    *getPrevDatesIterator(startDate, endDate) {
      let prevDate;
      while (true) {
        prevDate = this.getPrevDate(startDate);
        startDate = prevDate;
        if (endDate && endDate.getTime() > prevDate.getTime()) {
          return;
        }
        yield prevDate;
      }
    }
    matchDate(date) {
      const { second, minute, hour, day, month, weekday } =
        extractDateElements(date);
      if (
        this.seconds.indexOf(second) === -1 ||
        this.minutes.indexOf(minute) === -1 ||
        this.hours.indexOf(hour) === -1 ||
        this.months.indexOf(month) === -1
      ) {
        return false;
      }
      if (this.days.length !== 31 && this.weekdays.length !== 7) {
        return (
          this.days.indexOf(day) !== -1 || this.weekdays.indexOf(weekday) !== -1
        );
      }
      return (
        this.days.indexOf(day) !== -1 && this.weekdays.indexOf(weekday) !== -1
      );
    }
  };

  // src/cron-parser.ts
  var secondConstraint = {
    min: 0,
    max: 59,
  };
  var minuteConstraint = {
    min: 0,
    max: 59,
  };
  var hourConstraint = {
    min: 0,
    max: 23,
  };
  var dayConstraint = {
    min: 1,
    max: 31,
  };
  var monthConstraint = {
    min: 1,
    max: 12,
    aliases: {
      jan: "1",
      feb: "2",
      mar: "3",
      apr: "4",
      may: "5",
      jun: "6",
      jul: "7",
      aug: "8",
      sep: "9",
      oct: "10",
      nov: "11",
      dec: "12",
    },
  };
  var weekdayConstraint = {
    min: 0,
    max: 6,
    aliases: {
      7: "0",
      sun: "0",
      mon: "1",
      tue: "2",
      wed: "3",
      thu: "4",
      fri: "5",
      sat: "6",
    },
  };
  var timeNicknames = {
    "@yearly": "0 0 1 1 *",
    "@annually": "0 0 1 1 *",
    "@monthly": "0 0 1 1 *",
    "@weekly": "0 0 * * 0",
    "@daily": "0 0 * * *",
    "@hourly": "0 * * * *",
    "@minutely": "* * * * *",
  };
  function parseElement(element, constraint) {
    const result = /* @__PURE__ */ new Set();
    if (element === "*") {
      for (let i = constraint.min; i <= constraint.max; i = i + 1) {
        result.add(i);
      }
      return result;
    }
    const listElements = element.split(",");
    if (listElements.length > 1) {
      listElements.forEach((listElement) => {
        const parsedListElement = parseElement(listElement, constraint);
        parsedListElement.forEach((x) => result.add(x));
      });
      return result;
    }
    const parseSingleElement = (singleElement) => {
      var _a, _b;
      singleElement =
        (_b =
          (_a = constraint.aliases) == null
            ? void 0
            : _a[singleElement.toLowerCase()]) != null
          ? _b
          : singleElement;
      const parsedElement = parseInt(singleElement, 10);
      if (Number.isNaN(parsedElement)) {
        throw new Error(`Failed to parse ${element}: ${singleElement} is NaN.`);
      }
      if (parsedElement < constraint.min || parsedElement > constraint.max) {
        throw new Error(
          `Failed to parse ${element}: ${singleElement} is outside of constraint range of ${constraint.min} - ${constraint.max}.`
        );
      }
      return parsedElement;
    };
    const rangeSegments =
      /^((([0-9a-zA-Z]+)-([0-9a-zA-Z]+))|\*)(\/([0-9]+))?$/.exec(element);
    if (rangeSegments === null) {
      result.add(parseSingleElement(element));
      return result;
    }
    const parsedStart =
      rangeSegments[1] === "*"
        ? constraint.min
        : parseSingleElement(rangeSegments[3]);
    const parsedEnd =
      rangeSegments[1] === "*"
        ? constraint.max
        : parseSingleElement(rangeSegments[4]);
    if (parsedStart > parsedEnd) {
      throw new Error(
        `Failed to parse ${element}: Invalid range (start: ${parsedStart}, end: ${parsedEnd}).`
      );
    }
    const step = rangeSegments[6];
    let parsedStep = 1;
    if (step !== void 0) {
      parsedStep = parseInt(step, 10);
      if (Number.isNaN(parsedStep)) {
        throw new Error(`Failed to parse step: ${step} is NaN.`);
      } else if (parsedStep < 1) {
        throw new Error(
          `Failed to parse step: Expected ${step} to be greater than 0.`
        );
      }
    }
    for (let i = parsedStart; i <= parsedEnd; i = i + parsedStep) {
      result.add(i);
    }
    return result;
  }
  function parseCronExpression(cronExpression) {
    var _a;
    if (typeof cronExpression !== "string") {
      throw new TypeError("Invalid cron expression: must be of type string.");
    }
    cronExpression =
      (_a = timeNicknames[cronExpression.toLowerCase()]) != null
        ? _a
        : cronExpression;
    const elements = cronExpression.split(" ");
    if (elements.length < 5 || elements.length > 6) {
      throw new Error("Invalid cron expression: expected 5 or 6 elements.");
    }
    const rawSeconds = elements.length === 6 ? elements[0] : "0";
    const rawMinutes = elements.length === 6 ? elements[1] : elements[0];
    const rawHours = elements.length === 6 ? elements[2] : elements[1];
    const rawDays = elements.length === 6 ? elements[3] : elements[2];
    const rawMonths = elements.length === 6 ? elements[4] : elements[3];
    const rawWeekdays = elements.length === 6 ? elements[5] : elements[4];
    return new Cron({
      seconds: parseElement(rawSeconds, secondConstraint),
      minutes: parseElement(rawMinutes, minuteConstraint),
      hours: parseElement(rawHours, hourConstraint),
      days: parseElement(rawDays, dayConstraint),
      months: new Set(
        Array.from(parseElement(rawMonths, monthConstraint)).map((x) => x - 1)
      ),
      weekdays: parseElement(rawWeekdays, weekdayConstraint),
    });
  }
  return __toCommonJS(src_exports);
})();

const cron = cronSchedule.parseCronExpression("fdasfdasf");
const next = cron.getNextDate();
const prev = cron.getPrevDate();
console.log("next", next);
console.log("prev", prev);
