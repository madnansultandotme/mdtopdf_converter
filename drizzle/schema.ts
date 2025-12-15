import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Formatting rules table - stores user-defined or preset formatting configurations
 */
export const formattingRules = mysqlTable("formattingRules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Typography rules
  fontFamily: varchar("fontFamily", { length: 100 }).default("Inter").notNull(),
  fontSize: int("fontSize").default(12).notNull(),
  lineHeight: decimal("lineHeight", { precision: 3, scale: 2 }).default("1.50").notNull(),
  
  // Heading styles (stored as JSON - no default value)
  headingStyles: json("headingStyles").notNull(),
  
  // Layout rules
  pageSize: varchar("pageSize", { length: 20 }).default("A4").notNull(), // A4, Letter
  marginTop: int("marginTop").default(20).notNull(), // in mm
  marginBottom: int("marginBottom").default(20).notNull(),
  marginLeft: int("marginLeft").default(20).notNull(),
  marginRight: int("marginRight").default(20).notNull(),
  
  // Header and footer
  headerText: text("headerText"),
  footerText: text("footerText"),
  
  // Code block styles (stored as JSON - no default value)
  codeBlockStyles: json("codeBlockStyles").notNull(),
  
  // Table styles (stored as JSON - no default value)
  tableStyles: json("tableStyles").notNull(),
  
  // Pagination rules
  pageBreakBeforeHeadings: varchar("pageBreakBeforeHeadings", { length: 20 }).default("h1").notNull(), // h1, h2, none
  preventOrphanHeadings: int("preventOrphanHeadings").default(1).notNull(), // boolean
  keepCodeBlocksTogether: int("keepCodeBlocksTogether").default(1).notNull(), // boolean
  
  // Metadata
  isPreset: int("isPreset").default(0).notNull(), // boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormattingRule = typeof formattingRules.$inferSelect;
export type InsertFormattingRule = typeof formattingRules.$inferInsert;

/**
 * Conversion history table - tracks user conversions for analytics and recovery
 */
export const conversions = mysqlTable("conversions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  formattingRuleId: int("formattingRuleId"),
  
  // Input metadata
  markdownTitle: varchar("markdownTitle", { length: 255 }),
  markdownSize: int("markdownSize").notNull(), // in bytes
  
  // Output metadata
  pdfUrl: text("pdfUrl"),
  pdfSize: int("pdfSize"), // in bytes
  
  // Generation stats
  generationTimeMs: int("generationTimeMs"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = typeof conversions.$inferInsert;

// Default formatting rule values
export const DEFAULT_HEADING_STYLES = {
  h1: { fontSize: 32, fontWeight: 900, marginTop: 24, marginBottom: 12 },
  h2: { fontSize: 24, fontWeight: 800, marginTop: 20, marginBottom: 10 },
  h3: { fontSize: 20, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  h4: { fontSize: 16, fontWeight: 600, marginTop: 12, marginBottom: 6 },
  h5: { fontSize: 14, fontWeight: 600, marginTop: 10, marginBottom: 4 },
  h6: { fontSize: 12, fontWeight: 600, marginTop: 8, marginBottom: 4 },
};

export const DEFAULT_CODE_BLOCK_STYLES = {
  fontFamily: "monospace",
  fontSize: 11,
  backgroundColor: "#f5f5f5",
  padding: 12,
  borderRadius: 4,
  lineHeight: 1.4,
};

export const DEFAULT_TABLE_STYLES = {
  borderColor: "#ddd",
  headerBackgroundColor: "#f9f9f9",
  cellPadding: 8,
  fontSize: 11,
};
