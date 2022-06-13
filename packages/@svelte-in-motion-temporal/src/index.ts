import {Temporal} from "@js-temporal/polyfill";

type OverrideReturn<F extends (...args: any) => any, R> = (...args: Parameters<F>) => R;

export const Now = Temporal.Now as {
    instant: OverrideReturn<typeof Temporal.Now.instant, Instant>;

    plainDate: OverrideReturn<typeof Temporal.Now.plainDate, PlainDate>;

    plainDateISO: OverrideReturn<typeof Temporal.Now.plainDateISO, PlainDate>;

    plainDateTime: OverrideReturn<typeof Temporal.Now.plainDateTime, PlainDateTime>;

    plainDateTimeISO: OverrideReturn<typeof Temporal.Now.plainDateTimeISO, PlainDateTime>;

    timeZone: OverrideReturn<typeof Temporal.Now.timeZone, TimeZone>;

    zonedDateTime: OverrideReturn<typeof Temporal.Now.zonedDateTime, ZonedDateTime>;

    zonedDateTimeISO: OverrideReturn<typeof Temporal.Now.zonedDateTimeISO, ZonedDateTime>;
};

// HACK: need to stub the class primitives to support serialization via DeepKit

export class Calendar extends Temporal.Calendar {}

export class Duration extends Temporal.Duration {}

export class Instant extends Temporal.Instant {}

export class PlainDate extends Temporal.PlainDate {}

export class PlainDateTime extends Temporal.PlainDateTime {}

export class PlainMonthDay extends Temporal.PlainMonthDay {}

export class PlainTime extends Temporal.PlainTime {}

export class PlainYearMonth extends Temporal.PlainYearMonth {}

export class TimeZone extends Temporal.TimeZone {}

export class ZonedDateTime extends Temporal.ZonedDateTime {}
