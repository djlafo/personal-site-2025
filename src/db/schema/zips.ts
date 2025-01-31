import { char, pgTable, varchar } from "drizzle-orm/pg-core";

export const zipsTable = pgTable("zips", {
  zip: char({length: 5}).primaryKey(),
  lat: varchar({ length: 255 }),
  lng: varchar({ length: 255 }),
  city: varchar({ length: 255 }),
  state_id: char({length: 2}),
  state_name: varchar({ length: 255 }),
  timezone: varchar({ length: 255 })
});