import {Serializer} from "@deepkit/type";

import {
    Calendar,
    Duration,
    Instant,
    PlainDate,
    PlainDateTime,
    PlainMonthDay,
    PlainTime,
    PlainYearMonth,
    TimeZone,
    ZonedDateTime,
} from "@svelte-in-motion/temporal";

export class JSONSerializer extends Serializer {
    constructor(name: string = "JSON_SERIALIZER") {
        super(name);

        this.registerTemporal();
    }

    protected registerTemporal() {
        const {deserializeRegistry, serializeRegistry} = this;

        deserializeRegistry.registerClass(Calendar, (type, state) => {
            state.setContext({Calendar});
            state.addSetter(`Calendar.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(Calendar, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(Duration, (type, state) => {
            state.setContext({Duration});
            state.addSetter(`Duration.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(Duration, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(Instant, (type, state) => {
            state.setContext({Instant});
            state.addSetter(`Instant.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(Instant, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(PlainDate, (type, state) => {
            state.setContext({PlainDate});
            state.addSetter(`PlainDate.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(PlainDate, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(PlainDateTime, (type, state) => {
            state.setContext({PlainDateTime});
            state.addSetter(`PlainDateTime.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(PlainDateTime, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(PlainMonthDay, (type, state) => {
            state.setContext({PlainMonthDay});
            state.addSetter(`PlainMonthDay.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(PlainMonthDay, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(PlainYearMonth, (type, state) => {
            state.setContext({PlainYearMonth});
            state.addSetter(`PlainYearMonth.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(PlainYearMonth, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(PlainTime, (type, state) => {
            state.setContext({PlainTime});
            state.addSetter(`PlainTime.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(PlainTime, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(TimeZone, (type, state) => {
            state.setContext({TimeZone});
            state.addSetter(`TimeZone.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(TimeZone, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });

        deserializeRegistry.registerClass(ZonedDateTime, (type, state) => {
            state.setContext({ZonedDateTime});
            state.addSetter(`ZonedDateTime.from(${state.accessor})`);
        });

        serializeRegistry.registerClass(ZonedDateTime, (type, state) => {
            state.addSetter(`${state.accessor}.toJSON()`);
        });
    }
}

export const JSON_SERIALIZER = new JSONSerializer();
