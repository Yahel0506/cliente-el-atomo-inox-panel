import { createPrivilegedClient } from "@/lib/supabase/admin";
import type { BusinessBranch, BusinessContactInfo, BusinessWorkMediaRow } from "@/lib/supabase/types";

export type BusinessAdminData = {
  contacts: BusinessContactInfo[];
  branches: BusinessBranch[];
  processVideos: BusinessWorkMediaRow[];
  resultVideos: BusinessWorkMediaRow[];
  resultImages: BusinessWorkMediaRow[];
};

export async function getBusinessAdminData(): Promise<BusinessAdminData> {
  const supabase = await createPrivilegedClient();
  if (!supabase) {
    return {
      contacts: [],
      branches: [],
      processVideos: [],
      resultVideos: [],
      resultImages: [],
    };
  }

  const [contacts, branches, processVideos, resultVideos, resultImages] = await Promise.all([
    supabase.from("business_contact_info").select("*"),
    supabase.from("business_branches").select("*").order("display_order", { ascending: true }).order("id"),
    supabase.from("business_work_process_videos").select("*").order("display_order", { ascending: true }).order("id"),
    supabase.from("business_work_result_videos").select("*").order("display_order", { ascending: true }).order("id"),
    supabase.from("business_work_result_images").select("*").order("display_order", { ascending: true }).order("id"),
  ]);

  return {
    contacts: contacts.data ?? [],
    branches: branches.data ?? [],
    processVideos: processVideos.data ?? [],
    resultVideos: resultVideos.data ?? [],
    resultImages: resultImages.data ?? [],
  };
}
