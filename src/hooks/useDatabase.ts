import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, ShiftRequirement, ShiftPreference, ShiftAssignment, Message } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, refetch: fetchUsers };
}

export function useShiftRequirements() {
  const [requirements, setRequirements] = useState<ShiftRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shift_requirements')
        .select('*')
        .order('day_of_week, time_slot');

      if (error) throw error;

      const mappedData = data?.map(item => ({
        dayOfWeek: item.day_of_week as any,
        timeSlot: item.time_slot as any,
        requiredStaff: item.required_staff
      })) || [];

      setRequirements(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateRequirements = async (newRequirements: ShiftRequirement[]) => {
    try {
      // Delete existing requirements
      await supabase.from('shift_requirements').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new requirements
      const insertData = newRequirements.map(req => ({
        day_of_week: req.dayOfWeek,
        time_slot: req.timeSlot,
        required_staff: req.requiredStaff
      }));

      const { error } = await supabase
        .from('shift_requirements')
        .insert(insertData);

      if (error) throw error;

      await fetchRequirements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { requirements, loading, error, updateRequirements, refetch: fetchRequirements };
}

export function useShiftPreferences() {
  const [preferences, setPreferences] = useState<ShiftPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shift_preferences')
        .select('*')
        .order('staff_id, day_of_week, time_slot');

      if (error) throw error;

      const mappedData = data?.map(item => ({
        staffId: item.staff_id,
        dayOfWeek: item.day_of_week as any,
        timeSlot: item.time_slot as any,
        weekdayDesiredHours: item.weekday_desired_hours,
        weekendDesiredHours: item.weekend_desired_hours
      })) || [];

      setPreferences(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (staffId: string, newPreferences: ShiftPreference[]) => {
    try {
      // Delete existing preferences for this staff
      await supabase
        .from('shift_preferences')
        .delete()
        .eq('staff_id', staffId);

      // Insert new preferences
      const insertData = newPreferences.map(pref => ({
        staff_id: pref.staffId,
        day_of_week: pref.dayOfWeek,
        time_slot: pref.timeSlot,
        weekday_desired_hours: pref.weekdayDesiredHours,
        weekend_desired_hours: pref.weekendDesiredHours
      }));

      if (insertData.length > 0) {
        const { error } = await supabase
          .from('shift_preferences')
          .insert(insertData);

        if (error) throw error;
      }

      await fetchPreferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { preferences, loading, error, updatePreferences, refetch: fetchPreferences };
}

export function useShiftAssignments() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shift_assignments')
        .select(`
          *,
          users!shift_assignments_staff_id_fkey(name)
        `)
        .order('date, time_slot');

      if (error) throw error;

      const mappedData = data?.map(item => ({
        id: item.id,
        staffId: item.staff_id,
        staffName: item.users?.name || 'Unknown',
        date: item.date,
        dayOfWeek: item.day_of_week as any,
        timeSlot: item.time_slot as any,
        status: item.status as any
      })) || [];

      setAssignments(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createAssignments = async (newAssignments: ShiftAssignment[]) => {
    try {
      console.log('Creating assignments:', newAssignments);
      console.log('Assignment count:', newAssignments.length);
      
      if (newAssignments.length === 0) {
        console.warn('No assignments to create');
        return;
      }
      
      // Clear existing assignments
      const { error: deleteError } = await supabase
        .from('shift_assignments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
      } else {
        console.log('Cleared existing assignments');
      }

      // Insert new assignments
      const insertData = newAssignments.map(assignment => ({
        staff_id: assignment.staffId,
        date: assignment.date,
        day_of_week: assignment.dayOfWeek,
        time_slot: assignment.timeSlot,
        status: assignment.status
      }));

      console.log('Insert data:', insertData);
      
      if (insertData.length > 0) {
        const { error } = await supabase
          .from('shift_assignments')
          .insert(insertData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }

      await fetchAssignments();
    } catch (err) {
      console.error('Create assignments error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { assignments, loading, error, createAssignments, refetch: fetchAssignments };
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = data?.map(item => ({
        id: item.id,
        from: item.from_user,
        to: item.to_user,
        title: item.title,
        content: item.content,
        type: item.type as any,
        timestamp: new Date(item.created_at)
      })) || [];

      setMessages(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          from_user: message.from,
          to_user: message.to,
          title: message.title,
          content: message.content,
          type: message.type
        });

      if (error) throw error;

      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { messages, loading, error, createMessage, refetch: fetchMessages };
}