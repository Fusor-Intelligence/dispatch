import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'dispatch.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      gmailId TEXT UNIQUE,
      threadId TEXT,
      "from" TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      receivedAt TEXT NOT NULL,
      category TEXT,
      urgency TEXT,
      sentiment TEXT,
      confidence REAL DEFAULT 0,
      summary TEXT,
      status TEXT DEFAULT 'new',
      assignedTo TEXT,
      autoReplyDraft TEXT,
      clusterId TEXT
    );

    CREATE TABLE IF NOT EXISTS clusters (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      emailCount INTEGER DEFAULT 0,
      firstSeen TEXT,
      lastSeen TEXT,
      severity TEXT,
      trending INTEGER DEFAULT 0,
      suggestedAction TEXT,
      emailIds TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}
