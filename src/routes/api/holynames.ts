import { defineEventHandler, getQuery, handleCors } from "h3";
import gnames from "../../../data/gnames.json";

export default defineEventHandler((event) => {
    if (handleCors(event, { origin: "*" })) {
        return;
    }

    const query = getQuery(event);
    const name = query.name?.toString();

    if (name) {
        return gnames.filter((item) => item.name.includes(name));
    }
    return gnames;
});