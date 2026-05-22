# Supabase Real-time Setup Guide

## Prerequisites

- Supabase project created
- Database tables created
- Application connected to Supabase

## Step 1: Enable Replication

Real-time in Supabase uses PostgreSQL's replication feature. You need to enable it for each table.

### Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the following tables and toggle replication **ON**:
   - ✅ `sanitation_reports`
   - ✅ `report_assignments`
   - ✅ `service_tasks`
   - ✅ `profiles`
   - ✅ `locations` (optional, for location updates)
   - ✅ `communities` (optional, for community updates)
   - ✅ `climate_events` (optional, for climate event updates)

4. Click **Save** or **Apply Changes**

### Via SQL (Alternative Method)

If you prefer SQL, run this in the SQL Editor:

```sql
-- Enable replication for sanitation_reports
ALTER TABLE public.sanitation_reports REPLICA IDENTITY FULL;

-- Enable replication for report_assignments
ALTER TABLE public.report_assignments REPLICA IDENTITY FULL;

-- Enable replication for service_tasks
ALTER TABLE public.service_tasks REPLICA IDENTITY FULL;

-- Enable replication for profiles
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Optional: Enable for other tables
ALTER TABLE public.locations REPLICA IDENTITY FULL;
ALTER TABLE public.communities REPLICA IDENTITY FULL;
ALTER TABLE public.climate_events REPLICA IDENTITY FULL;
```

## Step 2: Verify Real-time is Enabled

### Check in Dashboard

1. Go to **Database** → **Replication**
2. Verify all tables show **Enabled** status
3. Look for a green checkmark or "Active" indicator

### Test with Browser Console

1. Open your application
2. Open browser DevTools (F12)
3. Go to the **Console** tab
4. Look for messages like:
   ```
   📡 [channel_name] table_name changed: {...}
   ```

### Test with Network Tab

1. Open browser DevTools (F12)
2. Go to the **Network** tab
3. Filter by **WS** (WebSocket)
4. You should see a WebSocket connection to Supabase
5. Status should be **101 Switching Protocols** (successful)

## Step 3: Configure Row Level Security (RLS)

Real-time respects RLS policies. Ensure your policies allow the operations you need.

### Example: Allow authenticated users to read reports

```sql
-- Policy for reading reports
CREATE POLICY "Users can view reports"
ON public.sanitation_reports
FOR SELECT
TO authenticated
USING (true);

-- Policy for reading assignments
CREATE POLICY "Users can view assignments"
ON public.report_assignments
FOR SELECT
TO authenticated
USING (true);

-- Policy for reading tasks
CREATE POLICY "Workers can view their tasks"
ON public.service_tasks
FOR SELECT
TO authenticated
USING (assigned_to = auth.uid());
```

## Step 4: Test Real-time Updates

### Test 1: Simple Update

1. Open your application (e.g., Assign Workers page)
2. Open Supabase Dashboard → Table Editor
3. Update a row in `sanitation_reports`
4. Check if the UI updates automatically (no refresh needed)

### Test 2: Worker Accept Flow

1. **Admin**: Open Assign Workers page
2. **Admin**: Assign a worker to a report
3. **Worker**: Open My Offers page (in another browser/tab)
4. **Worker**: Accept the offer
5. **Admin**: Should see status change to "Accepted · In progress" instantly

### Test 3: Multi-user Scenario

1. Open the app in two different browsers (or incognito)
2. Log in as different users
3. Make changes in one browser
4. Verify changes appear in the other browser instantly

## Troubleshooting

### Issue: Real-time not working

**Solution 1: Check Replication**
- Verify replication is enabled for all tables
- Check Supabase logs for replication errors

**Solution 2: Check RLS Policies**
- Ensure RLS policies allow SELECT operations
- Test with RLS disabled temporarily (for debugging only)

**Solution 3: Check WebSocket Connection**
- Open Network tab → Filter by WS
- Verify WebSocket connection is established
- Check for connection errors

**Solution 4: Check Supabase Plan**
- Free tier has limits on concurrent connections
- Upgrade if you hit the limit

### Issue: Updates are delayed

**Possible Causes**:
- Network latency
- Too many subscriptions (optimize channels)
- Database under heavy load

**Solutions**:
- Reduce number of active subscriptions
- Use filters to limit events
- Optimize database queries

### Issue: Memory leaks

**Cause**: Subscriptions not cleaned up

**Solution**: Ensure cleanup in useEffect:
```javascript
useEffect(() => {
  const channel = supabase.channel(...).subscribe();
  
  // ✅ Always cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Performance Tips

### 1. Use Filters

Instead of subscribing to all rows:
```javascript
// ❌ Bad: Receives all task changes
.on('postgres_changes', { table: 'service_tasks' }, callback)

// ✅ Good: Only receives changes for this user
.on('postgres_changes', { 
  table: 'service_tasks',
  filter: 'assigned_to=eq.123'
}, callback)
```

### 2. Unique Channel Names

Use unique channel names to prevent conflicts:
```javascript
// ✅ Good
const channel = supabase.channel(`worker_tasks_${userId}`)

// ❌ Bad: Same channel name everywhere
const channel = supabase.channel('tasks')
```

### 3. Debounce Refetches

If multiple changes happen rapidly, debounce the refetch:
```javascript
const debouncedFetch = debounce(fetchData, 500);

.on('postgres_changes', config, () => {
  debouncedFetch();
})
```

### 4. Silent Refreshes

Don't show loading spinners for real-time updates:
```javascript
// ✅ Good: Silent refresh
fetchData(true); // silent = true

// ❌ Bad: Shows loading spinner
fetchData(); // Shows skeleton loader
```

## Monitoring

### Check Active Connections

In Supabase Dashboard:
1. Go to **Settings** → **API**
2. Check **Real-time** section
3. View active connections count

### Check Logs

In Supabase Dashboard:
1. Go to **Logs** → **Real-time**
2. Look for connection/disconnection events
3. Check for errors

### Browser Console

Look for these logs:
```
📡 [channel_name] table_name changed: { eventType: 'UPDATE', ... }
```

## Limits

### Free Tier
- 2 concurrent connections
- 500 MB database size
- Unlimited API requests

### Pro Tier
- 500 concurrent connections
- 8 GB database size
- Unlimited API requests

### Enterprise
- Unlimited connections
- Custom database size
- Dedicated support

## Next Steps

1. ✅ Enable replication for all tables
2. ✅ Test real-time updates
3. ✅ Configure RLS policies
4. ✅ Monitor performance
5. ✅ Optimize subscriptions
6. 📚 Read [Supabase Real-time Docs](https://supabase.com/docs/guides/realtime)

## Support

- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Docs](https://supabase.com/docs)
