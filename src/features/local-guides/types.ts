export interface LocalGuideRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image_url: string | null;
  document_url: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
}
