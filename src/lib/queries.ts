import { db } from './db';
import { periodSchema } from './validation';
export interface Equipment {
  ideal_for:string;
  included_items:string;
  photo_filename: string | null;
  id: string;
  name: string;
  description: string;
  category: string;
  daily_rate: number | string;
  min_days: number;
  deposit_amount: number | string;
  total: number;
  available: number;
}
export interface Unit {
  id: string;
  equipment_id: string;
  code: string;
  serial: string;
  state: string;
  name: string;
  daily_rate?: number | string;
  min_days?: number;
  deposit_amount?: number | string;
}
export interface Booking {
  whatsapp_consent:boolean;
  id: string;
  unit_id: string;
  starts_at: Date;
  ends_at: Date;
  status: string;
  name: string;
  code: string;
  customer_name: string;
  document: string;
  phone: string;
  address: string;
  notes: string;
  notification_status: string;
  daily_rate: number | string;
  days: number;
  subtotal_amount: number | string;
  freight_amount: number | string;
  discount_amount: number | string;
  deposit_amount: number | string;
  total_amount: number | string;
  payment_method: string;
  payment_status: string;
}
export async function catalogue() {
  return (await db().query<Equipment>(`SELECT e.*,count(u.id)::int AS total,count(u.id) FILTER(WHERE u.state='available')::int AS available FROM equipment e LEFT JOIN units u ON u.equipment_id=e.id GROUP BY e.id ORDER BY e.name`)).rows;
}
export async function units() {return (await db().query<Unit>('SELECT u.*,e.name,e.daily_rate,e.min_days,e.deposit_amount FROM units u JOIN equipment e ON e.id=u.equipment_id ORDER BY e.name,u.code')).rows;}
export async function availableUnits(start:string,end:string) {
  periodSchema.parse({start,end});
  return (await db().query<Unit>(`SELECT u.*,e.name,e.daily_rate,e.min_days,e.deposit_amount FROM units u JOIN equipment e ON e.id=u.equipment_id WHERE u.state='available' AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.unit_id=u.id AND r.status<>'cancelled' AND tstzrange(r.starts_at,r.ends_at,'[)') && tstzrange($1::timestamptz,$2::timestamptz,'[)')) ORDER BY e.name,u.code`,[start,end])).rows;
}
export async function bookings(start?:string,end?:string) {
  const range=start&&end;
  if(range) periodSchema.parse({start,end});
  return (await db().query<Booking>(`SELECT r.*,e.name,u.code,COALESCE(r.customer_snapshot->>'name',c.name) AS customer_name,COALESCE(r.customer_snapshot->>'document',c.document) AS document,COALESCE(r.customer_snapshot->>'phone',c.phone) AS phone,COALESCE(r.customer_snapshot->>'address',c.address) AS address,CASE WHEN r.customer_snapshot IS NOT NULL THEN COALESCE((r.customer_snapshot->>'whatsappConsent')::boolean,false) ELSE c.whatsapp_consent END AS whatsapp_consent,(SELECT n.status FROM notification_outbox n WHERE n.reservation_id=r.id ORDER BY n.created_at DESC LIMIT 1) AS notification_status FROM reservations r JOIN units u ON u.id=r.unit_id JOIN equipment e ON e.id=u.equipment_id JOIN customers c ON c.id=r.customer_id ${range?"WHERE tstzrange(r.starts_at,r.ends_at,'[)') && tstzrange($1::timestamptz,$2::timestamptz,'[)')":''} ORDER BY r.starts_at DESC ${range?'':'LIMIT 500'}`,range?[start,end]:[])).rows;
}
export async function getBookingById(id: string) {
  const res = await db().query<Booking>(`SELECT r.*,e.name,u.code,COALESCE(r.customer_snapshot->>'name',c.name) AS customer_name,COALESCE(r.customer_snapshot->>'document',c.document) AS document,COALESCE(r.customer_snapshot->>'phone',c.phone) AS phone,COALESCE(r.customer_snapshot->>'address',c.address) AS address,CASE WHEN r.customer_snapshot IS NOT NULL THEN COALESCE((r.customer_snapshot->>'whatsappConsent')::boolean,false) ELSE c.whatsapp_consent END AS whatsapp_consent,(SELECT n.status FROM notification_outbox n WHERE n.reservation_id=r.id ORDER BY n.created_at DESC LIMIT 1) AS notification_status FROM reservations r JOIN units u ON u.id=r.unit_id JOIN equipment e ON e.id=u.equipment_id JOIN customers c ON c.id=r.customer_id WHERE r.id=$1`,[id]);
  return res.rows[0] || null;
}

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  link_url: string;
  link_text: string;
  image_filename: string | null;
  badge_text: string;
  sort_order: number;
  active: boolean;
  created_at: Date;
}

export async function getActiveBanners(): Promise<Banner[]> {
  return (
    await db().query<Banner>(
      `SELECT * FROM banners WHERE active = true ORDER BY sort_order ASC, created_at DESC`
    )
  ).rows;
}

export async function getAllBanners(): Promise<Banner[]> {
  return (
    await db().query<Banner>(
      `SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC`
    )
  ).rows;
}

export interface StoreNotice {
  id: number;
  enabled: boolean;
  message: string;
  badge_text: string;
  link_url: string | null;
  link_text: string | null;
  variant: 'warning' | 'info' | 'promo' | 'success';
  animated: boolean;
  updated_at: Date;
}

export async function getStoreNotice(): Promise<StoreNotice> {
  const res = await db().query<StoreNotice>(
    `SELECT * FROM store_notice WHERE id = 1`
  );
  if (res.rows[0]) return res.rows[0];
  return {
    id: 1,
    enabled: true,
    message: 'Catálogo de demonstração · valores e condições sujeitos à confirmação',
    badge_text: 'DEMONSTRAÇÃO',
    link_url: null,
    link_text: null,
    variant: 'warning',
    animated: true,
    updated_at: new Date(),
  };
}


