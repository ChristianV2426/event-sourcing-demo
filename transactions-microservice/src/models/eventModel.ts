import { pool } from "../database";

export interface Event {
  id?: string;
  account_id: string;
  event_type: string;
  event_data: any;
  created_at?: string;
}


export const insertEvent = async (event: Event): Promise<Event | null> => {
  try {
    const result = await pool.query(
      `INSERT INTO events (account_id, event_type, event_data) 
       VALUES ($1, $2, $3) RETURNING *`,
      [event.account_id, event.event_type, event.event_data]
    );

    if (result?.rows?.length > 0) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error inserting event:", error);
    throw new Error("Database error while inserting event");
  }
};


export const accountExists = async (account_id: string): Promise<boolean> => {
  try {
    console.log(`Checking existence of account_id: ${account_id}`);
    const result = await pool.query(
      `SELECT 1 FROM events WHERE account_id = $1 AND event_type='ACCOUNT_CREATED'`,
      [account_id]
    );
    return (result?.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error checking account existence:", error);
    throw new Error("Database error while checking account");
  }
};


export const getAllAccounts = async (): Promise<string[]> => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT account_id, created_at
       FROM events 
       WHERE event_type = 'ACCOUNT_CREATED' 
       ORDER BY created_at ASC`
    );

    if (!result?.rows) return [];
    return result.rows.map(row => row.account_id);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw new Error("Database error while fetching accounts");
  }
};


export const getEventsByAccount = async (account_id: string): Promise<Event[]> => {
  try {
    const result = await pool.query(
      `SELECT * FROM events WHERE account_id = $1 ORDER BY created_at ASC`,
      [account_id]
    );
    return result?.rows ?? [];
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Database error while fetching events");
  }
};


export const getBalance = async (account_id: string): Promise<number> => {
  try {
    const events: Event[] = await getEventsByAccount(account_id);

    let balance = 0;
    for (const e of events) {
      if (e.event_type === "MONEY_DEPOSITED") balance += e.event_data.amount;
      if (e.event_type === "MONEY_WITHDRAWN") balance -= e.event_data.amount;
    }

    return balance;
  } catch (error) {
    console.error("Error calculating balance:", error);
    throw new Error("Failed to calculate balance");
  }
};
