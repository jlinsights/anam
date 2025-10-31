# Airtable Webhook Setup Guide

Complete guide for setting up real-time synchronization between Airtable and Supabase for the ANAM Gallery.

## Overview

This guide will help you configure Airtable webhooks to automatically sync artwork data to Supabase whenever changes occur in your Airtable base.

## Prerequisites

- ✅ Airtable base with artwork data
- ✅ Supabase database with sync tables
- ✅ Production deployment with webhook endpoints
- ✅ Environment variables configured

## Step 1: Access Airtable Webhook Configuration

1. **Log in to Airtable** at [airtable.com](https://airtable.com)
2. **Open your base** (ANAM Gallery artwork base)
3. **Click on "Automations"** in the top menu
4. **Create new automation** or use the webhook feature

### Alternative: Use Airtable API for Webhook Setup

If automations aren't available, you can set up webhooks via API:

```bash
# Set your Airtable credentials
AIRTABLE_API_KEY="your_api_key_here"
AIRTABLE_BASE_ID="your_base_id_here"
WEBHOOK_URL="https://anam-gallery.vercel.app/api/sync/airtable"
WEBHOOK_SECRET="your_webhook_secret_here"

# Create webhook via API
curl -X POST "https://api.airtable.com/v0/bases/${AIRTABLE_BASE_ID}/webhooks" \
  -H "Authorization: Bearer ${AIRTABLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationUrl": "'${WEBHOOK_URL}'",
    "specification": {
      "options": {
        "filters": {
          "dataTypes": ["tableData"]
        }
      }
    }
  }'
```

## Step 2: Configure Webhook in Airtable Dashboard

### Using Airtable Automations

1. **Create New Automation**
   - Click "Create automation"
   - Choose "When record created/updated/deleted" as trigger
   - Select your "Artworks" table

2. **Configure Trigger**
   - Table: `Artworks`
   - Trigger: `Record created`, `Record updated`, `Record deleted`
   - Fields to watch: All fields (or specific fields you want to sync)

3. **Add Webhook Action**
   - Choose "Webhook" as the action
   - Method: `POST`
   - URL: `https://anam-gallery.vercel.app/api/sync/airtable`
   - Headers:
     ```
     Authorization: Bearer YOUR_WEBHOOK_SECRET
     Content-Type: application/json
     ```

4. **Configure Webhook Payload**
   ```json
   {
     "base": {
       "id": "{{BASE_ID}}"
     },
     "webhook": {
       "id": "airtable-automation"
     },
     "timestamp": "{{TIMESTAMP}}",
     "changedTablesById": {
       "{{TABLE_ID}}": {
         "changedRecordsById": {
           "{{RECORD_ID}}": {
             "current": {
               "id": "{{RECORD_ID}}",
               "createdTime": "{{CREATED_TIME}}",
               "fields": {
                 "작품명": "{{작품명}}",
                 "제작년도": "{{제작년도}}",
                 "재료": "{{재료}}",
                 "규격": "{{규격}}",
                 "작품설명": "{{작품설명}}",
                 "작가의글": "{{작가의글}}",
                 "추천작품": "{{추천작품}}",
                 "분류": "{{분류}}",
                 "판매가능": "{{판매가능}}",
                 "태그": "{{태그}}",
                 "작품번호": "{{작품번호}}"
               }
             }
           }
         }
       }
     }
   }
   ```

## Step 3: Webhook Security Configuration

### Environment Variables

Ensure these are set in your Vercel deployment:

```bash
# In your .env.local or Vercel environment
AIRTABLE_WEBHOOK_SECRET=EbvTwS2uwrHOHqTOyMyEf5h3krIU3negWP1PQoAP0mTZTZoPfn9bvVAW4QE0zoxc
ADMIN_SYNC_TOKEN=NqfbwjnXwUcNOLwidJIxA_R2cuxVdPE6Qfos6gvlnoKZXwuZ5oF1dDwqlfeaPa0e
REVALIDATE_SECRET=anam-gallery-secure-webhook-key-2025
```

### Webhook Authentication

The webhook endpoint uses timing-safe token comparison for security:

1. **Bearer Token**: Include in Authorization header
2. **Secret Verification**: Server validates using crypto.timingSafeEqual
3. **Request Logging**: All requests are logged for monitoring

## Step 4: Test Webhook Setup

### Manual Testing

1. **Test webhook endpoint health**:
   ```bash
   curl -X GET https://anam-gallery.vercel.app/api/sync/airtable
   ```

2. **Test with sample payload**:
   ```bash
   curl -X POST https://anam-gallery.vercel.app/api/sync/airtable \
     -H "Authorization: Bearer EbvTwS2uwrHOHqTOyMyEf5h3krIU3negWP1PQoAP0mTZTZoPfn9bvVAW4QE0zoxc" \
     -H "Content-Type: application/json" \
     -d '{
       "base": {"id": "appnTPahU80ZnGWQO"},
       "webhook": {"id": "test"},
       "timestamp": "2025-01-31T12:00:00.000Z",
       "changedTablesById": {
         "tblArtworks": {
           "changedRecordsById": {
             "recTestRecord": {
               "current": {
                 "id": "recTestRecord",
                 "createdTime": "2025-01-31T12:00:00.000Z",
                 "fields": {
                   "작품명": "테스트 작품",
                   "제작년도": "2024",
                   "재료": "화선지",
                   "작품번호": "99"
                 }
               }
             }
           }
         }
       }
     }'
   ```

### Airtable Testing

1. **Create test record** in your Artworks table
2. **Check webhook logs** in Vercel function logs
3. **Verify data sync** in Supabase dashboard
4. **Update test record** and verify real-time sync
5. **Delete test record** and verify cleanup

## Step 5: Monitor Webhook Performance

### Admin API Monitoring

Check sync status via admin API:

```bash
curl -X GET https://anam-gallery.vercel.app/api/admin/sync \
  -H "Authorization: Bearer NqfbwjnXwUcNOLwidJIxA_R2cuxVdPE6Qfos6gvlnoKZXwuZ5oF1dDwqlfeaPa0e"
```

### Supabase Dashboard Monitoring

Execute in Supabase SQL Editor:

```sql
-- Check recent sync operations
SELECT * FROM recent_sync_operations ORDER BY timestamp DESC LIMIT 20;

-- Check sync health status
SELECT * FROM sync_status;

-- Check for errors
SELECT * FROM sync_error_summary WHERE error_date >= CURRENT_DATE - INTERVAL '7 days';
```

### Vercel Function Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your ANAM Gallery project
3. Navigate to "Functions" tab
4. Check logs for `/api/sync/airtable` function

## Step 6: Webhook Field Mapping

### Airtable → Supabase Field Mapping

| Airtable Field | Supabase Column | Type | Notes |
|----------------|-----------------|------|-------|
| 작품명 | title | text | Primary artwork title |
| 제작년도 | year | integer | Creation year |
| 재료 | medium | text | Art medium/material |
| 규격 | dimensions | text | Artwork dimensions |
| 작품설명 | description | text | Artwork description |
| 작가의글 | artist_note | text | Artist's commentary |
| 추천작품 | featured | boolean | Featured artwork flag |
| 분류 | category | text | Artwork category |
| 판매가능 | available | boolean | Availability status |
| 태그 | tags | text[] | Artwork tags array |
| 작품번호 | image_url | text | Generated image path |

### Automatic Field Generation

The webhook automatically generates:

- **slug**: `anam-XX` format based on artwork number
- **image_url**: `/Images/Artworks/optimized/XX/XX-medium.jpg`
- **created_at**: From Airtable createdTime
- **updated_at**: Current timestamp
- **airtable_id**: Airtable record ID for sync tracking

## Step 7: Troubleshooting

### Common Issues

1. **Webhook not triggering**
   - Check Airtable automation is enabled
   - Verify webhook URL is correct
   - Check network connectivity

2. **Authentication errors (401)**
   - Verify AIRTABLE_WEBHOOK_SECRET is set correctly
   - Check Authorization header format
   - Ensure no extra spaces or newlines in token

3. **Sync failures (500)**
   - Check Supabase database connection
   - Verify table schema matches expected format
   - Check for data type mismatches

4. **Partial sync**
   - Check field mapping in webhook payload
   - Verify all required fields are included
   - Check for field name changes in Airtable

### Debug Commands

```bash
# Test environment variables
curl -X GET https://anam-gallery.vercel.app/api/test-env

# Test Airtable connection
curl -X GET https://anam-gallery.vercel.app/api/test-airtable

# Manual full sync
curl -X POST https://anam-gallery.vercel.app/api/admin/sync \
  -H "Authorization: Bearer NqfbwjnXwUcNOLwidJIxA_R2cuxVdPE6Qfos6gvlnoKZXwuZ5oF1dDwqlfeaPa0e"
```

### Support Resources

- **Airtable API Documentation**: [airtable.com/api](https://airtable.com/api)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Function Logs**: Available in Vercel dashboard
- **Admin Monitoring**: Use admin API endpoints for sync status

## Success Checklist

- [ ] Webhook endpoint responds with 200 status
- [ ] Authentication works with Bearer token
- [ ] Test record creation syncs to Supabase
- [ ] Test record update syncs changes
- [ ] Test record deletion removes from Supabase
- [ ] Admin API shows successful sync operations
- [ ] Cache revalidation updates frontend
- [ ] Error logging works for failed operations

## Security Notes

- **Never expose webhook secrets** in client-side code
- **Use HTTPS only** for webhook URLs
- **Monitor webhook logs** for suspicious activity
- **Rotate secrets regularly** for security
- **Limit webhook permissions** to necessary operations only

---

**Setup completed successfully!** Your Airtable base will now automatically sync changes to Supabase in real-time.