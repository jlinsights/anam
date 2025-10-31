-- Admin Views for ANAM Gallery Auto-Sync System
-- Execute this script in your Supabase Dashboard SQL Editor

-- 1. Sync Status View
-- Provides a summary of the current synchronization status
DROP VIEW IF EXISTS public.sync_status;
CREATE VIEW public.sync_status AS
SELECT 
  'airtable'::text as source,
  COALESCE(
    (SELECT last_sync FROM sync_logs 
     WHERE success = true 
     ORDER BY timestamp DESC 
     LIMIT 1), 
    '1970-01-01'::timestamp
  ) as last_sync,
  (SELECT COUNT(*) FROM artworks WHERE airtable_id IS NOT NULL) as total_records,
  (SELECT COUNT(*) FROM sync_logs 
   WHERE success = true 
   AND timestamp >= CURRENT_DATE) as successful_syncs_today,
  (SELECT COUNT(*) FROM sync_logs 
   WHERE success = false 
   AND timestamp >= CURRENT_DATE) as failed_syncs_today,
  (SELECT COUNT(*) FROM sync_logs 
   WHERE timestamp >= CURRENT_DATE) as total_syncs_today,
  CASE 
    WHEN (SELECT COUNT(*) FROM sync_logs 
          WHERE success = false 
          AND timestamp >= CURRENT_DATE) = 0 
    THEN 'healthy'
    WHEN (SELECT COUNT(*) FROM sync_logs 
          WHERE success = false 
          AND timestamp >= CURRENT_DATE) < 5 
    THEN 'warning'
    ELSE 'error'
  END as health_status,
  NOW() as status_timestamp;

-- 2. Recent Sync Operations View
-- Shows the most recent synchronization operations with details
DROP VIEW IF EXISTS public.recent_sync_operations;
CREATE VIEW public.recent_sync_operations AS
SELECT 
  sl.id,
  sl.source,
  sl.operation,
  sl.record_id,
  sl.success,
  sl.error_message,
  sl.timestamp,
  aw.title as artwork_title,
  aw.slug as artwork_slug,
  CASE sl.operation
    WHEN 'create' THEN '새로 생성됨'
    WHEN 'update' THEN '업데이트됨'
    WHEN 'delete' THEN '삭제됨'
    WHEN 'error' THEN '오류 발생'
    ELSE sl.operation
  END as operation_korean
FROM sync_logs sl
LEFT JOIN artworks aw ON sl.record_id = aw.airtable_id
ORDER BY sl.timestamp DESC
LIMIT 100;

-- 3. Sync Error Summary View
-- Provides summary of synchronization errors for monitoring
DROP VIEW IF EXISTS public.sync_error_summary;
CREATE VIEW public.sync_error_summary AS
SELECT 
  DATE(timestamp) as error_date,
  operation,
  error_message,
  COUNT(*) as error_count,
  array_agg(DISTINCT record_id) as affected_records,
  MIN(timestamp) as first_occurrence,
  MAX(timestamp) as last_occurrence
FROM sync_logs 
WHERE success = false 
AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp), operation, error_message
ORDER BY error_date DESC, error_count DESC;

-- 4. Artwork Sync Status View
-- Shows synchronization status for each artwork
DROP VIEW IF EXISTS public.artwork_sync_status;
CREATE VIEW public.artwork_sync_status AS
SELECT 
  aw.id,
  aw.title,
  aw.slug,
  aw.airtable_id,
  aw.created_at,
  aw.updated_at,
  CASE 
    WHEN aw.airtable_id IS NULL THEN 'local_only'
    WHEN sl.timestamp IS NULL THEN 'never_synced'
    WHEN sl.success = true THEN 'synced'
    ELSE 'sync_failed'
  END as sync_status,
  sl.timestamp as last_sync_attempt,
  sl.success as last_sync_success,
  sl.error_message as last_sync_error,
  CASE 
    WHEN aw.airtable_id IS NULL THEN '로컬 전용'
    WHEN sl.timestamp IS NULL THEN '동기화 안됨'
    WHEN sl.success = true THEN '동기화 완료'
    ELSE '동기화 실패'
  END as sync_status_korean
FROM artworks aw
LEFT JOIN LATERAL (
  SELECT timestamp, success, error_message
  FROM sync_logs 
  WHERE record_id = aw.airtable_id 
  ORDER BY timestamp DESC 
  LIMIT 1
) sl ON true
ORDER BY aw.updated_at DESC;

-- 5. Sync Performance Metrics View
-- Provides performance metrics for sync operations
DROP VIEW IF EXISTS public.sync_performance_metrics;
CREATE VIEW public.sync_performance_metrics AS
SELECT 
  DATE(timestamp) as sync_date,
  operation,
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE success = true) as successful_operations,
  COUNT(*) FILTER (WHERE success = false) as failed_operations,
  ROUND(
    (COUNT(*) FILTER (WHERE success = true)::float / COUNT(*)::float * 100), 
    2
  ) as success_rate_percent,
  MIN(timestamp) as first_sync_time,
  MAX(timestamp) as last_sync_time
FROM sync_logs 
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp), operation
ORDER BY sync_date DESC, operation;

-- 6. Grant appropriate permissions
-- Ensure the views are accessible by the service role

GRANT SELECT ON public.sync_status TO service_role;
GRANT SELECT ON public.recent_sync_operations TO service_role;
GRANT SELECT ON public.sync_error_summary TO service_role;
GRANT SELECT ON public.artwork_sync_status TO service_role;
GRANT SELECT ON public.sync_performance_metrics TO service_role;

-- Also grant to authenticated users for admin interface
GRANT SELECT ON public.sync_status TO authenticated;
GRANT SELECT ON public.recent_sync_operations TO authenticated;
GRANT SELECT ON public.sync_error_summary TO authenticated;
GRANT SELECT ON public.artwork_sync_status TO authenticated;
GRANT SELECT ON public.sync_performance_metrics TO authenticated;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sync_logs_timestamp ON sync_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_success ON sync_logs(success);
CREATE INDEX IF NOT EXISTS idx_sync_logs_operation ON sync_logs(operation);
CREATE INDEX IF NOT EXISTS idx_sync_logs_record_id ON sync_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_artworks_airtable_id ON artworks(airtable_id);

-- 8. Create a function to get sync health status
CREATE OR REPLACE FUNCTION get_sync_health()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'overall_status', (
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM sync_logs 
          WHERE success = false 
          AND timestamp >= NOW() - INTERVAL '1 hour'
        ) THEN 'critical'
        WHEN EXISTS (
          SELECT 1 FROM sync_logs 
          WHERE success = false 
          AND timestamp >= NOW() - INTERVAL '6 hours'
        ) THEN 'warning'
        ELSE 'healthy'
      END
    ),
    'last_successful_sync', (
      SELECT MAX(timestamp) FROM sync_logs WHERE success = true
    ),
    'recent_errors', (
      SELECT COUNT(*) FROM sync_logs 
      WHERE success = false 
      AND timestamp >= NOW() - INTERVAL '24 hours'
    ),
    'total_artworks', (
      SELECT COUNT(*) FROM artworks
    ),
    'synced_artworks', (
      SELECT COUNT(*) FROM artworks WHERE airtable_id IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission for the health function
GRANT EXECUTE ON FUNCTION get_sync_health() TO service_role;
GRANT EXECUTE ON FUNCTION get_sync_health() TO authenticated;

-- Success message
SELECT 'Admin views and functions created successfully!' as status;