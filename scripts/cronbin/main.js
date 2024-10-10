// Modify thisurlToFetchOptions
const APIKEY = "abc";

export default {
  async fetch(request, env) {
    try {
      const responseArray = await handleRequest(request, env);
      const contentType = responseArray[1] || "application/json";
      if (contentType === "redirect") {
        const response = new Response(`Redirect to ${responseArray[0]}`, {
          status: 302,
          headers: {
            Location: responseArray[0],
          },
        });
        return response;
      } else if (typeof contentType === "string") {
        const response = new Response(responseArray[0], {
          headers: {
            "Content-Type": contentType,
          },
        });
        return response;
      } else {
        // headers
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(contentType)) {
          for (const v of value) {
            responseHeaders.append(key, v);
          }
        }
        const response = new Response(responseArray[0], {
          headers: responseHeaders,
        });
        return response;
      }
    } catch (e) {
      console.warn("handle request error", e);
      return errorToResponse(e);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkAndRunTasks(env));
  },
};

// https://www.npmjs.com/package/cron-schedule
export const cronSchedule = (() => {
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
        setInterval(
          this.processTasks.bind(this),
          __privateGet(this, _interval),
        ),
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
        (task) =>
          task.nextExecution.getTime() > newTask.nextExecution.getTime(),
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
        (task) => task.id === id,
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
            (task) => task.nextExecution.getTime() > now,
          ),
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
        timeout,
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
          __spreadProps(__spreadValues({}, opts), { handle }),
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
              x > constraint.max,
          )
        ) {
          throw new Error(
            `${name} must only consist of integers which are within the range of ${constraint.min} and ${constraint.max}`,
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
                  dir === "next" ? startTime.minute + 1 : startTime.minute - 1,
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
            dir === "next" ? startTime.hour + 1 : startTime.hour - 1,
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
        (x) => x >= startDateElements.month,
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
          isStartMonth ? startDateElements.day : 1,
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
              nextTime.second,
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
            this.seconds[0],
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
        (x) => x <= startDateElements.month,
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
          isStartMonth ? startDateElements.day : 31,
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
              prevTime.second,
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
            this.reversed.seconds[0],
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
          `Failed to parse ${element}: ${singleElement} is outside of constraint range of ${constraint.min} - ${constraint.max}.`,
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
        `Failed to parse ${element}: Invalid range (start: ${parsedStart}, end: ${parsedEnd}).`,
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
          `Failed to parse step: Expected ${step} to be greater than 0.`,
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
        Array.from(parseElement(rawMonths, monthConstraint)).map((x) => x - 1),
      ),
      weekdays: parseElement(rawWeekdays, weekdayConstraint),
    });
  }
  return __toCommonJS(src_exports);
})();

async function handleRequest(request, env) {
  if (!env.CRONBIN) {
    throw new HTTPError(
      "kvNotFound",
      "Not Found KV Database Bind",
      500,
      "Interval Server Error",
    );
  }

  // first check if the request is authorized
  const { headers } = request;
  const urlObj = new URL(request.url);
  const { pathname } = urlObj;

  const authorization = headers.get("Authorization");
  const headerAuthorizationValue = `Bearer ${APIKEY}`;
  if (authorization) {
    if (authorization !== headerAuthorizationValue) {
      // if not authorized, return 401
      throw new HTTPError(
        "unauthorized",
        "Authrorization Bearer abc is required",
        401,
        "Unauthorized",
      );
    }
  } else if (urlObj.searchParams.has("key")) {
    const keyFromQuery = urlObj.searchParams.get("key");
    if (keyFromQuery !== APIKEY) {
      throw new HTTPError(
        "unauthorized",
        "search query key=abc is required",
        401,
        "Unauthorized",
      );
    }
  } else {
    // check cookie
    const cookie = headers.get("cookie");
    const apiKey = getCookieValue(cookie, "key");
    if (apiKey !== APIKEY) {
      throw new HTTPError(
        "unauthorized",
        "Authrorization Bearer abc or search query key=abc is required",
        401,
        "Unauthorized",
      );
    }
  }

  if (pathname === "/") {
    const data = await getData(env);
    const cookie = headers.get("cookie");
    let clientOffset = getCookieValue(cookie, "_clientOffset");
    if (!clientOffset) {
      clientOffset = 0;
    }
    clientOffset = Number(clientOffset);

    const body = getIndexHtml(data, clientOffset);
    const responseHeaders = {
      "Content-Type": ["text/html"],
    };

    // send cookie if changed
    const apiKey = getCookieValue(cookie, "key");
    const domain = request.headers.get("host")?.split(":")[0];
    if (apiKey !== APIKEY) {
      responseHeaders["set-cookie"] = [
        `key=${APIKEY}; HttpOnly; Max-Age=9999999999999999999999999999; Domain=${domain}; Path=/;`,
      ];
    }
    return [body, responseHeaders];
  } else if (pathname.startsWith("/tasks")) {
    const data = await getData(env);
    if (pathname === "/tasks") {
      // add task
      const formData = await request.formData();
      const interval = formData.get("interval");
      const url = formData.get("url");
      if (!interval) {
        throw new HTTPError(
          "intervalRequired",
          "interval is required",
          400,
          "Bad Request",
        );
      }
      // check interval is valid
      if (!isValidInterval(interval)) {
        throw new HTTPError(
          "invalidInterval",
          "interval is invalid",
          400,
          "Bad Request",
        );
      }
      if (!url) {
        throw new HTTPError(
          "urlRequired",
          "url is required",
          400,
          "Bad Request",
        );
      }

      if (!isValidUrl(url)) {
        throw new HTTPError("invalidUrl", "url is invalid", 400, "Bad Request");
      }
      let note = formData.get("note") || "";
      if (note) {
        note = note.slice(0, 150);
      }

      const { tasks } = data;
      const taskKeys = Object.keys(tasks);
      const sortedTaskKeys = taskKeys.sort((a, b) => {
        return tasks[a] - tasks[b];
      });
      // find the largest task key
      const largestTaskKey = sortedTaskKeys[sortedTaskKeys.length - 1];
      const nextTaskKey = largestTaskKey ? Number(largestTaskKey) + 1 : 1;
      data.tasks[nextTaskKey] = {
        interval,
        url,
        note,
        fetch_options: urlToFetchOptions(url),
      };
      await setData(env, data);
      return ["/", "redirect"];
    }

    const taskRunPattern = new URLPattern({
      pathname: "/tasks/:id/run",
      baseURL: urlObj.origin,
    });

    // check if url match run pattern
    const match = taskRunPattern.exec(request.url);
    if (
      match &&
      match.pathname &&
      match.pathname.groups &&
      match.pathname.groups.id
    ) {
      const { id } = match.pathname.groups;
      const task = data.tasks[id];
      if (!task) {
        throw new HTTPError(
          "taskNotFound",
          "Task not found",
          404,
          "The requested resource was not found",
        );
      }
      // first we should save it.

      const formData = await request.formData();
      const interval = formData.get("interval");
      const url = formData.get("url");
      if (!interval) {
        throw new HTTPError(
          "intervalRequired",
          "interval is required",
          400,
          "Bad Request",
        );
      }

      // check interval is valid
      if (!isValidInterval(interval)) {
        throw new HTTPError(
          "invalidInterval",
          "interval is invalid",
          400,
          "Bad Request",
        );
      }
      if (!url) {
        throw new HTTPError(
          "urlRequired",
          "url is required",
          400,
          "Bad Request",
        );
      }

      if (!isValidUrl(url)) {
        throw new HTTPError("invalidUrl", "url is invalid", 400, "Bad Request");
      }
      let note = formData.get("note") || "";
      if (note) {
        note = note.slice(0, 150);
      }

      // check is same
      //
      if (
        !(
          data.tasks[id].interval === interval &&
          data.tasks[id].url === url &&
          data.tasks[id].note === note
        )
      ) {
        // find the largest task key
        data.tasks[id] = {
          ...task,
          interval,
          url,
          note,
          fetch_options: urlToFetchOptions(url),
        };
        await setData(env, data);
      }

      // run task
      await runTasks([id], data, env);
      // redirect to /
      return ["/", "redirect"];
    } else {
      const taskEditPattern = new URLPattern({
        pathname: "/tasks/:id/edit",
        baseURL: urlObj.origin,
      });
      const editMatch = taskEditPattern.exec(request.url);
      if (
        editMatch &&
        editMatch.pathname &&
        editMatch.pathname.groups &&
        editMatch.pathname.groups.id
      ) {
        const { id } = editMatch.pathname.groups;
        const task = data.tasks[id];
        if (!task) {
          throw new HTTPError(
            "taskNotFound",
            "Task not found",
            404,
            "The requested resource was not found",
          );
        }

        const formData = await request.formData();
        const interval = formData.get("interval");
        const url = formData.get("url");
        const enabled = formData.get("enabled");
        if (!interval) {
          throw new HTTPError(
            "intervalRequired",
            "interval is required",
            400,
            "Bad Request",
          );
        }

        // check interval is valid
        if (!isValidInterval(interval)) {
          throw new HTTPError(
            "invalidInterval",
            "interval is invalid",
            400,
            "Bad Request",
          );
        }
        if (!url) {
          throw new HTTPError(
            "urlRequired",
            "url is required",
            400,
            "Bad Request",
          );
        }

        if (!isValidUrl(url)) {
          throw new HTTPError(
            "invalidUrl",
            "url is invalid",
            400,
            "Bad Request",
          );
        }
        let note = formData.get("note") || "";
        if (note) {
          note = note.slice(0, 150);
        }

        // find the largest task key
        data.tasks[id] = {
          ...task,
          interval,
          url,
          note,
          fetch_options: urlToFetchOptions(url),
          enabled: enabled === "on" ? true : false,
        };
        await setData(env, data);
        return ["/", "redirect"];
      }

      const taskDeletePattern = new URLPattern({
        pathname: "/tasks/:id/delete",
        baseURL: urlObj.origin,
      });
      const taskDeletePatternMatch = taskDeletePattern.exec(request.url);
      if (
        taskDeletePatternMatch &&
        taskDeletePatternMatch.pathname &&
        taskDeletePatternMatch.pathname.groups &&
        taskDeletePatternMatch.pathname.groups.id
      ) {
        const { id } = taskDeletePatternMatch.pathname.groups;
        const task = data.tasks[id];
        if (!task) {
          throw new HTTPError(
            "taskNotFound",
            "Task not found",
            404,
            "The requested resource was not found",
          );
        }
        // delete task
        delete data.tasks[id];
        await setData(env, data);
        return ["/", "redirect"];
      }

      throw new HTTPError(
        "taskRouteNotFound",
        "Task route not found",
        404,
        "The requested resource was not found",
      );
    }
  } else if (pathname === "/notification") {
    const data = await getData(env);
    const formData = await request.formData();
    const notification_curl = formData.get("notification_curl") || "";
    if (notification_curl && !isValidUrl(notification_curl)) {
      throw new HTTPError(
        "invalidNotification_curl",
        "notification_curl is invalid",
        400,
        "Bad Request",
      );
    }
    data.notification_curl = notification_curl;
    if (notification_curl) {
      data.notification_fetch_options = urlToFetchOptions(notification_curl);
    } else {
      delete data.notification_fetch_options;
    }

    await setData(env, data);
    return ["/", "redirect"];
  } else if (pathname === "/api/data") {
    // yes authorized, continue
    if (request.method === "POST") {
      // add task
      let json = "";
      try {
        json = JSON.stringify(await request.json());
      } catch (e) {
        throw new HTTPError(
          "jsonParseError",
          "request body JSON is not valid, " + e.message,
          400,
          "Bad Request",
        );
      }
      await setData(env, json);
      return ['{"ok":true}'];
    } else {
      const data = await getData(env);
      return [JSON.stringify(data, null, 2)];
    }
  }
  throw new HTTPError(
    "notFound",
    "Not Found",
    404,
    "The requested resource was not found",
  );
}

export async function checkAndRunTasks(env) {
  const now = new Date();
  const data = await getData(env);
  const taksIds = getCurrentTaskIds(now.toISOString(), data);
  if (!taksIds || taksIds.length === 0) {
    return;
  }
  await runTasks(taksIds, data, env);
}

export async function runTasks(taksIds, data, env) {
  const fetchOptionsArr = [];
  for (const taskId of taksIds) {
    const task = data.tasks[taskId];
    if (!task) {
      continue;
    }
    const { fetch_options } = task;
    if (fetch_options) {
      fetchOptionsArr.push(fetch_options);
    }
  }
  const notification_fetch_options = data.notification_fetch_options;

  // promise settled
  const results = await Promise.allSettled(
    fetchOptionsArr.map((options) => {
      return fetch(options.url, options).then((res) => {
        return res.text().then((body) => {
          if (res.ok) {
            return body;
          } else {
            throw new Error(`${res.status}: ${res.statusText}, \n${body}`);
          }
        });
      });
    }),
  );
  const now = new Date();
  let globalError = null;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const taskId = taksIds[i];
    if (!data.tasks[taskId].logs) {
      data.tasks[taskId].logs = [];
    }
    // check logs is too long, if so, remove the last one
    if (data.tasks[taskId].logs.length >= 10) {
      data.tasks[taskId].logs.pop();
    }
    if (result.status === "fulfilled") {
      data.tasks[taskId].logs.unshift({
        run_at: now.toISOString(),
        ok: true,
      });
    } else {
      const { reason } = result;
      let failedMessage = reason.message || "unknownError";
      failedMessage = failedMessage.slice(0, 150);

      globalError = globalError || failedMessage;
      console.warn("task failed", reason);
      data.tasks[taskId].logs.unshift({
        run_at: now.toISOString(),
        ok: false,
        message: failedMessage,
      });
    }
  }

  // if data is changed, update it
  await setData(env, data);
  if (globalError && notification_fetch_options) {
    let { url, method, headers, body } = notification_fetch_options;
    const finalHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0",
      ...headers,
    };
    // replace \n  for json

    let finalGlobalMessage = globalError
      .replace(/\n/g, "\\n")
      .replace(/"/g, '\\"');
    finalGlobalMessage = finalGlobalMessage + " -- cronbin";
    let finalBody = "";
    if (body) {
      finalBody = body.replace(/{{message}}/g, finalGlobalMessage);
    }
    if (url.includes("{{message}}")) {
      url = url.replace(/{{message}}/g, encodeURIComponent(finalGlobalMessage));
    }
    const fetchOptions = {
      method,
      headers: finalHeaders,
    };
    if (method !== "GET" && method !== "HEAD" && finalBody) {
      fetchOptions.body = finalBody;
    }

    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    if (!res.ok) {
      const notificationError = new Error(
        `notification failed: ${res.status}: ${res.statusText}, ${text}`,
      );
      console.warn("notification error", notificationError);
    }
  }
}

export function urlToFetchOptions(url) {
  let finalUrl = "";
  const finalOptions = {};
  // check url is valid url or curl
  try {
    new URL(url);
    finalUrl = url;
  } catch (_e) {
    // not valid url, try to parse it as curl
    const curlOptions = parseCurl(url);
    finalUrl = curlOptions.url;
    if (curlOptions.method) {
      finalOptions.method = curlOptions.method;
    }

    if (curlOptions.headers) {
      finalOptions.headers = curlOptions.headers;
    }
    if (curlOptions.body) {
      finalOptions.body = curlOptions.body;
    }
  }
  if (!finalOptions.headers) {
    finalOptions.headers = {};
  }
  if (!finalOptions.headers["User-Agent"]) {
    finalOptions.headers["User-Agent"] =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0";
  }
  finalOptions.url = finalUrl;
  return finalOptions;
}

export function getCurrentTaskIds(now, data) {
  if (!data || !data.tasks) {
    return;
  }
  const nowDate = new Date(now);
  const { tasks } = data;
  const taskKeys = Object.keys(tasks);
  const finalTasks = [];
  for (const key of taskKeys) {
    const task = tasks[key];
    if (!task) {
      continue;
    }
    let lastRunAt = new Date(0);
    let { interval, logs } = task;

    if (logs && logs.length > 0) {
      lastRunAt = new Date(logs[0].run_at);
    }

    const diff = nowDate.getTime() - lastRunAt.getTime();

    const num = Number(interval);

    if (!isNaN(num)) {
      if (num >= 1) {
        // yes valid

        if (diff >= interval * 60 * 1000) {
          finalTasks.push(key);
        }
      } else {
        throw new Error("interval must be greater than 1");
      }
    } else {
      const cron = cronSchedule.parseCronExpression(interval);
      const prevDate = cron.getPrevDate(nowDate);
      if (prevDate.getTime() > lastRunAt.getTime()) {
        // yes please run
        finalTasks.push(key);
      }
    }
  }
  return finalTasks;
}

async function getData(env) {
  const value = await env.CRONBIN.get("data");
  if (value === null) {
    return {
      tasks: {},
    };
  }
  return JSON.parse(value);
}

async function setData(env, data) {
  await env.CRONBIN.put("data", JSON.stringify(data, null, 2));
}

function errorToResponse(error) {
  const bodyJson = {
    ok: false,
    error: "Internal Server Error",
    message: "Internal Server Error",
  };
  let status = 500;
  let statusText = "Internal Server Error";

  if (error instanceof Error) {
    bodyJson.message = error.message;
    bodyJson.error = error.name;

    if (error.status) {
      status = error.status;
    }
    if (error.statusText) {
      statusText = error.statusText;
    }
  }
  return new Response(JSON.stringify(bodyJson, null, 2), {
    status: status,
    statusText: statusText,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

class HTTPError extends Error {
  constructor(name, message, status, statusText) {
    super(message);
    this.name = name;
    this.status = status;
    this.statusText = statusText;
  }
}

function getIndexHtml(data, _clientOffset) {
  let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">
      <title>Cronbin</title>
      <style>
        .w-md {
          width: 5rem;
        }
        .w-lg {
          width: 20rem;
        }
        .mr {
          margin-right: 1rem;
        }
        .mb {
          margin-bottom: 0.5rem;
        }
        div.table 
        {
          display:table;
          border: 1px solid black;
          border-collapse: collapse;
        }
        form.tr, div.tr
        {
          display:table-row;
          border: 1px solid black;
          border-collapse: collapse;
        }
        span.td
        {
          display:table-cell;
          padding: 8px;
          max-width: 30rem;
          border: 1px solid black;
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
  `;
  const taskKeys = Object.keys(data.tasks);
  // sort it
  taskKeys.sort((a, b) => {
    return b - a;
  });

  const tasksLists = taskKeys
    .map((key) => {
      const task = data.tasks[key];
      if (!task) {
        return "";
      }
      let { interval, url, logs, note } = task;
      if (!note) {
        note = "";
      }
      let logsHtml = "";
      if (logs && logs.length > 0) {
        const latestLog = encodeHTML(logToText(logs[0], _clientOffset));
        let moreLogsHtml = "";
        if (logs.length > 1) {
          moreLogsHtml = ``;
          for (let i = 1; i < logs.length; i++) {
            let logDetail = logToText(logs[i], _clientOffset);

            logDetail = encodeHTML(logDetail);
            moreLogsHtml += "<p>" + logDetail + "</p>";
          }
          moreLogsHtml += ``;
        }

        logsHtml = `<details><summary>${latestLog}</summary>${moreLogsHtml}</details>`;
      }
      let checked = true;
      if (task.enabled === false) {
        checked = false;
      }
      return `<form autocomplete="off" class="tr" method="POST">
   <span class="td"><input name="enabled" type="checkbox" ${
     checked ? 'checked="checked"' : ""
   } autocomplete="false" >${key}</span><span class="td"><input type="submit" formaction="/tasks/${key}/edit" style="visibility: hidden; display: none;"><input class="w-md" type="text" autocomplete="off" name="interval" value="${interval}" required placeholder="*/5 * * *" /></span>
  <span class="td"><textarea rows="1" class="w-lg" name="url" autocomplete="off" rqeuired placeholder="URL or curl command">${url}</textarea></span>     
  <span class="td"><input class="mr mb" type="submit" formaction="/tasks/${key}/edit" value="Save"><button formaction="/tasks/${key}/run" class="mr mb">Run</button><button formaction="/tasks/${key}/delete">Delete</button></span>
  <span class="td"><input class="w-md" value="${note}" autocomplete="off" type="text" name="note" placeholder="Note" /></span>
  <span class="td">${logsHtml}</span>
  </form>`;
    })
    .join("");

  const body = `<main>
  <h2>Cronbin</h2>
  <p>Made by ❤️ <a href="https://www.owenyoung.com/">Owen</a> (<a href="https://github.com/theowenyoung/blog/tree/main/scripts/cronbin">Source Code</a>) </p>

<div class="table">
<div class="tr">
  <span class="td"><b>ID</b></span><span class="td"><b>Cron/Minutes</b></span><span class="td"><b>URL</b></span><span class="td"><b>Actions</b></span><span class="td"><b>Notes</b></span><span class="td"><b>Logs</b></span>
</div>
<form class="tr" autocomplete="off"  method="POST">
  <span class="td"><input type="hidden" name="enabled" value="on" ></span><span class="td"><input type="submit" formaction="/tasks" style="visibility: hidden; display: none;"><input class="w-md" type="text" autocomplete="off" name="interval" value="30" required placeholder="*/5 * * *" /></span>
  <span class="td"><textarea rows="1" class="w-lg" name="url" autocomplete="off" rqeuired placeholder="URL or curl command"></textarea></span>
  <span class="td"><button formaction="/tasks">Add</button></span>
<span class="td"><input class="w-md" type="text" name="note" autocomplete="off" placeholder="Note" /></span>
</form>
${tasksLists}
</div>
<section>
<h3>Notification when failed?</h3>
<form action="/notification" method="POST">
<textarea rows="2" cols="80" name="notification_curl" autocomplete="off" rqeuired placeholder="place a curl command, {{message}} is the error message placeholder.">${
    data.notification_curl || ""
  }</textarea>
<br />
<input type="submit" value="Save">
</form>

</section>
</main>`;
  const script = `
var clientOffset = getCookie("_clientOffset");
var currentOffset = new Date().getTimezoneOffset() * -1;
var reloadForCookieRefresh = false;

if (clientOffset  == undefined || clientOffset == null || clientOffset != currentOffset) {
    setCookie("_clientOffset", currentOffset, 30);
    reloadForCookieRefresh = true;
}

if (reloadForCookieRefresh)
    window.location.reload();

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

  `;

  return html + body + `<script>${script}</script></body></html>`;
}

function logToText(log, _clientOffset) {
  let { ok, run_at, message } = log;
  message = message || "";

  return `${ok ? "✅" : "❌"} ${timeToText(
    new Date(run_at),
    _clientOffset,
  )} ${message}`;
}

function timeToText(time, clientOffset) {
  // get xx ago
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diff / 1000 / 60);
  if (diffInMinutes < 1) {
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);

  const clientTimezoneDateTime = time.getTime() + clientOffset * 60 * 1000;
  const clientDate = new Date(clientTimezoneDateTime);

  if (diffInHours < 24) {
    // get hour, minutes, second
    const hour = clientDate.getUTCHours();
    const minutes = clientDate.getUTCMinutes();
    return `${addZero(hour)}:${addZero(minutes)}`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // return clientDate.toISOString();
  // return clientDate.toISOString().slice(0, 18);
}

function getCookieValue(cookie, key) {
  let keyValue = null;
  if (cookie) {
    const parts = cookie.split(";");
    for (const part of parts) {
      const [cookieKey, value] = part.split("=");
      if (cookieKey && cookieKey.trim() === key) {
        keyValue = value;
        break;
      }
    }
  }
  return keyValue;
}
function encodeHTML(str) {
  return str.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });
}

function isValidInterval(value) {
  // try parse number
  const num = Number(value);

  if (!isNaN(num)) {
    if (num >= 1) {
      // yes valid
      return true;
    } else {
      return false;
    }
  } else {
    // try parse cron expression
    try {
      cronSchedule.parseCronExpression(value);
      return true;
    } catch (_e) {
      console.warn("cron parse error", _e);
      return false;
    }
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    // is curl command
    try {
      parseCurl(url);
      return true;
    } catch (e) {
      console.warn("parse curl command error", e);
      return false;
    }

    return false;
  }
}
function addZero(num) {
  return num < 10 ? "0" + num : num;
}

// parse curl

export function parseCurl(curl_request) {
  const argvsArr = stringToArgv(curl_request, {
    removequotes: "always",
  }).map((item) => {
    let value = item.trim();
    if (value.startsWith("\\")) {
      value = value.slice(1).trim();
    }
    return value;
  });

  const argvs = parseArgv(argvsArr);
  const json = {
    headers: {},
  };

  const removeQuotes = (str) => str.replace(/['"]+/g, "");

  const stringIsUrl = (url) => {
    return /^(ftp|http|https):\/\/[^ "]+$/.test(url);
  };

  const parseField = (string) => {
    return string.split(/: (.+)/);
  };

  const parseHeader = (header) => {
    let parsedHeader = {};
    if (Array.isArray(header)) {
      header.forEach((item, index) => {
        const field = parseField(item);
        parsedHeader[field[0]] = field[1];
      });
    } else {
      const field = parseField(header);
      parsedHeader[field[0]] = field[1];
    }

    return parsedHeader;
  };

  for (const argv in argvs) {
    switch (argv) {
      case "_":
        {
          const _ = argvs[argv];
          _.forEach((item) => {
            item = removeQuotes(item);

            if (stringIsUrl(item)) {
              json.url = item;
            }
          });
        }
        break;

      case "X":
      case "request":
        json.method = argvs[argv];
        break;

      case "H":
      case "header":
        {
          const parsedHeader = parseHeader(argvs[argv]);
          json.headers = {
            ...json.header,
            ...parsedHeader,
          };
        }
        break;

      case "u":
      case "user":
        json.header["Authorization"] = argvs[argv];
        break;

      case "A":
      case "user-agent":
        json.header["user-agent"] = argvs[argv];
        break;

      case "I":
      case "head":
        json.method = "HEAD";
        break;

      case "L":
      case "location":
        json.redirect = "follow";
        const value = argvs[argv];
        if (typeof value === "string") {
          json.url = value;
        }
        break;

      case "b":
      case "cookie":
        json.header["Set-Cookie"] = argvs[argv];
        break;

      case "d":
      case "data":
      case "data-raw":
      case "data-ascii":
        const dataValue = argvs[argv];
        if (typeof dataValue === "string") {
          json.body = argvs[argv];
        } else {
          throw new Error("Invalid curl command, data value is not string");
        }
        break;

      case "data-urlencode":
        json.body = argvs[argv];
        break;

      case "compressed":
        if (!json.header["Accept-Encoding"]) {
          json.header["Accept-Encoding"] = argvs[argv] || "deflate, gzip";
        }
        break;

      default:
        break;
    }
  }
  if (!json.url) {
    throw new Error("Invalid curl command, no url detected");
  }

  if (!json.method) {
    if (json.body) {
      json.method = "POST";
    } else {
      json.method = "GET";
    }
  }

  return json;
}

// https://github.com/minimistjs/minimist/blob/main/index.js

function hasKey(obj, keys) {
  var o = obj;
  keys.slice(0, -1).forEach(function (key) {
    o = o[key] || {};
  });

  var key = keys[keys.length - 1];
  return key in o;
}

function isNumber(x) {
  if (typeof x === "number") {
    return true;
  }
  if (/^0x[0-9a-f]+$/i.test(x)) {
    return true;
  }
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

function isConstructorOrProto(obj, key) {
  return (
    (key === "constructor" && typeof obj[key] === "function") ||
    key === "__proto__"
  );
}

function parseArgv(args, opts) {
  if (!opts) {
    opts = {};
  }

  var flags = {
    bools: {},
    strings: {},
    unknownFn: null,
  };

  if (typeof opts.unknown === "function") {
    flags.unknownFn = opts.unknown;
  }

  if (typeof opts.boolean === "boolean" && opts.boolean) {
    flags.allBools = true;
  } else {
    []
      .concat(opts.boolean)
      .filter(Boolean)
      .forEach(function (key) {
        flags.bools[key] = true;
      });
  }

  var aliases = {};

  function aliasIsBoolean(key) {
    return aliases[key].some(function (x) {
      return flags.bools[x];
    });
  }

  Object.keys(opts.alias || {}).forEach(function (key) {
    aliases[key] = [].concat(opts.alias[key]);
    aliases[key].forEach(function (x) {
      aliases[x] = [key].concat(
        aliases[key].filter(function (y) {
          return x !== y;
        }),
      );
    });
  });

  []
    .concat(opts.string)
    .filter(Boolean)
    .forEach(function (key) {
      flags.strings[key] = true;
      if (aliases[key]) {
        [].concat(aliases[key]).forEach(function (k) {
          flags.strings[k] = true;
        });
      }
    });

  var defaults = opts.default || {};

  var argv = { _: [] };

  function argDefined(key, arg) {
    return (
      (flags.allBools && /^--[^=]+$/.test(arg)) ||
      flags.strings[key] ||
      flags.bools[key] ||
      aliases[key]
    );
  }

  function setKey(obj, keys, value) {
    var o = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      var key = keys[i];
      if (isConstructorOrProto(o, key)) {
        return;
      }
      if (o[key] === undefined) {
        o[key] = {};
      }
      if (
        o[key] === Object.prototype ||
        o[key] === Number.prototype ||
        o[key] === String.prototype
      ) {
        o[key] = {};
      }
      if (o[key] === Array.prototype) {
        o[key] = [];
      }
      o = o[key];
    }

    var lastKey = keys[keys.length - 1];
    if (isConstructorOrProto(o, lastKey)) {
      return;
    }
    if (
      o === Object.prototype ||
      o === Number.prototype ||
      o === String.prototype
    ) {
      o = {};
    }
    if (o === Array.prototype) {
      o = [];
    }
    if (
      o[lastKey] === undefined ||
      flags.bools[lastKey] ||
      typeof o[lastKey] === "boolean"
    ) {
      o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
      o[lastKey].push(value);
    } else {
      o[lastKey] = [o[lastKey], value];
    }
  }

  function setArg(key, val, arg) {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) {
        return;
      }
    }

    var value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
    setKey(argv, key.split("."), value);

    (aliases[key] || []).forEach(function (x) {
      setKey(argv, x.split("."), value);
    });
  }

  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, defaults[key] === undefined ? false : defaults[key]);
  });

  var notFlags = [];

  if (args.indexOf("--") !== -1) {
    notFlags = args.slice(args.indexOf("--") + 1);
    args = args.slice(0, args.indexOf("--"));
  }

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    var key;
    var next;

    if (/^--.+=/.test(arg)) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
      key = m[1];
      var value = m[2];
      if (flags.bools[key]) {
        value = value !== "false";
      }
      setArg(key, value, arg);
    } else if (/^--no-.+/.test(arg)) {
      key = arg.match(/^--no-(.+)/)[1];
      setArg(key, false, arg);
    } else if (/^--.+/.test(arg)) {
      key = arg.match(/^--(.+)/)[1];
      next = args[i + 1];
      if (
        next !== undefined &&
        !/^(-|--)[^-]/.test(next) &&
        !flags.bools[key] &&
        !flags.allBools &&
        (aliases[key] ? !aliasIsBoolean(key) : true)
      ) {
        setArg(key, next, arg);
        i += 1;
      } else if (/^(true|false)$/.test(next)) {
        setArg(key, next === "true", arg);
        i += 1;
      } else {
        setArg(key, flags.strings[key] ? "" : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      var letters = arg.slice(1, -1).split("");

      var broken = false;
      for (var j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2);

        if (next === "-") {
          setArg(letters[j], next, arg);
          continue;
        }

        if (/[A-Za-z]/.test(letters[j]) && next[0] === "=") {
          setArg(letters[j], next.slice(1), arg);
          broken = true;
          break;
        }

        if (
          /[A-Za-z]/.test(letters[j]) &&
          /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)
        ) {
          setArg(letters[j], next, arg);
          broken = true;
          break;
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          setArg(letters[j], flags.strings[letters[j]] ? "" : true, arg);
        }
      }

      key = arg.slice(-1)[0];
      if (!broken && key !== "-") {
        if (
          args[i + 1] &&
          !/^(-|--)[^-]/.test(args[i + 1]) &&
          !flags.bools[key] &&
          (aliases[key] ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, args[i + 1], arg);
          i += 1;
        } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
          setArg(key, args[i + 1] === "true", arg);
          i += 1;
        } else {
          setArg(key, flags.strings[key] ? "" : true, arg);
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
      }
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1));
        break;
      }
    }
  }

  Object.keys(defaults).forEach(function (k) {
    if (!hasKey(argv, k.split("."))) {
      setKey(argv, k.split("."), defaults[k]);

      (aliases[k] || []).forEach(function (x) {
        setKey(argv, x.split("."), defaults[k]);
      });
    }
  });

  if (opts["--"]) {
    argv["--"] = notFlags.slice();
  } else {
    notFlags.forEach(function (k) {
      argv._.push(k);
    });
  }

  return argv;
}

// https://raw.githubusercontent.com/binocarlos/spawn-args/master/index.js
function stringToArgv(args, opts) {
  opts = opts || {};
  args = args || "";
  var arr = [];

  var current = null;
  var quoted = null;
  var quoteType = null;

  function addcurrent() {
    if (current) {
      // trim extra whitespace on the current arg
      arr.push(current.trim());
      current = null;
    }
  }

  // remove escaped newlines
  args = args.replace(/\\\n/g, "");

  for (var i = 0; i < args.length; i++) {
    var c = args.charAt(i);

    if (c == " ") {
      if (quoted) {
        quoted += c;
      } else {
        addcurrent();
      }
    } else if (c == "'" || c == '"') {
      if (quoted) {
        quoted += c;
        // only end this arg if the end quote is the same type as start quote
        if (quoteType === c) {
          // make sure the quote is not escaped
          if (quoted.charAt(quoted.length - 2) !== "\\") {
            arr.push(quoted);
            quoted = null;
            quoteType = null;
          }
        }
      } else {
        addcurrent();
        quoted = c;
        quoteType = c;
      }
    } else {
      if (quoted) {
        quoted += c;
      } else {
        if (current) {
          current += c;
        } else {
          current = c;
        }
      }
    }
  }

  addcurrent();

  if (opts.removequotes) {
    arr = arr.map(function (arg) {
      if (opts.removequotes === "always") {
        return arg.replace(/^["']|["']$/g, "");
      } else {
        if (arg.match(/\s/)) return arg;
        return arg.replace(/^"|"$/g, "");
      }
    });
  }

  return arr;
}
