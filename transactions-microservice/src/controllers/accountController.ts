import { Request, Response } from "express";
import { insertEvent, getAllAccounts, getBalance, accountExists, Event } from "../models/eventModel";
import { publishEvent } from "../kafka/eventPublisher";


export const createAccount = async (req: Request, res: Response) => {
  const { account_id } = req.body;
  try {
    if (await accountExists(account_id)) {
      return res.status(400).json({ error: "Account ID already in use" });
    }

    const event: Event = { account_id, event_type: "ACCOUNT_CREATED", event_data: {} };
    await insertEvent(event);

    await publishEvent(
    account_id,
    event.event_type,
    event.event_data
    );

    res.status(201).json({ account_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
};


export const fetchAllAccounts = async (_req: Request, res: Response) => {
  try {
    const accounts = await getAllAccounts();
    res.status(200).json({ accounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};


export const performTransaction = async (req: Request, res: Response) => {
  const { account_id, amount } = req.body;

  try {
    if (!(await accountExists(account_id))) {
      return res.status(404).json({ error: "Account does not exist" });
    }

    const balance = await getBalance(account_id);

    let event_type: string;
    if (amount > 0) {
      event_type = "MONEY_DEPOSITED";
    } else {
      event_type = "MONEY_WITHDRAWN";
      if (balance < Math.abs(amount)) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
    }

    const event: Event = {
      account_id,
      event_type,
      event_data: { amount: Math.abs(amount) },
    };

    await insertEvent(event);

    await publishEvent(
    account_id,
    event.event_type,
    event.event_data
    );

    const newBalance = await getBalance(account_id);
    res.status(201).json({ balance: newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to perform transaction" });
  }
};

export const getAccountState = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.account_id;
    const account_id = Array.isArray(rawId) ? rawId[0] : rawId;


    if (!account_id) {
        return res.status(400).json({ error: "Missing account ID" });
    }

    if (!(await accountExists(account_id))) {
      return res.status(404).json({ error: "Account not found" });
    }

    const balance = await getBalance(account_id);

    res.status(200).json({
      account_id,
      balance,
    });
  } catch (error) {
    console.error("Error fetching account state:", error);
    res.status(500).json({ error: "Failed to get account state" });
  }
};