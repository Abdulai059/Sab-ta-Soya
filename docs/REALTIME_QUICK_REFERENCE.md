# Real-time Quick Reference Card

## 🚀 Quick Start

### Enable Real-time in Supabase
```bash
1. Go to Supabase Dashboard
2. Database → Replication
3. Enable for: sanitation_reports, report_assignments, service_tasks, profiles
4. Save changes
```

### Verify It's Working
```bash
1. Open your app
2. Open browser console (F12)
3. Look for: 📡 [channel_name] table_name changed: {...}
4. Check navbar for green "Live" badge
```

---

## 📡 Real-time Subscriptions

### Pattern
```javascript
useEffect(() => {
  fetchData();
  
  const channel = supabase
    .channel("unique_channel_name")
    .on("postgres_changes", {
      event: "*",  // or 'INSERT', 'UPDATE', 'DELETE'
      schema: "public",
      table: "table_name",
      // Optional: filter: "column=eq.value"
    }, (payload) => {
      console.log("📡 Change:", payload);
      fetchData(true); // Silent refresh
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [fetchData]);
```

---

## 🎯 Where Real-time is Active

| Page/Feature | Hook | Tables Watched |
|-------------|------|----------------|
| **Assign Workers** | `useAssignWorker` | reports, assignments, tasks, profiles |
| **My Offers** | `useMyOffers` | tasks (filtered), reports, assignments |
| **Dashboard** | `useDashboardData` | reports, assignments |
| **Reports List** | `useReports` | reports |

---

## 🔍 Debugging

### Check Console
```javascript
// Look for these logs:
📡 [assign_reports] sanitation_reports changed: {...}
📡 [my_tasks_123] service_tasks changed: {...}
📡 Real-time connected
📡 Real-time disconnected
```

### Check Network
```bash
1. Open DevTools (F12)
2. Network tab → Filter by "WS"
3. Should see WebSocket connection
4. Status: 101 Switching Protocols
```

### Check Supabase
```bash
1. Dashboard → Database → Replication
2. Verify tables are "Enabled"
3. Logs → Real-time for events
```

---

## ⚡ Common Issues & Fixes

### Issue: Updates not appearing
**Fix**: Enable replication in Supabase Dashboard

### Issue: "Permission denied"
**Fix**: Check RLS policies allow SELECT

### Issue: Connection keeps dropping
**Fix**: Check internet connection, verify Supabase status

### Issue: Memory leak
**Fix**: Ensure cleanup in useEffect return

---

## 🎨 Visual Indicators

### Connection Status Badge
- 🟢 **Green "Live"** = Connected, real-time active
- 🔴 **Red "Offline"** = Disconnected, manual refresh needed
- 📍 **Location**: Top navbar, right side

### Console Logs
- 📡 = Real-time event
- ✅ = Successful operation
- ❌ = Error occurred

---

## 📊 Performance Tips

### 1. Use Filters
```javascript
// ✅ Good: Only your tasks
filter: `assigned_to=eq.${userId}`

// ❌ Bad: All tasks
// No filter
```

### 2. Unique Channels
```javascript
// ✅ Good
channel(`worker_tasks_${userId}`)

// ❌ Bad
channel('tasks')
```

### 3. Silent Refreshes
```javascript
// ✅ Good: No loading spinner
fetchData(true)

// ❌ Bad: Shows skeleton
fetchData()
```

### 4. Cleanup
```javascript
// ✅ Always cleanup
return () => {
  supabase.removeChannel(channel);
};
```

---

## 🧪 Test Scenarios

### Test 1: Worker Accept
```
1. Admin: Open Assign Workers
2. Worker: Open My Offers (different browser)
3. Worker: Click "Accept"
4. ✅ Admin sees "Accepted · In progress" instantly
```

### Test 2: Admin Assign
```
1. Admin: Open Assign Workers
2. Worker: Open My Offers
3. Admin: Assign worker
4. ✅ Worker sees new offer instantly
```

### Test 3: Multi-user
```
1. Admin 1: Open Assign Workers
2. Admin 2: Open Assign Workers (different browser)
3. Admin 1: Make change
4. ✅ Admin 2 sees change instantly
```

---

## 📞 Support

- **Docs**: `/docs/REALTIME.md`
- **Setup**: `/docs/SUPABASE_REALTIME_SETUP.md`
- **Summary**: `/REALTIME_IMPLEMENTATION_SUMMARY.md`
- **Supabase**: https://supabase.com/docs/guides/realtime

---

## ✅ Checklist

Before deploying:
- [ ] Replication enabled for all tables
- [ ] RLS policies allow SELECT
- [ ] Tested worker accept flow
- [ ] Tested admin assign flow
- [ ] Tested multi-user scenario
- [ ] Verified connection indicator works
- [ ] Checked console for 📡 logs
- [ ] Verified WebSocket connection
- [ ] Tested on mobile devices
- [ ] Documented any custom subscriptions

---

**Last Updated**: $(date)  
**Status**: ✅ Production Ready
