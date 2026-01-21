
import { Request, Response } from 'express';
import { dbService } from '../services/db';

export const coreController = {
  // Health status for Vercel/Node environment
  status(req: Request, res: Response) {
    res.json({ status: "MOS Core running", timestamp: new Date().toISOString() });
  },

  async listTrips(req: Request, res: Response) {
    try {
      const trips = await dbService.getTrips();
      res.json({
        success: true,
        data: trips,
        count: trips.length
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createTrip(req: Request, res: Response) {
    try {
      const trip = await dbService.createTrip(req.body);
      if (!trip) {
        return res.status(500).json({ success: false, error: "Trip creation failed" });
      }
      res.status(201).json({ success: true, data: trip });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async listSaccos(req: Request, res: Response) {
    try {
      const saccos = await dbService.getSaccos();
      res.json({ success: true, data: saccos });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async listOperators(req: Request, res: Response) {
    try {
      const operators = await dbService.getOperators();
      res.json({ success: true, data: operators });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createOperator(req: Request, res: Response) {
    try {
      const operator = await dbService.createOperator(req.body);
      res.status(201).json({ success: true, data: operator });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};
