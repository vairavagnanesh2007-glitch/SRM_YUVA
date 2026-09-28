import json

with open('backend/data/timetables.json', encoding='utf-8') as f:
    data = json.load(f)

print(f"VERIFICATION SUMMARY ({len(data['sections'])} SECTIONS):")
print("=" * 80)
for sec in data['sections']:
    print(f"SECTION: {sec['name']} | BATCH: {sec['batch']} | VENUE: {sec['venue']}")
    print(f"  Subjects detected: {len(sec['subjects'])}")
    labs = []
    total_weekly_slots = 0
    for subj in sec['subjects']:
        days = [s['day'][:3] for s in subj['schedule']]
        total_p = sum(len(s['periods']) for s in subj['schedule'])
        total_weekly_slots += total_p
        is_lab = 'LAB' in subj['slot'] or 'Lab' in subj['name'] or 'Laboratory' in subj['name'] or 'Workshop' in subj['name']
        if is_lab:
            labs.append(f"{subj['code']} ({subj['name'][:22]})")
        print(f"    - [{subj['slot']:<4}] {subj['code']:<10} {subj['name'][:30]:<30} | {total_p} periods/wk | Days: {','.join(days)}")
    print(f"  LABS: {labs}")
    print(f"  Total weekly scheduled class periods: {total_weekly_slots}")
    print("-" * 80)
