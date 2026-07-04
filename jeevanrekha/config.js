/* Jeevanरेखा — runtime configuration.
   Loaded BEFORE index.html's main script. Edit this file (or override on the
   hosting platform) to wire up real keys. Everything degrades gracefully if a
   key is missing — the feature shows a helpful message instead of erroring.

   The Supabase anon key is safe to expose in client JS (it relies on RLS).
   Never put a service-role key here.
*/
window.JEEVAN_CONFIG = {
  /* Supabase — used by Volunteer Network and Incident Report
     Create a project at supabase.com, then paste the URL + anon key below.
     Required tables (see README):
       - volunteers (id, name, phone, lat, lng, skills text[], available bool, last_active timestamptz)
       - incidents  (id, started_at, triage, accident_type, coords jsonb, answers jsonb, timeline jsonb, text, address)
  */
  supabase: {
    url: "https://geddqibrkmnlomjgvcmx.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZGRxaWJya21ubG9tamd2Y214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTIzOTQsImV4cCI6MjA5NDIyODM5NH0.d3cfUx_62ISHgeitUVmjPiOb87hEyXY-VtX_LTW3BYE",
  },

  /* Private ambulance fallback — Dial4242 default; override if you have a local provider. */
  privateAmbulance: {
    phone: "1800-313-4242",
    label: "Book Private Ambulance (Dial 4242)",
  },

  /* National emergency WhatsApp endpoint */
  emergencyWhatsApp: {
    phone: "+911",   // wa.me/+911 — national emergency
    label: "Alert via WhatsApp",
  },

  /* Backup video room URL — used if Jitsi fails for some reason */
  videoBackupUrl: "https://meet.google.com/new",

  /* Medical review attribution.
     When a clinician reviews the protocol library, fill in their details and
     list the protocol IDs they've signed off on. The UI shows a "Reviewed by..."
     badge on About and a small pill next to each reviewed protocol's title.
     Leave fields blank to display the "Not yet clinically reviewed" amber state. */
  medicalReview: {
    reviewer: "",          // e.g. "Dr Asha Iyer"
    credentials: "",       // e.g. "MBBS, MD Emergency Medicine"
    organisation: "",      // e.g. "KEM Hospital, Mumbai"
    reviewedOn: "",        // ISO date "2026-05-10"
    reviewedProtocols: [], // ["cpr","severe-bleeding","choking", ...]
  },

  /* Feature flags — flip any to false to hide that integration. */
  features: {
    multilingual: true,
    hospitalFinder: true,
    ambulanceDispatch: true,
    policeAlert: true,
    bloodBroadcast: true,
    volunteerNetwork: true,   // requires supabase.url + anonKey
    incidentReport: true,
    videoConsult: true,
  },
};
