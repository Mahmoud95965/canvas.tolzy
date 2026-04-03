export interface Site {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  project_data: Record<string, unknown>;
  html_content: string;
  css_content: string;
  react_files: Record<string, string>;
  favicon_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSitePayload {
  name: string;
  subdomain: string;
}

export interface UpdateSitePayload {
  name?: string;
  subdomain?: string;
  project_data?: Record<string, unknown>;
  html_content?: string;
  css_content?: string;
  react_files?: Record<string, string>;
  favicon_url?: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
}
