import sqlite3 from 'sqlite3';
sqlite3.verbose();

const db = new sqlite3.Database(':memory:');

export type CredentialRow = {
  id: number;
  userid: number;
  payload: string;
  workerId?: string | null;
  timestamp?: string | null;
};

// Create table once when the DB initializes
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userid INTEGER NOT NULL,
      payload TEXT NOT NULL,
      workerId TEXT,
      timestamp TEXT
    )
  `);
});

// Function to find a credential by ID
export function findCredential(userid: string): Promise<CredentialRow | undefined> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM credentials WHERE userid = ?', [userid], (err, row) => {
      if (err) return reject(err);
      resolve(row as CredentialRow | undefined);
    });
  });
}

// Function to insert a credential
export function insertCredential(
  userid: string | number,
  payload: string,
  workerId: string,
  timestamp: string
) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO credentials (userid, payload, workerId, timestamp) VALUES (?, ?, ?, ?)',
      [userid, payload, workerId, timestamp],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

export default db;
