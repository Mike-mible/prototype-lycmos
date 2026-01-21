
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SACCO, Operator, Trip } from '../models/types';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL || '';
const supabaseKey = process.env.DATABASE_KEY || ''; 

let supabase: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('DB_CREDENTIALS_MISSING: Lync MOS Core operating in local fallback mode.');
  }
} catch (error) {
  console.error('CRITICAL: Supabase initialization failed:', error);
}

/**
 * ROW LEVEL SECURITY (RLS) RULES FOR PRODUCTION:
 * - Table 'trips': Authenticated service_role or admin can INSERT/UPDATE.
 * - Table 'operators': Restrict to authenticated SACCO users.
 * - Table 'saccos': Viewable by authenticated users; modifications restricted to MOS Core.
 */

export const dbService = {
  async getTrips(): Promise<Trip[]> {
    try {
      if (!supabase) throw new Error('NO_CLIENT');
      const { data, error } = await supabase.from('trips').select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('DB_ERROR [getTrips]:', err);
      return [
        { id: 'fb-trip-1', route: 'NRB-MBA (Express)', status: 'ACTIVE', operatorId: 'fb-op-1', saccoId: 'fb-sc-1' }
      ];
    }
  },

  async createTrip(trip: Partial<Trip>): Promise<Trip | null> {
    try {
      if (!supabase) throw new Error('NO_CLIENT');
      const { data, error } = await supabase.from('trips').insert(trip).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('DB_ERROR [createTrip]:', err);
      return null;
    }
  },

  async getSaccos(): Promise<SACCO[]> {
    try {
      if (!supabase) throw new Error('NO_CLIENT');
      const { data, error } = await supabase.from('saccos').select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('DB_ERROR [getSaccos]:', err);
      return [
        { id: 'fb-sc-1', name: 'Lync Standard SACCO', registrationNumber: 'REG-FB-101', createdAt: new Date().toISOString() }
      ];
    }
  },

  async getOperators(): Promise<Operator[]> {
    try {
      if (!supabase) throw new Error('NO_CLIENT');
      const { data, error } = await supabase.from('operators').select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('DB_ERROR [getOperators]:', err);
      return [
        { id: 'fb-op-1', name: 'Standard Operator 01', licenseNumber: 'DL-FB-001', saccoId: 'fb-sc-1' }
      ];
    }
  },

  async createOperator(operator: Partial<Operator>): Promise<Operator | null> {
    try {
      if (!supabase) throw new Error('NO_CLIENT');
      const { data, error } = await supabase.from('operators').insert(operator).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('DB_ERROR [createOperator]:', err);
      return null;
    }
  }
};
