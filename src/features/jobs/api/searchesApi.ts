import { supabase } from "@/integrations/supabase/client";
import type { JobSearchCriteria, SavedJobSearch, SearchHistoryItem } from "@/features/jobs/types";

const SAVED_SEARCH_SELECT = "id, candidate_id, name, criteria, is_active, created_at, updated_at";
const HISTORY_SELECT = "id, candidate_id, criteria, searched_at";

export async function getSavedJobSearches(candidateId: string): Promise<SavedJobSearch[]> {
  const { data, error } = await supabase
    .from("candidate_saved_searches")
    .select(SAVED_SEARCH_SELECT)
    .eq("candidate_id", candidateId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedJobSearch[];
}

export async function saveJobSearch(
  candidateId: string,
  name: string,
  criteria: JobSearchCriteria,
) {
  const { data, error } = await supabase
    .from("candidate_saved_searches")
    .insert({ candidate_id: candidateId, name: name.trim(), criteria, is_active: true })
    .select(SAVED_SEARCH_SELECT)
    .single();
  if (error) throw error;
  return data as SavedJobSearch;
}

export async function updateSavedJobSearch(
  id: string,
  values: { name?: string; criteria?: JobSearchCriteria; is_active?: boolean },
) {
  const { data, error } = await supabase
    .from("candidate_saved_searches")
    .update(values)
    .eq("id", id)
    .select(SAVED_SEARCH_SELECT)
    .single();
  if (error) throw error;
  return data as SavedJobSearch;
}

export async function deleteSavedJobSearch(id: string) {
  const { error } = await supabase.from("candidate_saved_searches").delete().eq("id", id);
  if (error) throw error;
}

export async function getSearchHistory(candidateId: string): Promise<SearchHistoryItem[]> {
  const { data, error } = await supabase
    .from("candidate_search_history")
    .select(HISTORY_SELECT)
    .eq("candidate_id", candidateId)
    .order("searched_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as SearchHistoryItem[];
}

export async function recordSearchHistory(candidateId: string, criteria: JobSearchCriteria) {
  const { data, error } = await supabase
    .from("candidate_search_history")
    .insert({ candidate_id: candidateId, criteria })
    .select(HISTORY_SELECT)
    .single();
  if (error) throw error;
  return data as SearchHistoryItem;
}

export async function deleteSearchHistoryItem(id: string) {
  const { error } = await supabase.from("candidate_search_history").delete().eq("id", id);
  if (error) throw error;
}

export async function clearSearchHistory(candidateId: string) {
  const { error } = await supabase
    .from("candidate_search_history")
    .delete()
    .eq("candidate_id", candidateId);
  if (error) throw error;
}
