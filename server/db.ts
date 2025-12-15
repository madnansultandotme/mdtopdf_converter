import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, formattingRules, conversions, DEFAULT_HEADING_STYLES, DEFAULT_CODE_BLOCK_STYLES, DEFAULT_TABLE_STYLES } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Formatting Rules queries
export async function createFormattingRule(userId: number, data: {
  name: string;
  description?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: string;
  headingStyles?: Record<string, unknown>;
  pageSize?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  headerText?: string;
  footerText?: string;
  codeBlockStyles?: Record<string, unknown>;
  tableStyles?: Record<string, unknown>;
  pageBreakBeforeHeadings?: string;
  preventOrphanHeadings?: number;
  keepCodeBlocksTogether?: number;
  isPreset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rule = {
    userId,
    name: data.name,
    description: data.description || null,
    fontFamily: data.fontFamily || "Inter",
    fontSize: data.fontSize || 12,
    lineHeight: data.lineHeight || "1.50",
    headingStyles: data.headingStyles || DEFAULT_HEADING_STYLES,
    pageSize: data.pageSize || "A4",
    marginTop: data.marginTop || 20,
    marginBottom: data.marginBottom || 20,
    marginLeft: data.marginLeft || 20,
    marginRight: data.marginRight || 20,
    headerText: data.headerText || null,
    footerText: data.footerText || null,
    codeBlockStyles: data.codeBlockStyles || DEFAULT_CODE_BLOCK_STYLES,
    tableStyles: data.tableStyles || DEFAULT_TABLE_STYLES,
    pageBreakBeforeHeadings: data.pageBreakBeforeHeadings || "h1",
    preventOrphanHeadings: data.preventOrphanHeadings ?? 1,
    keepCodeBlocksTogether: data.keepCodeBlocksTogether ?? 1,
    isPreset: data.isPreset || 0,
  };

  const result = await db.insert(formattingRules).values(rule);
  return result;
}

export async function getFormattingRulesByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(formattingRules).where(eq(formattingRules.userId, userId));
}

export async function getFormattingRuleById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(formattingRules).where(eq(formattingRules.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateFormattingRule(id: number, data: Partial<{
  name: string;
  description: string | null;
  fontFamily: string;
  fontSize: number;
  lineHeight: string;
  headingStyles: Record<string, unknown>;
  pageSize: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerText: string | null;
  footerText: string | null;
  codeBlockStyles: Record<string, unknown>;
  tableStyles: Record<string, unknown>;
  pageBreakBeforeHeadings: string;
  preventOrphanHeadings: number;
  keepCodeBlocksTogether: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(formattingRules).set(data).where(eq(formattingRules.id, id));
}

export async function deleteFormattingRule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(formattingRules).where(eq(formattingRules.id, id));
}

// Conversion queries
export async function createConversion(userId: number, data: {
  formattingRuleId?: number;
  markdownTitle?: string;
  markdownSize: number;
  pdfUrl?: string;
  pdfSize?: number;
  generationTimeMs?: number;
  status?: "pending" | "completed" | "failed";
  errorMessage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversion = {
    userId,
    formattingRuleId: data.formattingRuleId || null,
    markdownTitle: data.markdownTitle || null,
    markdownSize: data.markdownSize,
    pdfUrl: data.pdfUrl || null,
    pdfSize: data.pdfSize || null,
    generationTimeMs: data.generationTimeMs || null,
    status: data.status || "pending" as const,
    errorMessage: data.errorMessage || null,
  };

  const result = await db.insert(conversions).values(conversion);
  return result;
}

export async function getConversionsByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(conversions).where(eq(conversions.userId, userId)).orderBy(conversions.createdAt).limit(limit);
}

export async function updateConversion(id: number, data: Partial<{
  pdfUrl: string;
  pdfSize: number;
  generationTimeMs: number;
  status: "pending" | "completed" | "failed";
  errorMessage: string | null;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(conversions).set(data).where(eq(conversions.id, id));
}
